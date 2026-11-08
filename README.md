# Blind Team Generator

A mobile-friendly Next.js + Supabase starter application with:
- Public name-only registration.
- Private organizer dashboard.
- Random teams of four; a final team of 1–3 is allowed.
- Registration close/open controls.
- Private team preview and one-click reveal.
- Reset for a new event.

## Important privacy design

The browser never receives participant names or team assignments before reveal. All database access uses the Supabase service-role key from server-side code. Do not add `SUPABASE_SERVICE_ROLE_KEY` to a `NEXT_PUBLIC_` variable, commit `.env.local`, or share it.

This starter is designed for one event at a time. The organizer password is configured as an environment variable. Use a unique, strong password and a random session secret.

## 1. Create Supabase database

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Paste and run `supabase/schema.sql`.
4. In Project Settings → API, copy the Project URL and `service_role` key. Keep the key private.

## 2. Configure locally

Install Node.js 20.9 or later.

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: service-role key (server only).
- `ADMIN_PASSWORD`: a long, unique organizer password.
- `ADMIN_SESSION_SECRET`: random secret of at least 32 characters.

Generate a secret with:
```bash
openssl rand -hex 32
```

## 3. Run

```bash
npm run dev
```

Open:
- Participant page: http://localhost:3000
- Organizer dashboard: http://localhost:3000/admin

## 4. Publish online

1. Push this project to a private GitHub repository.
2. Import it into Vercel.
3. Add the same four environment variables in Vercel Project Settings → Environment Variables.
4. Deploy.
5. Share the deployed root URL with participants. Keep `/admin` and the organizer password for organizers only.

## Organizer workflow

1. Registration starts open.
2. Share the root URL.
3. Open `/admin`, sign in, and monitor the count.
4. Close registration.
5. Click **Generate teams**. The private preview is shown only to the organizer.
6. When ready, click **Reveal teams**. The public page will show every team.
7. Reset only when you are ready to delete the current event's participants and assignments.

## Team-size behavior

The app shuffles all registrants with Node's cryptographic random number generator and slices the shuffled list into groups of four. A final group can contain 1, 2, or 3 participants. For example, 10 participants become 4 + 4 + 2.

## Before using for a real event

This is a functional starter, not a fully audited production service. Add rate limiting / CAPTCHA to public registration, stronger organizer account management, backups, and event-specific access controls before a large public launch. Duplicate-name checking is case-insensitive, but name-only registration cannot reliably distinguish two different people with the same name. The reset action permanently deletes current registrations.
