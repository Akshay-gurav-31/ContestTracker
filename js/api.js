/**
 * Fetch Codeforces contests using their API directly
 * @returns {Promise<Array>} Array of contest objects
 */
export async function fetchCodeforcesContests() {
  try {
    const response = await fetch('https://codeforces.com/api/contest.list');

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`API returned error status: ${data.status}`);
    }

    // Filter for upcoming contests (phase === "BEFORE")
    return data.result
      .filter(contest => contest.phase === 'BEFORE')
      .map(contest => {
        const startTime = new Date(contest.startTimeSeconds * 1000);
        const durationMs = contest.durationSeconds * 1000;
        return {
          id: `cf-${contest.id}`,
          platform: 'codeforces',
          name: contest.name,
          url: `https://codeforces.com/contests/${contest.id}`,
          startTime: startTime,
          duration: durationMs,
          endTime: new Date(startTime.getTime() + durationMs),
          durationFormatted: formatDuration(durationMs)
        };
      });
  } catch (error) {
    console.error('Error fetching Codeforces contests:', error);
    return [];
  }
}

/**
 * Fetch LeetCode contests using Kontests API (v1/all is often more reliable)
 * @returns {Promise<Array>} Array of contest objects
 */
export async function fetchLeetCodeContests() {
  try {
    // Add cache-busting to prevent stale API responses
    const response = await fetch(`https://kontests.net/api/v1/all?t=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const allContests = await response.json();

    // Filter for LeetCode specifically
    const leetcodeData = allContests.filter(c =>
      c.site && (c.site.toLowerCase() === 'leetcode' || c.url.includes('leetcode.com'))
    );

    console.log(`LeetCode API found ${leetcodeData.length} total contests in global list.`);

    return leetcodeData.map((contest, index) => {
      const startTime = new Date(contest.start_time);
      const endTime = new Date(contest.end_time);
      const durationMs = endTime.getTime() - startTime.getTime();

      // Stable ID based on name and start time to prevent duplicates/jumps during refresh
      const stableId = `lc-api-${contest.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${startTime.getTime()}`;

      return {
        id: stableId,
        platform: 'leetcode',
        name: contest.name,
        url: contest.url,
        startTime: startTime,
        duration: durationMs,
        endTime: endTime,
        durationFormatted: formatDuration(durationMs)
      };
    });
  } catch (error) {
    console.warn('Error fetching LeetCode contests from API, falling back to local data...', error);
    return [];
  }
}

/**
 * Format duration in milliseconds to readable format (e.g. "2h 30m")
 * @param {number} duration Duration in milliseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(duration) {
  const totalMinutes = Math.floor(duration / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const days = Math.floor(hours / 24);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  const displayHours = hours % 24;
  if (displayHours > 0) parts.push(`${displayHours}h`);
  if (mins > 0) parts.push(`${mins}m`);

  return parts.length > 0 ? parts.join(' ') : '0m';
}
