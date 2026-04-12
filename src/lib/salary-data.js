// Salary ranges for common roles in Canada and the US.
// Roles include Canadian NOC codes for easy identification.
// Data is template-based; used by the Salary Insights page.

const salaryDatabase = {
  'Production Supervisor': {
    noc: '9211', category: 'Manufacturing & Trades',
    'Canada': { min: 45000, median: 65000, max: 95000, currency: 'CAD' },
    'United States': { min: 50000, median: 72000, max: 105000, currency: 'USD' },
  },
  'Industrial Engineer': {
    noc: '2141', category: 'Engineering',
    'Canada': { min: 60000, median: 82000, max: 115000, currency: 'CAD' },
    'United States': { min: 70000, median: 95000, max: 130000, currency: 'USD' },
  },
  'Machinist': {
    noc: '7231', category: 'Manufacturing & Trades',
    'Canada': { min: 40000, median: 58000, max: 80000, currency: 'CAD' },
    'United States': { min: 38000, median: 55000, max: 78000, currency: 'USD' },
  },
  'Welder': {
    noc: '7237', category: 'Manufacturing & Trades',
    'Canada': { min: 38000, median: 55000, max: 82000, currency: 'CAD' },
    'United States': { min: 40000, median: 58000, max: 85000, currency: 'USD' },
  },
  'Electrician': {
    noc: '7241', category: 'Manufacturing & Trades',
    'Canada': { min: 50000, median: 72000, max: 100000, currency: 'CAD' },
    'United States': { min: 48000, median: 68000, max: 98000, currency: 'USD' },
  },
  'Millwright': {
    noc: '7311', category: 'Manufacturing & Trades',
    'Canada': { min: 52000, median: 75000, max: 105000, currency: 'CAD' },
    'United States': { min: 50000, median: 72000, max: 100000, currency: 'USD' },
  },
  'Quality Control Inspector': {
    noc: '2262', category: 'Manufacturing & Trades',
    'Canada': { min: 40000, median: 55000, max: 78000, currency: 'CAD' },
    'United States': { min: 38000, median: 52000, max: 75000, currency: 'USD' },
  },
  'Mechanical Engineer': {
    noc: '2132', category: 'Engineering',
    'Canada': { min: 62000, median: 85000, max: 120000, currency: 'CAD' },
    'United States': { min: 75000, median: 100000, max: 140000, currency: 'USD' },
  },
  'Civil Engineer': {
    noc: '2131', category: 'Engineering',
    'Canada': { min: 60000, median: 80000, max: 115000, currency: 'CAD' },
    'United States': { min: 70000, median: 95000, max: 135000, currency: 'USD' },
  },
  'Electrical Engineer': {
    noc: '2133', category: 'Engineering',
    'Canada': { min: 62000, median: 88000, max: 125000, currency: 'CAD' },
    'United States': { min: 78000, median: 105000, max: 150000, currency: 'USD' },
  },
  'Software Engineer': {
    noc: '2173', category: 'Technology',
    'Canada': { min: 70000, median: 100000, max: 155000, currency: 'CAD' },
    'United States': { min: 90000, median: 130000, max: 200000, currency: 'USD' },
  },
  'Frontend Developer': {
    noc: '2175', category: 'Technology',
    'Canada': { min: 60000, median: 90000, max: 140000, currency: 'CAD' },
    'United States': { min: 80000, median: 120000, max: 180000, currency: 'USD' },
  },
  'Backend Developer': {
    noc: '2175', category: 'Technology',
    'Canada': { min: 70000, median: 105000, max: 160000, currency: 'CAD' },
    'United States': { min: 90000, median: 135000, max: 210000, currency: 'USD' },
  },
  'Full Stack Developer': {
    noc: '2175', category: 'Technology',
    'Canada': { min: 65000, median: 98000, max: 150000, currency: 'CAD' },
    'United States': { min: 85000, median: 128000, max: 195000, currency: 'USD' },
  },
  'Data Analyst': {
    noc: '2172', category: 'Technology',
    'Canada': { min: 48000, median: 68000, max: 100000, currency: 'CAD' },
    'United States': { min: 55000, median: 78000, max: 115000, currency: 'USD' },
  },
  'Data Scientist': {
    noc: '2172', category: 'Technology',
    'Canada': { min: 75000, median: 110000, max: 170000, currency: 'CAD' },
    'United States': { min: 95000, median: 140000, max: 220000, currency: 'USD' },
  },
  'DevOps Engineer': {
    noc: '2171', category: 'Technology',
    'Canada': { min: 75000, median: 110000, max: 165000, currency: 'CAD' },
    'United States': { min: 95000, median: 140000, max: 210000, currency: 'USD' },
  },
  'Cloud Engineer': {
    noc: '2171', category: 'Technology',
    'Canada': { min: 78000, median: 112000, max: 168000, currency: 'CAD' },
    'United States': { min: 95000, median: 140000, max: 210000, currency: 'USD' },
  },
  'Machine Learning Engineer': {
    noc: '2173', category: 'Technology',
    'Canada': { min: 85000, median: 125000, max: 195000, currency: 'CAD' },
    'United States': { min: 110000, median: 160000, max: 250000, currency: 'USD' },
  },
  'Cybersecurity Analyst': {
    noc: '2171', category: 'Technology',
    'Canada': { min: 60000, median: 88000, max: 135000, currency: 'CAD' },
    'United States': { min: 75000, median: 110000, max: 165000, currency: 'USD' },
  },
  'Oracle DBA': {
    noc: '2172', category: 'Technology',
    'Canada': { min: 70000, median: 100000, max: 150000, currency: 'CAD' },
    'United States': { min: 85000, median: 120000, max: 175000, currency: 'USD' },
  },
  'Product Manager': {
    noc: '0213', category: 'Business & Management',
    'Canada': { min: 80000, median: 115000, max: 175000, currency: 'CAD' },
    'United States': { min: 100000, median: 145000, max: 225000, currency: 'USD' },
  },
  'Project Manager': {
    noc: '0213', category: 'Business & Management',
    'Canada': { min: 60000, median: 85000, max: 130000, currency: 'CAD' },
    'United States': { min: 70000, median: 100000, max: 150000, currency: 'USD' },
  },
  'Business Analyst': {
    noc: '1122', category: 'Business & Management',
    'Canada': { min: 52000, median: 75000, max: 115000, currency: 'CAD' },
    'United States': { min: 60000, median: 85000, max: 130000, currency: 'USD' },
  },
  'Financial Analyst': {
    noc: '1112', category: 'Business & Management',
    'Canada': { min: 52000, median: 72000, max: 110000, currency: 'CAD' },
    'United States': { min: 60000, median: 85000, max: 130000, currency: 'USD' },
  },
  'Accountant': {
    noc: '1111', category: 'Business & Management',
    'Canada': { min: 48000, median: 65000, max: 95000, currency: 'CAD' },
    'United States': { min: 52000, median: 75000, max: 110000, currency: 'USD' },
  },
  'Human Resources Manager': {
    noc: '0112', category: 'Business & Management',
    'Canada': { min: 65000, median: 90000, max: 135000, currency: 'CAD' },
    'United States': { min: 75000, median: 110000, max: 160000, currency: 'USD' },
  },
  'Marketing Manager': {
    noc: '0124', category: 'Business & Management',
    'Canada': { min: 55000, median: 80000, max: 125000, currency: 'CAD' },
    'United States': { min: 65000, median: 95000, max: 150000, currency: 'USD' },
  },
  'Sales Manager': {
    noc: '0601', category: 'Business & Management',
    'Canada': { min: 55000, median: 78000, max: 120000, currency: 'CAD' },
    'United States': { min: 65000, median: 95000, max: 150000, currency: 'USD' },
  },
  'Administrative Assistant': {
    noc: '1241', category: 'Business & Management',
    'Canada': { min: 35000, median: 45000, max: 58000, currency: 'CAD' },
    'United States': { min: 32000, median: 42000, max: 55000, currency: 'USD' },
  },
  'UX Designer': {
    noc: '2174', category: 'Technology',
    'Canada': { min: 58000, median: 85000, max: 130000, currency: 'CAD' },
    'United States': { min: 75000, median: 110000, max: 165000, currency: 'USD' },
  },
  'Registered Nurse': {
    noc: '3012', category: 'Healthcare',
    'Canada': { min: 60000, median: 78000, max: 100000, currency: 'CAD' },
    'United States': { min: 58000, median: 80000, max: 115000, currency: 'USD' },
  },
  'Truck Driver': {
    noc: '7511', category: 'Transportation & Trades',
    'Canada': { min: 42000, median: 58000, max: 85000, currency: 'CAD' },
    'United States': { min: 45000, median: 60000, max: 90000, currency: 'USD' },
  },
  'Carpenter': {
    noc: '7271', category: 'Manufacturing & Trades',
    'Canada': { min: 40000, median: 58000, max: 82000, currency: 'CAD' },
    'United States': { min: 38000, median: 55000, max: 80000, currency: 'USD' },
  },
  'Plumber': {
    noc: '7251', category: 'Manufacturing & Trades',
    'Canada': { min: 45000, median: 65000, max: 95000, currency: 'CAD' },
    'United States': { min: 42000, median: 60000, max: 90000, currency: 'USD' },
  },
  'Chef / Cook': {
    noc: '6321', category: 'Service',
    'Canada': { min: 30000, median: 42000, max: 65000, currency: 'CAD' },
    'United States': { min: 32000, median: 48000, max: 75000, currency: 'USD' },
  },
};

const allRoles = Object.keys(salaryDatabase);

/**
 * Build a flat list of { role, noc, category } for autocomplete.
 */
export const roleList = allRoles.map((r) => ({
  role: r,
  noc: salaryDatabase[r].noc,
  category: salaryDatabase[r].category,
}));

/**
 * Simple fuzzy match: find the closest role name in the database.
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

  // 3) NOC code match
  const nocMatch = allRoles.find((r) => salaryDatabase[r].noc === normalised);
  if (nocMatch) return nocMatch;

  // 4) Word-overlap scoring
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
 * Get salary insights for a given role.
 * Returns Canada first, then US.
 *
 * @param {string} role - Job title / role (fuzzy matched)
 * @returns {object|null} Salary insight data or null if no role match
 */
export function getSalaryInsights(role) {
  const matchedRole = fuzzyMatchRole(role);
  if (!matchedRole) return null;

  const roleData = salaryDatabase[matchedRole];

  // Canada first, US second
  const regions = ['Canada', 'United States'];

  const allRegions = regions.map((region) => ({
    region,
    ...roleData[region],
    isPrimary: region === 'Canada',
  }));

  return {
    matchedRole,
    noc: roleData.noc,
    category: roleData.category,
    primary: { region: 'Canada', ...roleData['Canada'] },
    allRegions,
    availableRoles: roleList,
  };
}

export { allRoles, salaryDatabase };
