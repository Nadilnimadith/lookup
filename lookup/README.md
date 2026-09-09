# LOOK UP — Professional full-stack version

This version keeps the original social-studio UI but upgrades authentication and user data:

- Modern animated Sign in / Create account bar
- Email verification code (6 digits, 10-minute expiry)
- Google OAuth
- PostgreSQL database (Neon)
- Secure HttpOnly JWT session cookie
- Real follower/following/post counters
- Follow/unfollow API
- PWA manifest and icon
- Vercel serverless API

## Deploy

1. Create a Neon Postgres database and run `schema.sql`.
2. Create a Resend account and verify a sending domain/email.
3. Create a Google OAuth Web application. Add the exact callback:
   `https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/google-callback`
4. Import this project into Vercel.
5. Add the variables from `.env.example`.
6. Redeploy.

Important: GitHub Pages can host the frontend, but it cannot run the `/api` server/database functions. Use Vercel (or another server platform) for this full-stack build.

Email codes are delivered by Resend; Google itself does not send the LOOK UP verification code.
