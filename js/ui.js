// --- HELPER FUNCTIONS ---
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

/**
 * Render all contests in the UI
 * @param {Array} contests Array of all contests
 */
export function renderContests(contests) {
  const loadingElements = document.querySelectorAll('.loading');
  loadingElements.forEach(el => el.classList.add('hidden'));

  // Render hero section (next upcoming contest)
  const heroContestEl = document.getElementById('next-contest');
  if (contests.length > 0) {
    const nextContest = contests[0];
    heroContestEl.innerHTML = createHeroContestHtml(nextContest);
    heroContestEl.className = 'relative overflow-hidden rounded-2xl bg-slate-900 p-8 md:p-12 text-white shadow-2xl fade-in';
  }

  // Filter out the hero contest and render the rest in upcoming
  const upcomingContests = contests.filter(c => c.id !== (contests[0]?.id));
  const upcomingContestsEl = document.getElementById('upcoming-contests');

  // Clear any loading states
  upcomingContestsEl.innerHTML = '';

  if (upcomingContests.length <= 1) {
    upcomingContestsEl.innerHTML = '<div class="flex items-center justify-center w-full py-8 text-slate-400">No additional upcoming contests found</div>';
  } else {
    // Generate cards for the next 10 contests
    const cardsHtml = upcomingContests.slice(1, 11).map((contest, index) => {
      const card = createContestCard(contest, index);
      return card.outerHTML;
    }).join('');

    // To make an infinite seamless scroll, we wrap the cards in a container that animates,
    // and we duplicate the content so the end seamlessly meets the beginning.
    upcomingContestsEl.innerHTML = `
      <div class="animate-scroll gap-6">
        ${cardsHtml}
        ${cardsHtml}
      </div>
    `;
  }

}

/**
 * Create Hero Section HTML for the next contest
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
 * Update all countdown timers on the page
 */
export function updateCountdowns() {
  // Update Hero Countdown
  const heroCountdown = document.querySelector('.hero-countdown');
  if (heroCountdown) {
    const startTime = parseInt(heroCountdown.getAttribute('data-start-time'), 10);
    heroCountdown.innerHTML = getHeroCountdownHtml(new Date(startTime));
  }

  // Update Simple Countdowns
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
    { id: 'next-event', navId: 'nav-hackathons' },
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
