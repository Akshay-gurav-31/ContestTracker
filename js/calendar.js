// Calendar functionality

/**
 * Initialize the calendar with contest data
 * @param {Array} contests Array of contest objects
 */
export function initCalendar(contests) {
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  updateMonthDisplay(currentMonth, currentYear);
  generateCalendar(currentMonth, currentYear, contests);

  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');

  if (prevBtn) {
    prevBtn.onclick = () => {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      updateMonthDisplay(currentMonth, currentYear);
      generateCalendar(currentMonth, currentYear, contests);
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      updateMonthDisplay(currentMonth, currentYear);
      generateCalendar(currentMonth, currentYear, contests);
    };
  }

  // --- ✅ FIXED: Robust Dynamic Popup Positioning ---
  const calendarEl = document.getElementById('calendar');
  if (calendarEl) {

    calendarEl.onmouseover = (e) => {
      const dayCell = e.target.closest('.calendar-day');
      if (!dayCell) return;

      const popover = dayCell.querySelector('.calendar-popover');
      if (!popover) return;

      const eventDots = dayCell.querySelector('.date-events');
      if (!eventDots || eventDots.children.length === 0) return;

      // Step 1: Show invisibly to measure size
      popover.style.visibility = 'hidden';
      popover.style.display = 'block';
      popover.style.position = 'fixed';
      popover.style.left = '0px';
      popover.style.top = '0px';

      // Step 2: Measure
      const triggerRect = dayCell.getBoundingClientRect();
      const popoverWidth = popover.offsetWidth;
      const popoverHeight = popover.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 10;

      // ✅ Step 3: Smart Left — prefer RIGHT side of cell
      let left = triggerRect.right + 8;

      // Agar right mein fit nahi hota → left side mein dikhao
      if (left + popoverWidth > viewportWidth - margin) {
        left = triggerRect.left - popoverWidth - 8;
      }

      // Hard clamp — kabhi off-screen nahi jayega
      left = Math.max(margin, Math.min(left, viewportWidth - popoverWidth - margin));

      // ✅ Step 4: Smart Top — cell ke saath align karo
      let top = triggerRect.top;

      // Agar neeche overflow ho → upar se align karo
      if (top + popoverHeight > viewportHeight - margin) {
        top = triggerRect.bottom - popoverHeight;
      }

      // Hard clamp
      top = Math.max(margin, Math.min(top, viewportHeight - popoverHeight - margin));

      // Step 5: Apply aur show karo
      popover.style.left = `${Math.round(left)}px`;
      popover.style.top = `${Math.round(top)}px`;
      popover.style.visibility = 'visible';
      popover.classList.add('visible');
    };

    calendarEl.onmouseout = (e) => {
      const dayCell = e.target.closest('.calendar-day');
      if (!dayCell) return;
      if (dayCell.contains(e.relatedTarget)) return;

      const popover = dayCell.querySelector('.calendar-popover');
      if (popover) {
        popover.classList.remove('visible');
        popover.style.display = 'none';
      }
    };

    calendarEl.onmouseleave = () => {
      document.querySelectorAll('.calendar-popover').forEach(p => {
        p.classList.remove('visible');
        p.style.display = 'none';
      });
    };
  }
}

/**
 * Update the month and year display
 */
function updateMonthDisplay(month, year) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthEl = document.getElementById('current-month');
  if (monthEl) {
    monthEl.textContent = `${monthNames[month]} ${year}`;
  }
}

/**
 * Generate calendar for specified month and year
 */
function generateCalendar(month, year, contests) {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  calendarEl.innerHTML = '';
  const today = new Date();

  // Previous month filling
  const prevMonthDate = new Date(year, month, 0);
  const prevMonthDays = prevMonthDate.getDate();
  for (let i = 0; i < startingDayOfWeek; i++) {
    const day = prevMonthDays - startingDayOfWeek + i + 1;
    const date = new Date(year, month - 1, day);
    calendarEl.innerHTML += createCalendarDateHTML(day, date, getContestsForDate(date, contests), true, false, i);
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const dayOfWeek = (startingDayOfWeek + day - 1) % 7;
    calendarEl.innerHTML += createCalendarDateHTML(day, date, getContestsForDate(date, contests), false, isToday, dayOfWeek);
  }

  // Next month filling
  const cellsFilled = startingDayOfWeek + daysInMonth;
  const daysToAdd = 42 - cellsFilled;
  for (let day = 1; day <= daysToAdd; day++) {
    const date = new Date(year, month + 1, day);
    const dayOfWeek = (startingDayOfWeek + daysInMonth + day - 1) % 7;
    calendarEl.innerHTML += createCalendarDateHTML(day, date, getContestsForDate(date, contests), true, false, dayOfWeek);
  }
}

/**
 * Create HTML for a calendar date cell
 */
function createCalendarDateHTML(day, date, events, otherMonth = false, isToday = false, dayOfWeek = 0) {
  const classNames = ['calendar-day', `col-${dayOfWeek}`];
  if (otherMonth) classNames.push('other-month');
  if (isToday) classNames.push('today');

  // ✅ Unique dots per platform (no duplicates)
  const seenPlatforms = new Set();
  let eventDotsHTML = '';
  events.forEach(e => {
    const platform = e.platform.toLowerCase();
    if (!seenPlatforms.has(platform)) {
      seenPlatforms.add(platform);
      eventDotsHTML += `<div class="date-event-dot ${platform}" style="background-color: ${getPlatformColor(platform)}"></div>`;
    }
  });

  let popoverHTML = '';
  if (events.length > 0) {
    popoverHTML = `
      <div class="calendar-popover">
        <div class="calendar-popover-date">${formatDate(date)}</div>
        <div class="calendar-popover-events">
          ${events.map(e => `
            <div class="popover-event" style="--accent-color: ${getPlatformColor(e.platform)}">
              <div class="popover-event-platform" style="color: ${getPlatformColor(e.platform)}">${e.platform.toUpperCase()}</div>
              <div class="popover-event-name">${e.name}</div>
              <div class="popover-event-time">${formatTime(e.startTime)} - ${formatTime(e.endTime)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="${classNames.join(' ')}">
      <div class="date-number">${day}</div>
      <div class="date-events text-center flex flex-wrap gap-1 justify-center">${eventDotsHTML}</div>
      ${popoverHTML}
    </div>
  `;
}

/**
 * Get color for a platform
 */
function getPlatformColor(platform) {
  const colors = {
    'leetcode': '#e74c3c',
    'codechef': '#f09c42',
    'gfg': '#2ecc71',
    'codeforces': '#2559f4'
  };
  return colors[platform.toLowerCase()] || '#94a3b8';
}

/**
 * Get contests occurring on a specific date
 */
function getContestsForDate(date, contests) {
  if (!contests) return [];
  return contests.filter(c => {
    const d = new Date(c.startTime);
    return d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear();
  });
}

/**
 * Format date for display
 */
function formatDate(date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Format time for display
 */
function formatTime(date) {
  return new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}