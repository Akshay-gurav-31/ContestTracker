
// Calendar functionality

/**
 * Initialize the calendar with contest data
 * @param {Array} contests Array of contest objects
 */
export function initCalendar(contests) {
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  // Update month display
  updateMonthDisplay(currentMonth, currentYear);

  // Generate calendar for current month
  generateCalendar(currentMonth, currentYear, contests);

  // Set up next/prev month buttons
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');

  if (prevBtn) {
    prevBtn.onclick = () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      updateMonthDisplay(currentMonth, currentYear);
      generateCalendar(currentMonth, currentYear, contests);
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      updateMonthDisplay(currentMonth, currentYear);
      generateCalendar(currentMonth, currentYear, contests);
    };
  }

  // --- Robust Dynamic Popup Positioning Logic ---
  const calendarEl = document.getElementById('calendar');
  if (calendarEl) {
    calendarEl.onmouseover = (e) => {
      const dayCell = e.target.closest('.calendar-day');
      if (!dayCell) return;

      const popover = dayCell.querySelector('.calendar-popover');
      if (!popover) return;

      // Only show if there are events
      const eventDots = dayCell.querySelector('.date-events');
      if (!eventDots || eventDots.children.length === 0) return;

      // 1. Show and prepare for measurement
      popover.style.display = 'block';
      popover.style.visibility = 'hidden';
      popover.style.position = 'fixed';
      popover.classList.add('visible');

      const triggerRect = dayCell.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();

      // Make it actually visible now that we have the size
      popover.style.visibility = 'visible';
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 10;

      let left = triggerRect.left + (triggerRect.width / 2) - (popoverRect.width / 2);
      let top = triggerRect.top - popoverRect.height - 12;

      // Rock-solid Clamping
      left = Math.max(margin, Math.min(left, viewportWidth - popoverRect.width - margin));

      if (top < margin) {
        top = triggerRect.bottom + 12; // Flipping below 
        if (top + popoverRect.height > viewportHeight - margin) {
          top = viewportHeight - popoverRect.height - margin;
        }
      }

      // Final sanity check for bottom overflow
      if (top + popoverRect.height > viewportHeight - margin) {
        top = viewportHeight - popoverRect.height - margin;
      }

      popover.style.left = `${Math.round(left)}px`;
      popover.style.top = `${Math.round(top)}px`;
    };

    calendarEl.onmouseout = (e) => {
      const dayCell = e.target.closest('.calendar-day');
      if (!dayCell) return;
      if (dayCell.contains(e.relatedTarget)) return;

      const popover = dayCell.querySelector('.calendar-popover');
      if (popover) {
        popover.classList.remove('visible');
        popover.style.display = 'none'; // Instant hide
      }
    };

    calendarEl.onmouseleave = () => {
      document.querySelectorAll('.calendar-popover').forEach(p => {
        p.classList.remove('visible');
        p.style.display = 'none'; // Instant hide
      });
    };
  }
}

/**
 * Update the month and year display
 * @param {number} month Month number (0-11)
 * @param {number} year Year
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
 * @param {number} month Month number (0-11)
 * @param {number} year Year
 * @param {Array} contests Array of contest objects
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
 * @param {number} day Day number
 * @param {Date} date Date object
 * @param {Array} events Contests for this date
 * @param {boolean} otherMonth Whether date is from previous/next month
 * @param {boolean} isToday Whether date is today
 * @param {number} dayOfWeek Day of week (0-6)
 * @returns {string} HTML string
 */
function createCalendarDateHTML(day, date, events, otherMonth = false, isToday = false, dayOfWeek = 0) {
  const classNames = ['calendar-day', `col-${dayOfWeek}`];
  if (otherMonth) classNames.push('other-month');
  if (isToday) classNames.push('today');

  let eventDotsHTML = events.map(e => `<div class="date-event-dot ${e.platform.toLowerCase()}" style="background-color: ${getPlatformColor(e.platform)}"></div>`).join('');
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
 * @param {string} platform Platform name
 * @returns {string} Hex color
 */
function getPlatformColor(platform) {
  const colors = {
    'leetcode': '#2559f4',
    'codechef': '#f09c42',
    'gfg': '#2ecc71',
    'codeforces': '#e74c3c'
  };
  return colors[platform.toLowerCase()] || '#94a3b8';
}

/**
 * Get contests occurring on a specific date
 * @param {Date} date Date object
 * @param {Array} contests Array of contests
 * @returns {Array} Filtered contests
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
 * @param {Date} date Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Format time for display
 * @param {Date|string} date Date object or string
 * @returns {string} Formatted time string
 */
function formatTime(date) {
  return new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Capitalize first letter of a string
 * @param {string} string String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
