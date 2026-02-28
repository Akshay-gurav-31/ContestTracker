// UI updates and rendering functions

/**
 * Get the color class for a specific platform's badge
 * @param {string} platform Platform identifier
 * @returns {string} Tailwind CSS color classes
 */
export function getPlatformColorClass(platform) {
  switch (String(platform).toLowerCase()) {
    case 'leetcode': return 'text-orange-500 bg-orange-100 dark:bg-orange-500/10';
    case 'codeforces': return 'text-blue-600 bg-blue-100 dark:bg-blue-500/10';
    case 'codechef': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-500/10';
    case 'gfg': return 'text-green-600 bg-green-100 dark:bg-green-500/10';
    default: return 'text-slate-500 bg-slate-100 dark:bg-slate-800';
  }
}

export function getPlatformName(platform) {
  switch (String(platform).toLowerCase()) {
    case 'leetcode': return 'LeetCode';
    case 'codeforces': return 'Codeforces';
    case 'codechef': return 'CodeChef';
    case 'gfg': return 'GeeksforGeeks';
    default: return String(platform);
  }
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
}

export function getCountdown(date) {
  const diff = date - new Date();
  if (diff <= 0) return 'Started';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
// -------------------------

// Cache for auto-refreshing UI when contests start
let cachedAllContests = [];
let isRefreshing = false;

/**
 * Render all contests in the UI
 * @param {Array} contests Array of contest objects
 */
export function renderContests(contests) {
  // Store for auto-refresh logic
  cachedAllContests = contests;
  const loadingElements = document.querySelectorAll('.loading');
  loadingElements.forEach(el => el.classList.add('hidden'));

  const now = new Date();
  // Filter for upcoming contests only
  const upcomingContests = contests.filter(contest => new Date(contest.startTime) > now);

  // Sort contests by start time safely
  upcomingContests.sort((a, b) => {
    const timeA = a.startTime instanceof Date ? a.startTime.getTime() : new Date(a.startTime).getTime();
    const timeB = b.startTime instanceof Date ? b.startTime.getTime() : new Date(b.startTime).getTime();
    return timeA - timeB;
  });

  // 1. Render Hero Section (Next Contest)
  const heroContestEl = document.getElementById('next-contest');
  if (heroContestEl) {
    if (upcomingContests.length > 0) {
      const nextContest = upcomingContests[0];
      heroContestEl.innerHTML = createHeroContestHtml(nextContest);
      heroContestEl.className = 'relative overflow-hidden rounded-2xl bg-slate-900 p-8 md:p-12 text-white shadow-2xl fade-in';
    } else {
      heroContestEl.innerHTML = '<div class="p-12 text-center text-slate-400">No upcoming contests found.</div>';
    }
  }

  // 2. Render Upcoming Contests Carousel
  const upcomingContestsEl = document.getElementById('upcoming-contests');
  if (upcomingContestsEl) {
    upcomingContestsEl.innerHTML = '';

    // Filter out the hero contest if shown above
    const restContests = upcomingContests.slice(1);

    if (restContests.length === 0) {
      upcomingContestsEl.innerHTML = '<div class="flex items-center justify-center w-full py-8 text-slate-400">No additional upcoming contests found</div>';
    } else {
      // Generate cards for the next 10 contests
      const cardsHtml = restContests.slice(0, 10).map((contest, index) => {
        const card = createContestCard(contest, index);
        return card.outerHTML;
      }).join('');

      upcomingContestsEl.innerHTML = `
        <div class="animate-scroll gap-6">
          ${cardsHtml}
          ${cardsHtml}
        </div>
      `;
    }
  }

  // 3. Update the Weekly Schedule section with real dynamic data
  renderWeeklySchedule(contests);

  // 4. Update platform counts in the Platform Selector
  renderPlatformCounts(contests);

  // 5. Render platform-specific contests (Mirrored logic from reference)
  renderPlatformContests('leetcode', contests);
  renderPlatformContests('codechef', contests);
  renderPlatformContests('gfg', contests);
  renderPlatformContests('codeforces', contests);
}

/**
 * Render contests for a specific platform
 * @param {string} platform Platform identifier
 * @param {Array} contests Array of contest objects
 */
function renderPlatformContests(platform, contests) {
  const now = new Date();

  // Filter contests for this platform and upcoming
  const platformContests = contests.filter(
    contest => contest.platform === platform && new Date(contest.startTime) > now
  );

  const containerEl = document.getElementById(`${platform}-contests`);
  if (!containerEl) return;

  containerEl.innerHTML = '';

  if (platformContests.length === 0) {
    containerEl.innerHTML = `
      <div class="flex flex-col items-center justify-center py-4 text-center opacity-50">
        <span class="material-symbols-outlined text-slate-400 !text-xl mb-1">sentiment_neutral</span>
        <p class="text-[10px] font-bold text-slate-400 uppercase">No upcoming contests</p>
      </div>
    `;
    return;
  }

  // Show next 3 contests for this platform
  platformContests.slice(0, 3).forEach(contest => {
    const contestEl = document.createElement('div');
    contestEl.className = 'flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group fade-in';
    contestEl.onclick = () => window.open(contest.url, '_blank');

    contestEl.innerHTML = `
      <div class="flex flex-col gap-0.5 max-w-[70%]">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">${formatDate(new Date(contest.startTime))}</span>
        <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary transition-colors" title="${contest.name}">${contest.name}</span>
      </div>
      <div class="text-[11px] font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">
        ${formatTime(new Date(contest.startTime))}
      </div>
    `;
    containerEl.appendChild(contestEl);
  });
}

/**
 * Update the "Weekly Schedule" sidebar with real-time upcoming events
 * @param {Array} contests Array of contest objects
 */
export function renderWeeklySchedule(contests) {
  const listContainer = document.getElementById('weekly-schedule') || document.getElementById('schedule-section');
  if (!listContainer) return;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Generate array for the next 7 days
  const next7Days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(todayStart);
    date.setDate(todayStart.getDate() + i);

    // Find contests for this specific day
    const dayContests = contests.filter(c => {
      const cDate = new Date(c.startTime);
      return cDate.getDate() === date.getDate() &&
        cDate.getMonth() === date.getMonth() &&
        cDate.getFullYear() === date.getFullYear() &&
        cDate >= now; // Only upcoming part of today
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    next7Days.push({
      date,
      contests: dayContests
    });
  }

  listContainer.innerHTML = next7Days
    .filter(day => day.contests.length > 0)
    .map(day => {
      let dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const dateNum = String(day.date.getDate()).padStart(2, '0');

      // Relative naming for Today and Tomorrow
      const diffDays = Math.round((day.date - todayStart) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) dayName = "TODAY";
      if (diffDays === 1) dayName = "TMRW";

      // Render group of contests for the day
      return day.contests.map((contest, idx) => {
        const startTime = new Date(contest.startTime);
        const timeStr = formatTime(startTime);
        const isFirst = idx === 0;
        const isLast = idx === day.contests.length - 1;

        const platformColor = getPlatformColorClass(contest.platform);
        const platformName = getPlatformName(contest.platform);

        return `
        <div class="flex gap-4 fade-in">
          <div class="flex flex-col items-center">
            ${isFirst ? `
              <div class="flex h-10 w-10 flex-col items-center justify-center rounded-full border-4 border-white dark:border-slate-900 bg-primary text-white shadow-md ring-1 ring-primary/20">
                <span class="text-[9px] font-black leading-none">${dayName}</span>
                <span class="text-[11px] font-bold mt-0.5">${dateNum}</span>
              </div>
            ` : `
              <div class="h-10 w-10 flex items-center justify-center">
                <div class="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              </div>
            `}
            <div class="w-px grow bg-slate-200 dark:bg-slate-800"></div>
          </div>
          <div class="flex-1 ${isLast ? 'pb-8' : 'pb-4'}">
            <div class="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer" 
                 onclick="window.open('${contest.url}', '_blank')">
              <div class="flex justify-between items-start mb-2">
                <p class="text-[10px] font-bold text-slate-400 tracking-wider">${timeStr}</p>
                <div class="h-2 w-2 rounded-full ${platformColor.replace('text-', 'bg-')}"></div>
              </div>
              <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">${contest.name}</h4>
              <p class="text-[11px] font-semibold ${platformColor} mt-0.5">${platformName}</p>
            </div>
          </div>
        </div>
      `;
      }).join('');
    }).join('');
}

/**
 * Update the contest counts on the Platform Grid cards
 * @param {Array} contests Array of contest objects
 */
function renderPlatformCounts(contests) {
  const platforms = ['leetcode', 'codeforces', 'codechef', 'gfg'];
  const now = new Date();

  platforms.forEach(platform => {
    const countEl = document.getElementById(`count-${platform}`);
    if (!countEl) return;

    const platformContests = contests.filter(c =>
      c.platform === platform &&
      new Date(c.startTime) > now
    );

    const count = platformContests.length;

    countEl.textContent = count > 0 ? `${count} Upcoming` : 'No Contests';
    if (count > 0) {
      countEl.classList.remove('text-slate-400');
      countEl.classList.add('text-primary');
    } else {
      countEl.classList.add('text-slate-400');
      countEl.classList.remove('text-primary');
    }
  });
}

/**
 * Create Hero Section HTML for the next contest
 * @param {Object} contest Contest object
 * @returns {string} HTML for hero section
 */
function createHeroContestHtml(contest) {
  const startTime = new Date(contest.startTime);
  const platform = getPlatformName(contest.platform);
  const platformClass = getPlatformColorClass(contest.platform);

  const now = new Date();
  const isLive = startTime - now <= 0;

  const statusText = isLive ? "Live Now" : "Starting Next";
  const statusContainerClass = isLive
    ? "border-white/30 bg-white/10 text-white"
    : "border-white/30 bg-white/10 text-white";
  const statusDotClass = isLive ? "bg-red-400" : "bg-green-400";
  const statusRingClass = isLive ? "bg-red-500" : "bg-green-500";

  return `
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,102,255,0.7),transparent_60%)] bg-slate-950 z-10 pointer-events-none"></div>
    <div class="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/40 blur-[100px] z-0 pointer-events-none"></div>
    <div class="relative z-20 grid gap-8 md:grid-cols-2 lg:items-center">
        <div class="space-y-6">
            <div class="inline-flex items-center gap-2 rounded-full border ${statusContainerClass} px-4 py-1.5 text-sm font-medium backdrop-blur-md transition-colors">
                <span class="relative flex h-2 w-2">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full ${statusDotClass} opacity-75"></span>
                    <span class="relative inline-flex h-2 w-2 rounded-full ${statusRingClass}"></span>
                </span>
                ${statusText}
            </div>
            
            <div class="space-y-2">
                <div class="flex items-center gap-3">
                    <span class="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">${platform}</span>
                </div>
                <h1 class="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl line-clamp-2" style="color: white !important;" title="${contest.name}">${contest.name}</h1>
                <p class="text-white/70 line-clamp-1">Duration: ${contest.durationFormatted}</p>
            </div>
            
            <div class="flex flex-wrap items-center gap-4 pt-4">
                <a href="${contest.url}" target="_blank" class="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-lg shadow-white/10 transition-all hover:scale-105 hover:bg-slate-50 hover:shadow-white/20">
                    <span class="material-symbols-outlined !text-sm">open_in_new</span>
                    Register Now
                </a>
                <button onclick="window.addToCalendar('${contest.name.replace(/'/g, "\\'")}', '${contest.startTime}', '${contest.url}')" class="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 mx-2 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/10">
                    <span class="material-symbols-outlined !text-sm">event</span>
                    Add to Calendar
                </button>
            </div>
        </div>
        
        <div class="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/20 p-8 backdrop-blur-md relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-sm font-medium uppercase tracking-widest text-white/50">Starts In</p>
            <div class="flex gap-4 md:gap-8 hero-countdown" data-start-time="${startTime.getTime()}">
                ${getHeroCountdownHtml(startTime)}
            </div>
        </div>
    </div>
  `;
}

/**
 * Create a contest card element for the upcoming list
 */
function createContestCard(contest, index = 0) {
  const card = document.createElement('div');
  card.className = "min-w-[320px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm transition-all hover:shadow-md hover:-translate-y-1";

  const startTime = new Date(contest.startTime);
  const platformColor = getPlatformColorClass(contest.platform);
  const platformName = getPlatformName(contest.platform);

  // Assign images sequentially: 1st event -> 1.png, 2nd -> 2.png, up to 5
  // using the index parameter passed down from the renderContests loop
  const imageIndex = (index % 5) + 1;
  const dynamicallyAssignedImage = `public/Upcoming-Contests/${imageIndex}.png`;

  const bgImage = contest.image || dynamicallyAssignedImage;

  card.innerHTML = `
    <div class="h-40 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 relative z-0">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
        <img alt="${platformName} contest" class="h-full w-full object-cover relative z-0" src="${bgImage}" />
        <div class="absolute bottom-3 left-3 z-20">
             <span class="rounded-lg bg-white/20 backdrop-blur-md px-2 py-1 text-[10px] font-black uppercase text-white border border-white/20">${platformName}</span>
        </div>
    </div>
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-primary">${formatDate(startTime)}</span>
            <span class="text-xs font-medium text-slate-400">${formatTime(startTime)}</span>
        </div>
        <h3 class="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">${contest.name}</h3>
        <div class="text-xs text-slate-500 dark:text-slate-400">Duration: ${contest.durationFormatted}</div>
        <div class="contest-countdown-simple text-xs font-bold text-slate-600 dark:text-slate-300" data-start-time="${startTime.getTime()}">
            Starts in: ${getCountdown(startTime)}
        </div>
        <div class="flex items-center gap-3 pt-2">
            <a href="${contest.url}" target="_blank" class="flex-1 text-center rounded-lg bg-slate-900 dark:bg-primary py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity">Register</a>
            <button onclick="navigator.clipboard.writeText('${contest.url}'); this.innerHTML='<span class=\\'material-symbols-outlined !text-sm\\'>check</span>'; setTimeout(() => this.innerHTML='<span class=\\'material-symbols-outlined !text-sm\\'>share</span>', 2000)" class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors" title="Copy Link to Clipboard"><span class="material-symbols-outlined !text-sm">share</span></button>
        </div>
    </div>
  `;

  return card;
}

/**
 * Get HTML for hero countdown timer
 */
function getHeroCountdownHtml(startTime) {
  const now = new Date();
  const diffDate = startTime - now;

  if (diffDate <= 0) {
    return '<div class="text-3xl font-black text-white">Started</div>';
  }

  const days = Math.floor(diffDate / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffDate % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffDate % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffDate % (1000 * 60)) / 1000);

  return `
    <div class="flex flex-col items-center">
        <span class="text-4xl md:text-5xl font-black text-white tracking-tighter">${days.toString().padStart(2, '0')}</span>
        <span class="text-[10px] font-bold uppercase text-indigo-300">Days</span>
    </div>
    <div class="text-3xl font-light text-white/30 pt-1">:</div>
    <div class="flex flex-col items-center">
        <span class="text-4xl md:text-5xl font-black text-white tracking-tighter">${hours.toString().padStart(2, '0')}</span>
        <span class="text-[10px] font-bold uppercase text-indigo-300">Hours</span>
    </div>
    <div class="text-3xl font-light text-white/30 pt-1">:</div>
    <div class="flex flex-col items-center">
        <span class="text-4xl md:text-5xl font-black text-white tracking-tighter">${minutes.toString().padStart(2, '0')}</span>
        <span class="text-[10px] font-bold uppercase text-indigo-300">Mins</span>
    </div>
    <div class="text-3xl font-light text-white/30 pt-1 hidden sm:block">:</div>
    <div class="flex flex-col items-center hidden sm:flex">
        <span class="text-4xl md:text-5xl font-black text-white tracking-tighter w-16 text-center">${seconds.toString().padStart(2, '0')}</span>
        <span class="text-[10px] font-bold uppercase text-indigo-300">Secs</span>
    </div>
  `;
}

/**
 * Update all countdown timers on the page periodically
 */
export function updateCountdowns() {
  // Update Hero Countdown
  const heroCountdown = document.querySelector('.hero-countdown');
  if (heroCountdown) {
    const startTime = parseInt(heroCountdown.getAttribute('data-start-time'), 10);
    const now = Date.now();

    // ✅ AUTO-NEXT LOGIC: If hero contest has started, refresh the dashboard to show the next one
    if (startTime - now <= 0 && !isRefreshing && cachedAllContests.length > 0) {
      isRefreshing = true;
      // Small 2-second delay to let the user see "Started" before the swap
      setTimeout(() => {
        console.log('Hero contest started. Auto-swapping to next event...');
        renderContests(cachedAllContests);
        isRefreshing = false;
      }, 2000);
    }

    heroCountdown.innerHTML = getHeroCountdownHtml(new Date(startTime));
  }

  // Update Simple Countdowns on cards
  const simpleCountdowns = document.querySelectorAll('.contest-countdown-simple');
  simpleCountdowns.forEach(el => {
    const startTime = parseInt(el.getAttribute('data-start-time'), 10);
    el.textContent = `Starts in: ${getCountdown(new Date(startTime))}`;
  });
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
  const root = document.documentElement;
  const body = document.body;
  const knob = document.querySelector('.toggle-knob');

  // Start spinning animation
  if (knob) {
    knob.classList.add('spinning');
    setTimeout(() => {
      knob.classList.remove('spinning');
    }, 600);
  }

  const isDark = root.classList.contains('dark');

  if (isDark) {
    root.classList.remove('dark');
    body.classList.remove('dark', 'dark-theme');
    localStorage.setItem('theme', 'light');
  } else {
    root.classList.add('dark');
    body.classList.add('dark', 'dark-theme');
    localStorage.setItem('theme', 'dark');
  }

  // Re-trigger calendar render if it exists
  const calendarEl = document.getElementById('calendar');
  if (calendarEl && window.calendarInstance) {
    window.calendarInstance.render();
  }
}

/**
 * Initialize ScrollSpy for Navbar Active States
 */
export function initScrollSpy() {
  const sections = [
    { id: 'next-contest', navId: 'nav-dashboard' },
    { id: 'platforms-section', navId: 'nav-platforms' },
    { id: 'calendar-section', navId: 'nav-calendar' },
    { id: 'about-section', navId: 'nav-about' }
  ];

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Reset all
        document.querySelectorAll('nav a').forEach(link => {
          link.classList.remove('font-semibold', 'text-primary', 'hover:text-indigo-600');
          link.classList.add('font-medium', 'text-slate-500', 'dark:text-slate-400');
        });

        // Set active
        const activeNav = sections.find(s => s.id === entry.target.id)?.navId;
        const activeEl = document.getElementById(activeNav);
        if (activeEl) {
          activeEl.classList.remove('font-medium', 'text-slate-500', 'dark:text-slate-400');
          activeEl.classList.add('font-semibold', 'text-primary', 'hover:text-indigo-600');
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    const el = document.getElementById(section.id);
    if (el) observer.observe(el);
  });
}

/**
 * Add event to Google Calendar
 */
window.addToCalendar = function (name, startTimeStr, url) {
  const startTime = new Date(startTimeStr);
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Default to 2 hours duration

  const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(name)}&dates=${formatDate(startTime)}/${formatDate(endTime)}&details=${encodeURIComponent('Register and view details at: ' + url)}&location=${encodeURIComponent(url)}`;

  window.open(googleCalendarUrl, '_blank');
};
