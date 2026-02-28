import { fetchCodeforcesContests } from './api.js';
import { generateContestData } from './contestData.js';
import { initCalendar } from './calendar.js';
import { renderContests, updateCountdowns, toggleTheme, initScrollSpy } from './ui.js';

// Initialize the application
async function initApp() {
  console.log('Initializing Contest Tracker...');

  // Initialize theme from saved preference or system setting
  if (localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark', 'dark-theme');
  }

  // Initialize theme toggle button
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // 1. Try to load and render cached data immediately
  const cachedDataStr = localStorage.getItem('contestData');
  let cachedContests = [];
  if (cachedDataStr) {
    try {
      console.log('Loading contests from cache...');
      const cachedData = JSON.parse(cachedDataStr);

      // Support both old array format and new object format
      const contests = Array.isArray(cachedData) ? cachedData : (cachedData.contests || []);

      if (contests && contests.length > 0) {
        cachedContests = contests;
        // Hydrate Date objects from strings
        contests.forEach(c => {
          if (c.startTime) c.startTime = new Date(c.startTime);
          if (c.endTime) c.endTime = new Date(c.endTime);
        });

        console.log(`Rendered ${contests.length} contests from cache.`);
        renderContests(contests);
        initCalendar(contests);
        initScrollSpy();

        if (!window.countdownInterval) {
          window.countdownInterval = setInterval(() => updateCountdowns(), 1000);
        }
      }
    } catch (e) {
      console.warn('Cache hydration failed:', e);
    }
  }

  // 2. Fetch fresh data following the reference subdirectory logic
  try {
    console.log('Generating local contest data...');
    const contestData = generateContestData();
    console.log(`Generated ${contestData.length} local contests.`);

    console.log('Fetching Codeforces data...');
    const codeforcesContests = await fetchCodeforcesContests();
    console.log(`Fetched ${codeforcesContests.length} Codeforces contests.`);

    // Combine both sets of data
    const allContests = [...contestData, ...codeforcesContests];

    // Sort contests by start date
    allContests.sort((a, b) => {
      const timeA = a.startTime instanceof Date ? a.startTime.getTime() : new Date(a.startTime).getTime();
      const timeB = b.startTime instanceof Date ? b.startTime.getTime() : new Date(b.startTime).getTime();
      return timeA - timeB;
    });

    console.log(`Total contests for final render: ${allContests.length}`);

    // 3. Final Render & Refresh
    renderContests(allContests);
    initCalendar(allContests);
    initScrollSpy();

    if (!window.countdownInterval) {
      window.countdownInterval = setInterval(() => updateCountdowns(), 1000);
    }

    // Store fresh data in localStorage for next visit
    localStorage.setItem('contestData', JSON.stringify({
      timestamp: Date.now(),
      contests: allContests
    }));
    console.log('App initialization complete and data cached.');
  } catch (error) {
    console.error('Initialization error:', error);
    if (cachedContests.length === 0) {
      showError('Failed to load contest data. Please check your connection.');
    }
  }
}

// Global reference for the countdown interval
window.countdownInterval = null;

/**
 * Handle display of error messages to the user
 */
function showError(message) {
  const loadingElements = document.querySelectorAll('.loading');
  loadingElements.forEach(el => {
    el.innerHTML = `<div class="p-4 text-red-500 bg-red-100/10 rounded-xl border border-red-500/20 text-center w-full">${message}</div>`;
  });
}

// Start the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Auto-refresh logic when page visibility returns
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const cached = localStorage.getItem('contestData');
    if (cached) {
      const { timestamp } = JSON.parse(cached);
      const hoursSinceUpdate = (Date.now() - timestamp) / (1000 * 60 * 60);

      // Refresh if more than 6 hours have passed since last update
      if (hoursSinceUpdate > 6) {
        initApp();
      }
    }
  }
});
