import { fetchCodeforcesContests } from './api.js';
import { generateContestData } from './contestData.js';
import { initCalendar } from './calendar.js';
import { renderContests, updateCountdowns, toggleTheme, initScrollSpy } from './ui.js';

// Initialize the application
async function initApp() {
  // Theme is already set by the blocking inline script in <head>
  // No need to re-apply here — avoids FOUC

  // Initialize theme toggle button
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // 1. Try to load and render cached data IMMEDIATELY
  const cachedDataStr = localStorage.getItem('contestData');
  let cachedContests = [];
  if (cachedDataStr) {
    try {
      const { contests } = JSON.parse(cachedDataStr);
      cachedContests = contests;
      if (contests && contests.length > 0) {
        renderContests(contests);
        initCalendar(contests);
        initScrollSpy();
        // Start countdowns with cached data
        if (!window.countdownInterval) {
          window.countdownInterval = setInterval(() => updateCountdowns(), 1000);
        }
      }
    } catch (e) {
      console.error('Error parsing cached data:', e);
    }
  }

  // 2. Fetch fresh data in the background (or foreground if no cache)
  try {
    // Generate contest data for fixed schedule platforms
    const contestData = generateContestData();

    // Fetch Codeforces contests
    const codeforcesContests = await fetchCodeforcesContests();

    // Combine all contests
    const allContests = [...contestData, ...codeforcesContests];

    // Sort contests by start date
    allContests.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Update UI with fresh data (if content changed or it's the first render)
    renderContests(allContests);
    initCalendar(allContests);
    initScrollSpy();

    // Ensure countdowns are running
    if (!window.countdownInterval) {
      window.countdownInterval = setInterval(() => updateCountdowns(), 1000);
    }

    // Store fresh data in localStorage for next time
    localStorage.setItem('contestData', JSON.stringify({
      timestamp: Date.now(),
      contests: allContests
    }));
  } catch (error) {
    console.error('Error fetching fresh data:', error);
    if (cachedContests.length === 0) {
      showError('Failed to load contest data. Please check your internet connection.');
    }
  }
} window.countdownInterval = null;

function showError(message) {
  const loadingElements = document.querySelectorAll('.loading');
  loadingElements.forEach(el => {
    el.textContent = message;
    el.style.color = '#ff5555';
  });
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Refresh data when page is shown (in case it was hidden/in background)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const lastUpdate = localStorage.getItem('contestData')
      ? JSON.parse(localStorage.getItem('contestData')).timestamp
      : 0;

    const hoursSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60);

    // Refresh if data is older than 6 hours
    if (hoursSinceUpdate > 6) {
      initApp();
    }
  }
});