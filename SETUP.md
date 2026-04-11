# JobHunt — Setup Guide

## What You Need First

- **Node.js** (the software that runs the app): Download from https://nodejs.org — pick "LTS" version
- **Git** (to push code to GitHub): Download from https://git-scm.com
- A free account at **https://developer.adzuna.com** (for job listings)

---

## Step 1 — Install Node.js

1. Go to https://nodejs.org
2. Click the big green "LTS" button to download
3. Run the installer — click Next on everything
4. When done, open **Terminal** (Mac: press Cmd+Space, type Terminal)
5. Type this and press Enter to verify it worked:
   ```
   node --version
   ```
   You should see something like `v20.x.x`

---

## Step 2 — Get Your Free Adzuna API Key

1. Go to https://developer.adzuna.com
2. Click "Register" — it's completely free
3. After signing up, go to "API Access Details"
4. Copy your **App ID** and **App Key**
5. Open the file `.env.local` in this folder and paste them:
   ```
   ADZUNA_APP_ID=your_app_id_here
   ADZUNA_APP_KEY=your_app_key_here
   ```

> Without Adzuna keys, only remote jobs from Jobicy will show up.
> With Adzuna (free), you get jobs from 50+ boards worldwide.

---

## Step 3 — Run the App

Open **Terminal**, navigate to this folder:
```bash
cd ~/Desktop/Jobhunt
```

Then run the setup command (only needed once):
```bash
npm run setup
```

This installs all dependencies, creates the database, and sets up your accounts.

Then start the app:
```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

---

## Step 4 — Login

| Who | Email | Password |
|-----|-------|----------|
| Nishanth | nishanth@jobhunt.app | changeme123 |
| Indhu | indhu@jobhunt.app | changeme123 |

> **Important:** Change your passwords after first login for security.

---

## How to Use the App

### First time setup (5 minutes):
1. **Upload your resume** → Click "My Resume" in the sidebar → drag and drop your PDF or Word resume
2. **Set preferences** → Click "Preferences" → add your target job roles and preferred locations
3. **Search jobs** → Click "Jobs" → type a job title → click Search

### Daily use:
- **Dashboard** shows your saved jobs, match scores, and application pipeline
- **Jobs page** — search for new jobs, click the bookmark icon to save interesting ones
- **Job detail page** — click any saved job to:
  - See your ATS score for that job
  - Generate a tailored resume (downloads as Word file)
  - Generate a cover letter
  - Get an email draft to send to HR
  - Update application status (Saved → Applied → Interview → Offer)

---

## Understanding the Scores

**Match Score (%)** — How well your profile fits the job overall
- Based on: your skills vs job requirements, your job title, your experience level
- Green (80%+) = Great fit
- Yellow (60-79%) = Good fit  
- Orange (40-59%) = Moderate fit
- Red (<40%) = Stretch role

**ATS Score (%)** — How well your resume would pass through job application software
- ATS = Applicant Tracking System (used by most companies to filter resumes)
- Higher = your resume contains more of the keywords the employer is looking for
- Click "Score ATS" on any job detail page to see the breakdown

---

## Deploying to the Internet (Vercel)

To make the app accessible online (so both you and Indhu can use it from anywhere):

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial JobHunt app"
   git remote add origin https://github.com/Nishanth91/Jobhunt.git
   git push -u origin main
   ```

2. Go to https://vercel.com — sign up with your GitHub account

3. Click "Add New Project" → Import your GitHub repo

4. Add these Environment Variables in Vercel settings:
   - `NEXTAUTH_SECRET` = any random string (e.g. use https://generate-secret.vercel.app/32)
   - `NEXTAUTH_URL` = your Vercel URL (e.g. https://jobhunt-abc.vercel.app)
   - `DATABASE_URL` = `file:./dev.db`
   - `ADZUNA_APP_ID` = your Adzuna App ID
   - `ADZUNA_APP_KEY` = your Adzuna App Key
   - `ADZUNA_COUNTRY` = `us` (or your country code)

5. Click Deploy — that's it!

> **Note on the database:** SQLite works great locally. For production on Vercel, you may eventually want to migrate to a free cloud database like Turso (https://turso.tech). This can be done later when needed.

---

## Stopping the App

Press `Ctrl+C` in the Terminal window where the app is running.

To start it again next time:
```bash
cd ~/Desktop/Jobhunt
npm run dev
```
