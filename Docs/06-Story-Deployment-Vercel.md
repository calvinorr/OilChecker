# Story 6: Deployment & Automation

## 📝 Description
Finally, we put the app on the internet and set the scraper to run automatically.

## 🏃‍♂️ Action Items

### 1. Configure Vercel Cron
Create `vercel.json` in the root:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 8 * * *" 
    }
  ]
}
```
*(This runs at 8:00 AM UTC every day)*.

### 2. Deploy
1. Push your code to a GitHub repository.
2. Go to [Vercel.com](https://vercel.com), "Add New Project", and select your repo.
3. **Environment Variables**: You MUST add these in the Vercel Project Settings:
   - `DATABASE_URL` (from Neon)
   - `API_KEY` (from Google AI Studio)
   - `CRON_SECRET` (The password you made up in Story 3)

### 3. Deploy & Test
Hit "Deploy". Once live:
1. Go to the Vercel Dashboard for your project.
2. Click "Settings" -> "Cron Jobs".
3. You should see your job listed. You can manually trigger it to test if the scraper works in production.

## ✅ Success Criteria
- [ ] The app is accessible via a `vercel.app` URL.
- [ ] The Cron Job is listed in Vercel dashboard.
- [ ] You are effectively tracking oil prices for free! 
