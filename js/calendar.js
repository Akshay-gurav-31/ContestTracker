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
  document.getElementById('prev-month').onclick = () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    updateMonthDisplay(currentMonth, currentYear);
    generateCalendar(currentMonth, currentYear, contests);
  };

  document.getElementById('next-month').onclick = () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    updateMonthDisplay(currentMonth, currentYear);
    generateCalendar(currentMonth, currentYear, contests);
  };
}

/**
 * Update the month and year display
 */
function updateMonthDisplay(month, year) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
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

  // Add previous month's days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const date = new Date(year, month - 1, dayNum);
    const dayEvents = getContestsForDate(date, contests);
    calendarEl.appendChild(createDayElement(dayNum, dayEvents, true));
  }

  // Add current month's days
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const dayEvents = getContestsForDate(date, contests);
    calendarEl.appendChild(createDayElement(day, dayEvents, false, isToday));
  }

  // Add next month's days to fill 6 rows (42 days)
  const totalDaysShown = startingDayOfWeek + daysInMonth;
  const remainingDays = 42 - totalDaysShown;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    const dayEvents = getContestsForDate(date, contests);
    calendarEl.appendChild(createDayElement(day, dayEvents, true));
  }
}

/**
 * Create a single day element for the calendar
 */
function createDayElement(day, events, isOtherMonth, isToday = false) {
  const dayEl = document.createElement('div');
  dayEl.className = 'calendar-day border border-slate-100 dark:border-slate-800/50 flex flex-col gap-1';
  if (isOtherMonth) dayEl.classList.add('other-month');
  if (isToday) dayEl.classList.add('today');

  const dayHeader = document.createElement('div');
  dayHeader.className = 'date-number text-slate-500 dark:text-slate-400';
  dayHeader.textContent = day;
  dayEl.appendChild(dayHeader);

  if (events && events.length > 0) {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'date-events';

    events.slice(0, 4).forEach(event => {
      const dot = document.createElement('div');
      const platformClass = (event.platform || '').toLowerCase().replace(/\s+/g, '');
      dot.className = `date-event-dot ${platformClass}`;
      dotsContainer.appendChild(dot);
    });

    if (events.length > 4) {
      const moreDot = document.createElement('div');
      moreDot.className = 'date-event-dot';
      moreDot.style.backgroundColor = '#94a3b8';
      dotsContainer.appendChild(moreDot);
    }

    dayEl.appendChild(dotsContainer);

    const popover = document.createElement('div');
    popover.className = 'calendar-popover';

    const popoverDate = document.createElement('div');
    popoverDate.className = 'popover-date';
    popoverDate.textContent = formatDate(events[0].startTime);
    popover.appendChild(popoverDate);

    const popoverEvents = document.createElement('div');
    popoverEvents.className = 'popover-events';

    events.forEach(event => {
      const pEvent = document.createElement('div');
      pEvent.className = 'popover-event';

      const platformClass = (event.platform || '').toLowerCase().replace(/\s+/g, '');

      pEvent.innerHTML = `
        <span class="popover-event-platform ${platformClass}">${event.platform}</span>
        <span class="popover-event-name">${event.name}</span>
        <span class="popover-event-time">${formatTime(event.startTime)}</span>
      `;
      popoverEvents.appendChild(pEvent);
    });

    popover.appendChild(popoverEvents);
    dayEl.appendChild(popover);
  }

  return dayEl;
}

function getContestsForDate(date, contests) {
  return contests.filter(contest => {
    const d = new Date(contest.startTime);
    return d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear();
  });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}


