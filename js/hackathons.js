/**
 * Hackathons functionality
 * Manages local storage for custom events and renders them with premium UI
 */

/**
 * Initialize hackathons functionality
 */
export function initHackathons() {
  // Load existing hackathons from localStorage
  loadHackathons();

  // Add event listener for the add event button
  const addEventBtn = document.getElementById('add-event-btn');
  if (addEventBtn) {
    addEventBtn.addEventListener('click', addNewEvent);
  }

  // Initialize filters
  initializeFilters();

  // Update statistics
  updateStatistics();
}

/**
 * Initialize filter buttons
 */
function initializeFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class from siblings
      const group = btn.closest('.filter-options');
      if (group) {
        group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      }

      // Add active class to clicked button
      btn.classList.add('active');

      // Apply filters
      applyFilters();
    });
  });
}

/**
 * Apply selected filters to events list
 */
function applyFilters() {
  const typeActive = document.querySelector('.filter-btn[data-type].active');
  const timeActive = document.querySelector('.filter-btn[data-time].active');

  const typeFilter = typeActive ? typeActive.dataset.type : 'all';
  const timeFilter = timeActive ? timeActive.dataset.time : 'all';

  const events = getHackathons();
  const now = new Date();

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);

    // Type filter
    if (typeFilter !== 'all' && event.type !== typeFilter) {
      return false;
    }

    // Time filter
    if (timeFilter === 'today') {
      return isSameDay(eventDate, now);
    } else if (timeFilter === 'week') {
      return isThisWeek(eventDate);
    } else if (timeFilter === 'month') {
      return isSameMonth(eventDate, now);
    }

    return true;
  });

  renderHackathons(filteredEvents);
}

/**
 * Add a new event from the form
 */
function addNewEvent() {
  const name = document.getElementById('event-name')?.value;
  const organizer = document.getElementById('event-organizer')?.value;
  const startTime = document.getElementById('event-start')?.value;
  const endTime = document.getElementById('event-end')?.value;
  const url = document.getElementById('event-url')?.value;
  const description = document.getElementById('event-description')?.value;
  const type = document.getElementById('event-type')?.value;
  const location = document.getElementById('event-location')?.value;
  const prize = document.getElementById('event-prize')?.value;

  if (!name || !startTime || !endTime) {
    alert('Please fill in all required fields (Name, Start Time, End Time)');
    return;
  }

  addHackathon({
    name,
    organizer,
    startTime,
    endTime,
    url,
    description,
    type,
    location,
    prize
  });

  // Clear form
  const fields = ['event-name', 'event-organizer', 'event-start', 'event-end', 'event-url', 'event-description', 'event-location', 'event-prize'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const typeEl = document.getElementById('event-type');
  if (typeEl) typeEl.value = 'hackathon';

  // Update statistics
  updateStatistics();
}

/**
 * Delete a hackathon from the list
 * @param {string} id Hackathon ID to delete
 */
export function deleteHackathon(id) {
  if (!confirm('Are you sure you want to delete this event?')) {
    return;
  }

  const hackathons = getHackathons();
  const updatedHackathons = hackathons.filter(h => h.id !== id);

  // Save to localStorage
  localStorage.setItem('hackathons', JSON.stringify(updatedHackathons));

  // Re-render hackathons
  renderHackathons(updatedHackathons);
  updateNextEvent();
  updateStatistics();
}

/**
 * Add a new hackathon to storage
 * @param {Object} hackathon Hackathon object
 */
function addHackathon(hackathon) {
  const hackathons = getHackathons();
  hackathons.push({
    ...hackathon,
    id: Date.now().toString()
  });

  // Sort hackathons by start time
  hackathons.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  // Save to localStorage
  localStorage.setItem('hackathons', JSON.stringify(hackathons));

  // Render hackathons
  renderHackathons(hackathons);
  updateNextEvent();
}

/**
 * Get hackathons from localStorage
 * @returns {Array} Array of hackathon objects
 */
export function getHackathons() {
  const hackathons = localStorage.getItem('hackathons');
  return hackathons ? JSON.parse(hackathons) : [];
}

/**
 * Load and render all stored hackathons
 */
function loadHackathons() {
  const hackathons = getHackathons();
  renderHackathons(hackathons);
  updateNextEvent();
}

/**
 * Update the featured "Next Event" display and countdown
 */
function updateNextEvent() {
  const nextEventEl = document.getElementById('next-event');
  if (!nextEventEl) return;

  const hackathons = getHackathons();
  const now = new Date();
  const upcomingEvents = hackathons.filter(h => new Date(h.startTime) > now);

  if (upcomingEvents.length === 0) {
    nextEventEl.innerHTML = '<div class="no-events text-slate-400">No upcoming events found. Add your first hackathon!</div>';
    nextEventEl.className = 'relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900/50 p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800';
    return;
  }

  const nextEvent = upcomingEvents[0];
  const startTime = new Date(nextEvent.startTime);

  nextEventEl.innerHTML = `
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,102,255,0.7),transparent_60%)] bg-slate-950 z-10 pointer-events-none"></div>
    <div class="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/40 blur-[100px] z-0 pointer-events-none"></div>
    <div class="event-card featured relative z-20 w-full">
      <div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-md">
        <span class="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
        Next Custom Event: ${capitalizeFirstLetter(nextEvent.type)}
      </div>
      <h3 class="text-3xl md:text-4xl font-black text-white mb-2">${nextEvent.name}</h3>
      ${nextEvent.organizer ? `<div class="text-white/60 font-medium mb-4 flex items-center gap-2"><span class="material-symbols-outlined !text-sm">corporate_fare</span> Organized by ${nextEvent.organizer}</div>` : ''}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <span class="material-symbols-outlined text-primary">calendar_today</span>
          <div>
            <p class="text-[9px] uppercase font-bold text-white/40 tracking-widest">Date & Time</p>
            <p class="text-sm font-bold text-white">${formatDateTime(startTime)}</p>
          </div>
        </div>
        ${nextEvent.location ? `
        <div class="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <span class="material-symbols-outlined text-primary">location_on</span>
          <div>
            <p class="text-[9px] uppercase font-bold text-white/40 tracking-widest">Location</p>
            <p class="text-sm font-bold text-white truncate max-w-[200px]">${nextEvent.location}</p>
          </div>
        </div>` : ''}
      </div>
      
      <div class="countdown flex gap-4 md:gap-8 mb-8" data-start-time="${startTime.getTime()}">
        ${getHeroCountdownHtml(startTime)}
      </div>

      <div class="flex flex-wrap gap-4 relative z-30">
        ${nextEvent.url ? `<a href="${nextEvent.url}" target="_blank" class="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all hover:scale-105">Visit Event Page</a>` : ''}
        <button class="px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all" onclick="window.deleteHackathon('${nextEvent.id}')">Delete Event</button>
      </div>
    </div>
  `;
  nextEventEl.className = 'relative overflow-hidden rounded-2xl bg-slate-900 p-8 md:p-12 text-white shadow-2xl fade-in';
}

/**
 * Update the countdown display for the featured event
 */
export function updateCountdown() {
  const countdown = document.querySelector('.countdown');
  if (!countdown) return;

  const startTime = parseInt(countdown.dataset.startTime, 10);
  const now = Date.now();
  const diff = startTime - now;

  if (diff <= 0) {
    updateNextEvent();
    return;
  }

  countdown.innerHTML = getHeroCountdownHtml(new Date(startTime));
}

/**
 * Generate HTML for the countdown timer digits
 */
function getHeroCountdownHtml(startTime) {
  const now = new Date();
  const diff = startTime - now;

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  return `
    <div class="flex flex-col items-center">
      <span class="text-3xl md:text-4xl font-black text-white tracking-tighter">${d.toString().padStart(2, '0')}</span>
      <span class="text-[9px] font-bold uppercase text-white/40">Days</span>
    </div>
    <div class="text-2xl font-light text-white/20 pt-1">:</div>
    <div class="flex flex-col items-center">
      <span class="text-3xl md:text-4xl font-black text-white tracking-tighter">${h.toString().padStart(2, '0')}</span>
      <span class="text-[9px] font-bold uppercase text-white/40">Hours</span>
    </div>
    <div class="text-2xl font-light text-white/20 pt-1">:</div>
    <div class="flex flex-col items-center">
      <span class="text-3xl md:text-4xl font-black text-white tracking-tighter">${m.toString().padStart(2, '0')}</span>
      <span class="text-[9px] font-bold uppercase text-white/40">Mins</span>
    </div>
    <div class="text-2xl font-light text-white/20 pt-1 hidden sm:block">:</div>
    <div class="flex flex-col items-center hidden sm:flex">
      <span class="text-3xl md:text-4xl font-black text-white tracking-tighter">${s.toString().padStart(2, '0')}</span>
      <span class="text-[9px] font-bold uppercase text-white/40">Secs</span>
    </div>
  `;
}

/**
 * Update hackathon statistics display
 */
function updateStatistics() {
  const events = getHackathons();
  const now = new Date();

  const totalEl = document.getElementById('total-events');
  const upcomingEl = document.getElementById('upcoming-events');
  const monthEl = document.getElementById('this-month-events');
  const prizeEl = document.getElementById('total-prize-pool');

  if (totalEl) totalEl.textContent = events.length;
  if (upcomingEl) upcomingEl.textContent = events.filter(e => new Date(e.startTime) > now).length;
  if (monthEl) monthEl.textContent = events.filter(e => isSameMonth(new Date(e.startTime), now)).length;

  if (prizeEl) {
    const totalPrize = events.reduce((sum, event) => sum + parsePrizeAmount(event.prize), 0);
    prizeEl.textContent = formatCurrency(totalPrize);
  }
}

/**
 * Parse prize amount from string to number
 * @param {string} prizeString 
 * @returns {number}
 */
function parsePrizeAmount(prizeString) {
  if (!prizeString) return 0;
  const match = prizeString.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Format number as currency
 * @param {number} amount 
 * @returns {string}
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Render all hackathons cards
 * @param {Array} events 
 */
function renderHackathons(events) {
  const list = document.getElementById('hackathons-list');
  if (!list) return;

  if (events.length === 0) {
    list.innerHTML = '<div class="col-span-full p-12 text-center text-slate-400">No events match your search.</div>';
    return;
  }

  list.innerHTML = events.map(event => `
    <div class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl fade-in">
      <div class="space-y-4">
        <div class="flex items-start justify-between gap-4">
          <span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
            ${capitalizeFirstLetter(event.type)}
          </span>
          <div class="flex gap-2">
            ${event.url ? `<a href="${event.url}" target="_blank" class="text-slate-400 hover:text-primary transition-colors"><span class="material-symbols-outlined text-[18px]">open_in_new</span></a>` : ''}
            <button onclick="window.deleteHackathon('${event.id}')" class="text-slate-400 hover:text-red-500 transition-colors"><span class="material-symbols-outlined text-[18px]">delete</span></button>
          </div>
        </div>
        <div>
          <h3 class="font-bold text-lg text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">${event.name}</h3>
          ${event.organizer ? `<p class="mt-1 text-xs font-medium text-slate-500 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">corporate_fare</span> ${event.organizer}</p>` : ''}
        </div>
        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
             <span class="material-symbols-outlined text-[16px] text-slate-400">calendar_month</span>
             <span class="font-medium">${formatDateTime(new Date(event.startTime))}</span>
          </div>
          ${event.prize ? `
          <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
             <span class="material-symbols-outlined text-[16px] text-green-500">emoji_events</span>
             <span class="font-bold text-green-600 dark:text-green-500">${event.prize}</span>
          </div>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Format date and time to localized string
 */
function formatDateTime(date) {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Check if two dates are same day
 */
function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

/**
 * Check if date is in current week
 */
function isThisWeek(date) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return date >= start && date <= end;
}

/**
 * Check if date is in current month
 */
function isSameMonth(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirstLetter(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Make globally available for button clicks
window.deleteHackathon = deleteHackathon;
