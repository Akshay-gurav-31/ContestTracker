import { toggleTheme, initScrollSpy } from './ui.js';
import { initHackathons, updateCountdown } from './hackathons.js';

// Initialize the hackathons page
function initHackathonsPage() {
  // Theme is already set by the blocking inline script in <head>
  // No need to re-apply here — avoids FOUC

  // Initialize theme toggle button
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Initialize hackathons
  initHackathons();

  // Update countdown every second
  setInterval(updateCountdown, 1000);

  // Initialize Scroll Spy
  initScrollSpy();
}

// Start the page when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHackathonsPage);
} else {
  initHackathonsPage();
}