import axios from 'axios';

// Read keys at call time (not module load time) so env changes are picked up
function getKeys() {
  return {
    // Adzuna (fallback)
    adzunaAppId: process.env.ADZUNA_APP_ID,
    adzunaAppKey: process.env.ADZUNA_APP_KEY,
    adzunaCountry: process.env.ADZUNA_COUNTRY || 'us',
    // JSearch (primary) — RapidAPI
    jsearchKey: process.env.JSEARCH_API_KEY,
    // SerpAPI (Google Jobs — secondary)
    serpApiKey: process.env.SERPAPI_KEY,
    // The Muse (optional, free with key)
    theMuseKey: process.env.THE_MUSE_API_KEY,
  };
}

// Map location strings to Adzuna country codes
function detectCountry(location, defaultCountry) {
  if (!location) return defaultCountry;
  const loc = location.toLowerCase();

  if (/canada|toronto|vancouver|montreal|calgary|ottawa|edmonton|winnipeg/.test(loc)) return 'ca';
  if (/uk|united kingdom|london|manchester|birmingham|edinburgh|glasgow/.test(loc)) return 'gb';
  if (/australia|sydney|melbourne|brisbane|perth|adelaide/.test(loc)) return 'au';
  if (/india|bangalore|mumbai|delhi|hyderabad|chennai|pune/.test(loc)) return 'in';
  if (/germany|berlin|munich|hamburg|frankfurt/.test(loc)) return 'de';
  if (/france|paris|lyon|marseille/.test(loc)) return 'fr';
  if (/singapore/.test(loc)) return 'sg';
  if (/new zealand|auckland|wellington/.test(loc)) return 'nz';
  if (/netherlands|amsterdam/.test(loc)) return 'nl';
  if (/austria|vienna/.test(loc)) return 'at';
  if (/brazil|sao paulo|rio/.test(loc)) return 'br';
  if (/mexico/.test(loc)) return 'mx';
  if (/poland|warsaw/.test(loc)) return 'pl';
  if (/usa|united states|new york|san francisco|austin|seattle|chicago|boston|los angeles|remote/.test(loc)) return 'us';

  return defaultCountry;
}

/**
 * PRIMARY: JSearch API via RapidAPI (~500 free req/month)
 * Returns rich job data with direct apply links
 */
export async function searchJSearch({ query, location, page = 1 }) {
  const { jsearchKey } = getKeys();
  if (!jsearchKey) {
    console.warn('[JSearch] JSEARCH_API_KEY not set');
    return { jobs: [], total: 0, error: 'JSearch key not configured' };
  }

  try {
    const q = location ? `${query} in ${location}` : query;
    console.log(`[JSearch] Searching: "${q}" page ${page}`);

    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: { query: q, page: String(page), num_pages: '1', date_posted: 'month' },
      headers: {
        'X-RapidAPI-Key': jsearchKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
      timeout: 15000,
    });

    const data = response.data;
    const jobs = (data.data || []).map((job) => ({
      externalId: `jsearch_${job.job_id}`,
      title: job.job_title,
      company: job.employer_name || 'Unknown Company',
      location: job.job_city
        ? `${job.job_city}${job.job_state ? ', ' + job.job_state : ''}${job.job_country ? ', ' + job.job_country : ''}`
        : job.job_is_remote ? 'Remote' : 'Not specified',
      description: job.job_description || '',
      url: job.job_apply_link || job.job_google_link || '',
      salary: formatSalaryRange(
        job.job_min_salary,
        job.job_max_salary,
        job.job_salary_currency,
        job.job_salary_period
      ),
      postedAt: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : null,
      source: 'jsearch',
      companyWebsite: job.employer_website || null,
      hrEmail: null,
    }));

    console.log(`[JSearch] Found ${jobs.length} results`);
    return { jobs, total: data.parameters?.num_pages ? data.parameters.num_pages * 10 : jobs.length };
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    console.error('[JSearch] Error:', msg, '| status:', err.response?.status);
    return { jobs: [], total: 0, error: msg };
  }
}

/**
 * SECONDARY: SerpAPI Google Jobs (~100 free searches/month)
 */
export async function searchSerpAPI({ query, location, page = 1 }) {
  const { serpApiKey } = getKeys();
  if (!serpApiKey) {
    console.warn('[SerpAPI] SERPAPI_KEY not set');
    return { jobs: [], total: 0, error: 'SerpAPI key not configured' };
  }

  try {
    const q = location ? `${query} ${location}` : query;
    console.log(`[SerpAPI] Searching: "${q}"`);

    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google_jobs',
        q,
        api_key: serpApiKey,
        start: String((page - 1) * 10),
        hl: 'en',
      },
      timeout: 15000,
    });

    const data = response.data;
    const jobs = (data.jobs_results || []).map((job, idx) => ({
      externalId: `serp_${Buffer.from(job.title + job.company_name + idx).toString('base64').slice(0, 20)}`,
      title: job.title,
      company: job.company_name || 'Unknown Company',
      location: job.location || location || 'Not specified',
      description: job.description || '',
      url: job.share_link || '',
      salary: job.detected_extensions?.salary || null,
      postedAt: job.detected_extensions?.posted_at
        ? parseRelativeDate(job.detected_extensions.posted_at)
        : null,
      source: 'google',
      companyWebsite: null,
      hrEmail: null,
    }));

    console.log(`[SerpAPI] Found ${jobs.length} results`);
    return { jobs, total: jobs.length };
  } catch (err) {
    const msg = err.response?.data?.error || err.message;
    console.error('[SerpAPI] Error:', msg, '| status:', err.response?.status);
    return { jobs: [], total: 0, error: msg };
  }
}

/**
 * FALLBACK: Adzuna API (free tier: 250 req/day)
 */
export async function searchAdzuna({ query, location, page = 1, resultsPerPage = 20 }) {
  const { adzunaAppId, adzunaAppKey, adzunaCountry } = getKeys();

  if (!adzunaAppId || !adzunaAppKey) {
    console.warn('[Adzuna] API keys not set in .env.local');
    return { jobs: [], total: 0, error: 'Adzuna API keys not configured' };
  }

  const country = detectCountry(location, adzunaCountry);

  try {
    const params = new URLSearchParams({
      app_id: adzunaAppId,
      app_key: adzunaAppKey,
      results_per_page: String(resultsPerPage),
      what: query,
    });

    if (location) params.append('where', location);

    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params}`;
    console.log(`[Adzuna] Searching: ${query} in ${location || 'anywhere'} (country: ${country})`);

    const response = await axios.get(url, { timeout: 12000 });
    const data = response.data;

    console.log(`[Adzuna] Found ${data.count || 0} results`);

    const jobs = (data.results || []).map((job) => ({
      externalId: `adzuna_${job.id}`,
      title: job.title,
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || location || 'Not specified',
      description: job.description || '',
      url: job.redirect_url || '',
      salary: formatSalary(job.salary_min, job.salary_max),
      postedAt: job.created ? new Date(job.created) : null,
      source: 'adzuna',
      companyWebsite: null,
      hrEmail: null,
    }));

    return { jobs, total: data.count || 0 };
  } catch (err) {
    const body = err.response?.data;
    const msg = body?.exception || body?.error || err.message;
    console.error('[Adzuna] Error:', msg, '| status:', err.response?.status, '| body:', JSON.stringify(body));
    return { jobs: [], total: 0, error: msg };
  }
}

/**
 * ADDITIONAL: Remotive (completely free, no auth — remote jobs only)
 */
export async function searchRemotive({ query, count = 20 }) {
  try {
    const params = new URLSearchParams({ search: query, limit: String(count) });
    const url = `https://remotive.com/api/remote-jobs?${params}`;

    console.log(`[Remotive] Searching: ${query}`);
    const response = await axios.get(url, { timeout: 12000 });
    const data = response.data;

    const jobs = (data.jobs || []).map((job) => ({
      externalId: `remotive_${job.id}`,
      title: job.title,
      company: job.company_name || 'Unknown Company',
      location: job.candidate_required_location || 'Remote',
      description: stripHtml(job.description || ''),
      url: job.url || '',
      salary: job.salary || null,
      postedAt: job.publication_date ? new Date(job.publication_date) : null,
      source: 'remotive',
      companyWebsite: job.company_logo ? null : null,
      hrEmail: null,
    }));

    console.log(`[Remotive] Found ${jobs.length} results`);
    return { jobs, total: jobs.length };
  } catch (err) {
    console.error('[Remotive] Error:', err.message);
    return { jobs: [], total: 0, error: err.message };
  }
}

/**
 * OPTIONAL: Jobicy (completely free, no auth — remote jobs)
 */
export async function searchJobicy({ query, count = 20 }) {
  try {
    const params = new URLSearchParams({ count: String(count), tag: query });
    const url = `https://jobicy.com/api/v2/remote-jobs?${params}`;

    console.log(`[Jobicy] Searching: ${query}`);
    const response = await axios.get(url, { timeout: 12000 });
    const data = response.data;

    const jobs = (data.jobs || []).map((job) => ({
      externalId: `jobicy_${job.id}`,
      title: job.jobTitle,
      company: job.companyName || 'Unknown Company',
      location: 'Remote',
      description: stripHtml(job.jobDescription || ''),
      url: job.url || '',
      salary: job.annualSalaryMax
        ? `$${Number(job.annualSalaryMin || 0).toLocaleString()} – $${Number(job.annualSalaryMax).toLocaleString()}`
        : null,
      postedAt: job.pubDate ? new Date(job.pubDate) : null,
      source: 'jobicy',
      companyWebsite: null,
      hrEmail: null,
    }));

    console.log(`[Jobicy] Found ${jobs.length} results`);
    return { jobs, total: jobs.length };
  } catch (err) {
    console.error('[Jobicy] Error:', err.message);
    return { jobs: [], total: 0, error: err.message };
  }
}

/**
 * OPTIONAL: The Muse API (free with key, ~1000 req/day)
 */
export async function searchTheMuse({ query, location, page = 0 }) {
  const { theMuseKey } = getKeys();

  try {
    const params = new URLSearchParams({
      page: String(page),
      descending: 'true',
      // category and level not filtered — let query match naturally
    });
    if (theMuseKey) params.append('api_key', theMuseKey);

    // The Muse doesn't support full-text search — search by category name heuristic
    const categoryMap = {
      engineer: 'Engineering', developer: 'Engineering', software: 'Engineering',
      design: 'Design', ux: 'Design', ui: 'Design',
      product: 'Product', marketing: 'Marketing', data: 'Data Science',
      finance: 'Finance', sales: 'Sales', hr: 'Human Resources',
      operations: 'Operations', legal: 'Legal',
    };
    const queryLower = query.toLowerCase();
    const category = Object.entries(categoryMap).find(([k]) => queryLower.includes(k))?.[1];
    if (category) params.append('category', category);

    const url = `https://www.themuse.com/api/public/jobs?${params}`;
    console.log(`[TheMuse] Searching: ${query} → category: ${category || 'all'}`);

    const response = await axios.get(url, { timeout: 12000 });
    const data = response.data;

    // Filter results by query match
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);
    const jobs = (data.results || [])
      .filter((job) => {
        const text = `${job.name} ${job.company?.name || ''} ${(job.levels || []).map((l) => l.name).join(' ')}`.toLowerCase();
        return queryWords.some((w) => text.includes(w));
      })
      .slice(0, 20)
      .map((job) => {
        const loc = job.locations?.[0]?.name || location || 'Not specified';
        return {
          externalId: `muse_${job.id}`,
          title: job.name,
          company: job.company?.name || 'Unknown Company',
          location: loc,
          description: stripHtml(job.contents || job.short_name || ''),
          url: job.refs?.landing_page || '',
          salary: null,
          postedAt: job.publication_date ? new Date(job.publication_date) : null,
          source: 'themuse',
          companyWebsite: job.company?.refs?.landing_page || null,
          hrEmail: null,
        };
      });

    console.log(`[TheMuse] Found ${jobs.length} matching results`);
    return { jobs, total: jobs.length };
  } catch (err) {
    console.error('[TheMuse] Error:', err.message);
    return { jobs: [], total: 0, error: err.message };
  }
}

/**
 * Combined job search from all available sources
 * Priority: JSearch > SerpAPI > Adzuna (fallback) + Remotive + Jobicy + TheMuse (always)
 */
export async function searchAllSources({ query, location, page = 1 }) {
  const { jsearchKey, serpApiKey, adzunaAppId } = getKeys();

  // Run all sources in parallel
  const [jsearchResult, serpResult, adzunaResult, remotiveResult, jobicyResult, theMuseResult] =
    await Promise.allSettled([
      jsearchKey ? searchJSearch({ query, location, page }) : Promise.resolve({ jobs: [], total: 0 }),
      serpApiKey ? searchSerpAPI({ query, location, page }) : Promise.resolve({ jobs: [], total: 0 }),
      adzunaAppId ? searchAdzuna({ query, location, page }) : Promise.resolve({ jobs: [], total: 0, error: 'Adzuna keys not set' }),
      searchRemotive({ query }),
      searchJobicy({ query }),
      searchTheMuse({ query, location }),
    ]);

  const jsearchJobs = jsearchResult.status === 'fulfilled' ? jsearchResult.value.jobs : [];
  const serpJobs = serpResult.status === 'fulfilled' ? serpResult.value.jobs : [];
  const adzunaJobs = adzunaResult.status === 'fulfilled' ? adzunaResult.value.jobs : [];
  const remotiveJobs = remotiveResult.status === 'fulfilled' ? remotiveResult.value.jobs : [];
  const jobicyJobs = jobicyResult.status === 'fulfilled' ? jobicyResult.value.jobs : [];
  const theMuseJobs = theMuseResult.status === 'fulfilled' ? theMuseResult.value.jobs : [];

  const adzunaError = adzunaResult.status === 'fulfilled' ? adzunaResult.value.error : null;

  // Merge: prioritise JSearch (richest data), then SerpAPI, then others
  const all = [...jsearchJobs, ...serpJobs, ...adzunaJobs, ...remotiveJobs, ...jobicyJobs, ...theMuseJobs];

  // Deduplicate by normalised title + company
  const seen = new Set();
  const unique = all.filter((job) => {
    const key = normaliseKey(`${job.title}-${job.company}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const sources = {
    jsearch: jsearchJobs.length,
    google: serpJobs.length,
    adzuna: adzunaJobs.length,
    remotive: remotiveJobs.length,
    jobicy: jobicyJobs.length,
    themuse: theMuseJobs.length,
  };

  console.log(`[JobSearch] Total unique: ${unique.length} from`, sources);

  return {
    jobs: unique,
    total: unique.length,
    sources,
    adzunaError: !jsearchKey && !serpApiKey ? adzunaError : null,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normaliseKey(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
}

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => `$${Math.round(n).toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
}

function formatSalaryRange(min, max, currency = 'USD', period = 'YEAR') {
  if (!min && !max) return null;
  const sym = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : (currency + ' ');
  const fmt = (n) => `${sym}${Math.round(n).toLocaleString()}`;
  const suffix = period === 'HOUR' ? '/hr' : period === 'MONTH' ? '/mo' : '/yr';
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`;
  if (min) return `From ${fmt(min)}${suffix}`;
  return `Up to ${fmt(max)}${suffix}`;
}

function parseRelativeDate(str) {
  if (!str) return null;
  const now = new Date();
  const match = str.match(/(\d+)\s*(hour|day|week|month)/i);
  if (!match) return null;
  const [, n, unit] = match;
  const num = parseInt(n);
  const ms = { hour: 3600000, day: 86400000, week: 604800000, month: 2592000000 }[unit.toLowerCase()];
  return ms ? new Date(now - num * ms) : null;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}
