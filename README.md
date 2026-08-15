# Car Diary

An app for tracking your vehicle's service history, including repairs,
inspections, mileage, and ownership expenses.

## Requirements

- Node.js 20 or newer
- npm
- a Supabase project

## Local development

```bash
npm install
copy .env.example .env.local
npm run dev
```

Add your project values to `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The publishable key is intended for browser use together with Row Level
Security. Never add a `service_role` key to the frontend or commit secrets.

For email confirmation links, set the local Site URL and Redirect URL under
**Authentication > URL Configuration**:

```text
http://localhost:5173
```

## Supabase database

The initial database schema is stored in
`supabase/migrations/20260815000000_initial_schema.sql`. It creates the
`vehicles` and `service_records` tables, indexes, update triggers, and RLS
policies scoped to the authenticated user.

After creating a Supabase project, apply the migration:

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

Database changes should be added as new migration files and committed to the
repository instead of being made directly in the remote dashboard.

## Available scripts

- `npm run dev` - start the development server
- `npm run build` - type-check and create a production build
- `npm run lint` - run static code analysis
- `npm run preview` - preview the production build locally

## Current features

- multiple vehicle profiles with active vehicle switching,
- vehicle profile editing and deletion,
- service records with mileage, workshop, cost, and notes,
- service record editing and deletion,
- service timeline and vehicle summary,
- email and password authentication,
- Supabase-backed vehicle and service record storage,
- row-level data isolation for every account.

Older local data under `car-diary:data:v2` is left untouched as a backup, but
the application now reads and writes its active data through Supabase.
