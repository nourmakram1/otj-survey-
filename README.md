# OTJ Survey — Deployment Guide
## From ZIP to live link in under 10 minutes

---

## STEP 1 — Set up Airtable (your database)

Airtable is where every form response will land. It's free.

1. Go to **airtable.com** and create a free account
2. Click **"Add a base"** → **"Start from scratch"**
3. Name it: `OTJ Survey Responses`
4. Inside that base, create **two tables**:

### Table 1: Name it `Creatives`
Add these fields (click the + to add each one, all type = "Single line text" unless noted):

| Field Name | Type |
|---|---|
| Full Name | Single line text |
| Email | Email |
| City | Single line text |
| Age Range | Single line text |
| Profession | Single line text |
| Specializations | Long text |
| Experience | Single line text |
| Portfolio | URL |
| Find Jobs Via | Long text |
| Job Search Struggle | Long text |
| Client Struggle | Long text |
| Project Management | Long text |
| Would Use - Specialized Jobs | Single line text |
| Would Use - Booking | Single line text |
| Would Use - Payments | Single line text |
| Would Use - Comms | Single line text |
| Availability | Single line text |
| Pay for Premium | Single line text |
| Phone | Phone number |
| Submitted At | Single line text |

### Table 2: Name it `Businesses`
Add these fields:

| Field Name | Type |
|---|---|
| Business Name | Single line text |
| Industry | Single line text |
| City | Single line text |
| Team Size | Single line text |
| Hire Frequency | Single line text |
| Find Creatives Via | Long text |
| Pain Points | Long text |
| Project Management | Long text |
| Would Use - Filter | Single line text |
| Would Use - Book | Single line text |
| Would Use - Tasks | Single line text |
| Would Use - Comms | Single line text |
| Would Use - No Commission | Single line text |
| Sub - Verified Creatives | Single line text |
| Sub - Hiring System | Single line text |
| Sub - PM Tools | Single line text |
| Monthly Budget | Single line text |
| Must-Have Feature | Long text |
| Contact Email | Email |
| Submitted At | Single line text |

---

## STEP 2 — Get your Airtable API keys

1. Go to **airtable.com/create/tokens**
2. Click **"Create new token"**
3. Name it: `OTJ Survey`
4. Under **Scopes**, add: `data.records:write`
5. Under **Access**, select your `OTJ Survey Responses` base
6. Click **Create token** — copy it (you won't see it again)
7. Go back to your base. Look at the URL: `airtable.com/appXXXXXX/...`
   — The `appXXXXXX` part is your **Base ID**

---

## STEP 3 — Upload to GitHub

1. Go to **github.com** → click **"New repository"**
2. Name it: `otj-survey`
3. Keep it **Public** (required for free Vercel hosting)
4. Click **"Create repository"**
5. On the next page, click **"uploading an existing file"**
6. **Drag the entire contents of this ZIP** into the GitHub upload area
   ⚠️ Upload all files INCLUDING the hidden `.gitignore` file
   ⚠️ Do NOT upload the `.env` file if you created one locally
7. Click **"Commit changes"**

---

## STEP 4 — Deploy on Vercel

1. Go to **vercel.com** and sign in with your GitHub account
2. Click **"Add New Project"**
3. Find and select your `otj-survey` repository
4. Vercel will auto-detect it as a Vite project ✅
5. **Before clicking Deploy**, go to **"Environment Variables"** and add:

| Key | Value |
|---|---|
| `VITE_AIRTABLE_BASE_ID` | `appXXXXXX` (your Base ID from Step 2) |
| `VITE_AIRTABLE_API_KEY` | `patXXXXXX...` (your token from Step 2) |

6. Click **Deploy**
7. In ~60 seconds you'll get a live URL like: `otj-survey.vercel.app`

---

## STEP 5 — Share your live link

You now have two shareable URLs:
- **For creatives:** `https://otj-survey.vercel.app` → they pick "Creative"
- **For businesses:** `https://otj-survey.vercel.app` → they pick "Business"

Send it over WhatsApp, Instagram DM, email — wherever your network is.

---

## Viewing responses

Go to **airtable.com** → your base → switch between the `Creatives` and `Businesses` tables.

Every submission appears as a new row instantly. You can:
- Filter by city, profession, or any field
- Sort by date submitted
- Export to CSV
- Share a view with your team

---

## Custom domain (optional)

In Vercel → your project → Settings → Domains → add `survey.otj.io` or any domain you own.

---

## Questions?

Built by OTJ co-founding team. Every response shapes what we build first.
