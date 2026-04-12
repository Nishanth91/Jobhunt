// Template-based salary ranges for common roles across regions.
// Used by the Salary Insights page for quick salary comparisons.

const salaryDatabase = {
  'Software Engineer': {
    'United States': { min: 90000, median: 130000, max: 200000, currency: 'USD' },
    'Canada': { min: 70000, median: 100000, max: 155000, currency: 'CAD' },
    'United Kingdom': { min: 40000, median: 62000, max: 95000, currency: 'GBP' },
    'Remote/Global': { min: 60000, median: 105000, max: 175000, currency: 'USD' },
  },
  'Frontend Developer': {
    'United States': { min: 80000, median: 120000, max: 180000, currency: 'USD' },
    'Canada': { min: 60000, median: 90000, max: 140000, currency: 'CAD' },
    'United Kingdom': { min: 35000, median: 55000, max: 85000, currency: 'GBP' },
    'Remote/Global': { min: 50000, median: 95000, max: 160000, currency: 'USD' },
  },
  'Backend Developer': {
    'United States': { min: 90000, median: 135000, max: 210000, currency: 'USD' },
    'Canada': { min: 70000, median: 105000, max: 160000, currency: 'CAD' },
    'United Kingdom': { min: 42000, median: 65000, max: 100000, currency: 'GBP' },
    'Remote/Global': { min: 60000, median: 110000, max: 180000, currency: 'USD' },
  },
  'Full Stack Developer': {
    'United States': { min: 85000, median: 128000, max: 195000, currency: 'USD' },
    'Canada': { min: 65000, median: 98000, max: 150000, currency: 'CAD' },
    'United Kingdom': { min: 38000, median: 60000, max: 92000, currency: 'GBP' },
    'Remote/Global': { min: 55000, median: 100000, max: 170000, currency: 'USD' },
  },
  'Data Analyst': {
    'United States': { min: 55000, median: 78000, max: 115000, currency: 'USD' },
    'Canada': { min: 48000, median: 68000, max: 100000, currency: 'CAD' },
    'United Kingdom': { min: 28000, median: 42000, max: 65000, currency: 'GBP' },
    'Remote/Global': { min: 40000, median: 65000, max: 100000, currency: 'USD' },
  },
  'Data Scientist': {
    'United States': { min: 95000, median: 140000, max: 220000, currency: 'USD' },
    'Canada': { min: 75000, median: 110000, max: 170000, currency: 'CAD' },
    'United Kingdom': { min: 45000, median: 68000, max: 105000, currency: 'GBP' },
    'Remote/Global': { min: 70000, median: 115000, max: 190000, currency: 'USD' },
  },
  'DevOps Engineer': {
    'United States': { min: 95000, median: 140000, max: 210000, currency: 'USD' },
    'Canada': { min: 75000, median: 110000, max: 165000, currency: 'CAD' },
    'United Kingdom': { min: 48000, median: 72000, max: 110000, currency: 'GBP' },
    'Remote/Global': { min: 70000, median: 120000, max: 185000, currency: 'USD' },
  },
  'Product Manager': {
    'United States': { min: 100000, median: 145000, max: 225000, currency: 'USD' },
    'Canada': { min: 80000, median: 115000, max: 175000, currency: 'CAD' },
    'United Kingdom': { min: 45000, median: 70000, max: 110000, currency: 'GBP' },
    'Remote/Global': { min: 75000, median: 120000, max: 195000, currency: 'USD' },
  },
  'Project Manager': {
    'United States': { min: 70000, median: 100000, max: 150000, currency: 'USD' },
    'Canada': { min: 60000, median: 85000, max: 130000, currency: 'CAD' },
    'United Kingdom': { min: 35000, median: 52000, max: 80000, currency: 'GBP' },
    'Remote/Global': { min: 50000, median: 82000, max: 130000, currency: 'USD' },
  },
  'UX Designer': {
    'United States': { min: 75000, median: 110000, max: 165000, currency: 'USD' },
    'Canada': { min: 58000, median: 85000, max: 130000, currency: 'CAD' },
    'United Kingdom': { min: 35000, median: 52000, max: 80000, currency: 'GBP' },
    'Remote/Global': { min: 50000, median: 88000, max: 145000, currency: 'USD' },
  },
  'Machine Learning Engineer': {
    'United States': { min: 110000, median: 160000, max: 250000, currency: 'USD' },
    'Canada': { min: 85000, median: 125000, max: 195000, currency: 'CAD' },
    'United Kingdom': { min: 52000, median: 78000, max: 120000, currency: 'GBP' },
    'Remote/Global': { min: 80000, median: 135000, max: 220000, currency: 'USD' },
  },
  'Cybersecurity Analyst': {
    'United States': { min: 75000, median: 110000, max: 165000, currency: 'USD' },
    'Canada': { min: 60000, median: 88000, max: 135000, currency: 'CAD' },
    'United Kingdom': { min: 35000, median: 55000, max: 85000, currency: 'GBP' },
    'Remote/Global': { min: 55000, median: 90000, max: 145000, currency: 'USD' },
  },
  'Cloud Engineer': {
    'United States': { min: 95000, median: 140000, max: 210000, currency: 'USD' },
    'Canada': { min: 78000, median: 112000, max: 168000, currency: 'CAD' },
    'United Kingdom': { min: 48000, median: 70000, max: 108000, currency: 'GBP' },
    'Remote/Global': { min: 70000, median: 118000, max: 185000, currency: 'USD' },
  },
  'Business Analyst': {
    'United States': { min: 60000, median: 85000, max: 130000, currency: 'USD' },
    'Canada': { min: 52000, median: 75000, max: 115000, currency: 'CAD' },
    'United Kingdom': { min: 30000, median: 45000, max: 70000, currency: 'GBP' },
    'Remote/Global': { min: 45000, median: 72000, max: 115000, currency: 'USD' },
  },
  'Marketing Manager': {
    'United States': { min: 65000, median: 95000, max: 150000, currency: 'USD' },
    'Canada': { min: 55000, median: 80000, max: 125000, currency: 'CAD' },
    'United Kingdom': { min: 32000, median: 48000, max: 75000, currency: 'GBP' },
    'Remote/Global': { min: 48000, median: 78000, max: 130000, currency: 'USD' },
  },
  'Oracle DBA': {
    'United States': { min: 85000, median: 120000, max: 175000, currency: 'USD' },
    'Canada': { min: 70000, median: 100000, max: 150000, currency: 'CAD' },
    'United Kingdom': { min: 40000, median: 60000, max: 92000, currency: 'GBP' },
    'Remote/Global': { min: 60000, median: 100000, max: 155000, currency: 'USD' },
  },
  'Manufacturing Production Supervisor': {
    'United States': { min: 50000, median: 72000, max: 105000, currency: 'USD' },
    'Canada': { min: 45000, median: 65000, max: 95000, currency: 'CAD' },
    'United Kingdom': { min: 28000, median: 40000, max: 58000, currency: 'GBP' },
    'Remote/Global': { min: 35000, median: 55000, max: 85000, currency: 'USD' },
  },
};

const allRoles = Object.keys(salaryDatabase);

/**
 * Simple fuzzy match: find the closest role name in the database.
 * Uses a basic substring + Levenshtein-like scoring approach.
 */
function fuzzyMatchRole(input) {
  if (!input) return null;

  const normalised = input.toLowerCase().trim();

  // 1) Exact match (case-insensitive)
  const exact = allRoles.find((r) => r.toLowerCase() === normalised);
  if (exact) return exact;

  // 2) Substring containment (both directions)
  const substringMatch = allRoles.find(
    (r) =>
      r.toLowerCase().includes(normalised) ||
      normalised.includes(r.toLowerCase())
  );
  if (substringMatch) return substringMatch;

  // 3) Word-overlap scoring
  const inputWords = normalised.split(/[\s/\-_]+/).filter(Boolean);

  let bestMatch = null;
  let bestScore = 0;

  for (const role of allRoles) {
    const roleWords = role.toLowerCase().split(/[\s/\-_]+/).filter(Boolean);
    let score = 0;

    for (const iw of inputWords) {
      for (const rw of roleWords) {
        if (rw === iw) {
          score += 3;
        } else if (rw.includes(iw) || iw.includes(rw)) {
          score += 2;
        } else if (rw.slice(0, 3) === iw.slice(0, 3) && iw.length >= 3) {
          score += 1;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = role;
    }
  }

  return bestScore >= 2 ? bestMatch : null;
}

/**
 * Map a free-text location input to a known region key.
 */
function matchRegion(location) {
  if (!location) return 'United States';

  const loc = location.toLowerCase().trim();

  const regionKeywords = {
    'United States': ['us', 'usa', 'united states', 'america', 'u.s.', 'u.s.a.'],
    'Canada': ['canada', 'ca', 'canadian', 'toronto', 'vancouver', 'montreal', 'ottawa'],
    'United Kingdom': ['uk', 'united kingdom', 'britain', 'england', 'london', 'gb', 'scotland', 'wales'],
    'Remote/Global': ['remote', 'global', 'worldwide', 'anywhere', 'distributed', 'international'],
  };

  for (const [region, keywords] of Object.entries(regionKeywords)) {
    if (keywords.some((kw) => loc.includes(kw))) {
      return region;
    }
  }

  // Default to US if nothing matches
  return 'United States';
}

/**
 * Get salary insights for a given role and location.
 *
 * @param {string} role - Job title / role (fuzzy matched)
 * @param {string} location - Location or region (fuzzy matched)
 * @returns {object|null} Salary insight data or null if no role match
 */
export function getSalaryInsights(role, location) {
  const matchedRole = fuzzyMatchRole(role);
  if (!matchedRole) return null;

  const matchedRegion = matchRegion(location);
  const roleData = salaryDatabase[matchedRole];

  // Primary region data
  const primary = {
    region: matchedRegion,
    ...roleData[matchedRegion],
  };

  // All regions for comparison
  const allRegions = Object.entries(roleData).map(([region, data]) => ({
    region,
    ...data,
    isPrimary: region === matchedRegion,
  }));

  return {
    matchedRole,
    matchedRegion,
    primary,
    allRegions,
    availableRoles: allRoles,
  };
}

export { allRoles, salaryDatabase };
