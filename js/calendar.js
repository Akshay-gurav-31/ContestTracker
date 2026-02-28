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

  // --- ✅ FIXED: Global Robust Popover Positioning ---
  const calendarEl = document.getElementById('calendar');
  const globalPopover = document.getElementById('calendar-global-popover');

  if (calendarEl && globalPopover) {
    calendarEl.onmouseover = (e) => {
      const dayCell = e.target.closest('.calendar-day');
      if (!dayCell) return;

      const eventsData = dayCell.getAttribute('data-events');
      if (!eventsData) return;

      const events = JSON.parse(eventsData);
      if (events.length === 0) return;

      const dateStr = dayCell.getAttribute('data-date-str');

      // Step 1: Populate Global Popover
      globalPopover.innerHTML = `
        <div class="calendar-popover-date">${dateStr}</div>
        <div class="calendar-popover-events">
          ${events.map(e => `
            <div class="popover-event" style="--accent-color: ${getPlatformColor(e.platform)}">
              <div class="popover-event-platform" style="color: ${getPlatformColor(e.platform)}">${e.platform.toUpperCase()}</div>
              <div class="popover-event-name">${e.name}</div>
              <div class="popover-event-time">${formatTime(e.startTime)} - ${formatTime(e.endTime)}</div>
            </div>
          `).join('')}
        </div>
      `;

      // Step 2: Show to measure
      globalPopover.style.display = 'block';
      globalPopover.classList.add('visible');

      const triggerRect = dayCell.getBoundingClientRect();
      const popoverWidth = globalPopover.offsetWidth;
      const popoverHeight = globalPopover.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 16;

      // ✅ Step 3: Smart Horizontal Position
      let left = triggerRect.right + 12;
      // If overflows right, try left
      if (left + popoverWidth > viewportWidth - margin) {
        left = triggerRect.left - popoverWidth - 12;
      }
      // Hard clamp
      left = Math.max(margin, Math.min(left, viewportWidth - popoverWidth - margin));

      // ✅ Step 4: Smart Vertical Position
      let top = triggerRect.top;
      // If overflows bottom, align to bottom of cell
      if (top + popoverHeight > viewportHeight - margin) {
        top = triggerRect.bottom - popoverHeight;
      }
      // Hard clamp
      top = Math.max(margin, Math.min(top, viewportHeight - popoverHeight - margin));

      globalPopover.style.left = `${Math.round(left)}px`;
      globalPopover.style.top = `${Math.round(top)}px`;
    };

    calendarEl.onmouseout = (e) => {
      const dayCell = e.target.closest('.calendar-day');
      if (!dayCell || dayCell.contains(e.relatedTarget)) return;
      globalPopover.classList.remove('visible');
    };

    calendarEl.onmouseleave = () => {
      globalPopover.classList.remove('visible');
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

  // Store events as data attribute for the global popover
  const eventsData = JSON.stringify(events).replace(/"/g, '&quot;');
  const dateStr = formatDate(date);

  return `
    <div class="${classNames.join(' ')}" data-events="${eventsData}" data-date-str="${dateStr}">
      <div class="date-number">${day}</div>
      <div class="date-events text-center flex flex-wrap gap-1 justify-center">${eventDotsHTML}</div>
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