# Role Model Flow 💜

React + Vite app for collecting role models, observing careers and saving the opportunities that might lead to similar work.

## Tabs
- **홈**: register role models with a field, current career, desired career trajectory, notes, source link; view counts.
- **영상 북마크**: category chips and a drill-style accordion for each role model, multiple YouTube/Instagram video references, link copy, original link, notes.
- **인박스**: Focus Flow's inbox UI (unclassified notes, Today, folders, archive, checklist text, YouTube previews, images).

## Supabase setup
1. Create a dedicated Supabase project.
2. Run [sql/setup.sql](sql/setup.sql) in the SQL Editor to set up the protected JSON state and private photo bucket.
3. Enable Email authentication. To use email confirmation, set Supabase Auth → URL Configuration → Site URL to the deployed Cloudflare Pages URL, and add the Pages URL to Redirect URLs.
4. In Cloudflare Pages, add environment variables:
   - `VITE_SUPABASE_URL` = Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = publishable/anon key (**never use service_role keys in the frontend**)
5. GitHub → Cloudflare Pages → Connect repo `n686r8v56c-eng/role-model-flow` and choose `main`.
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
6. Deploy. The app checks that its URL and publishable key are present. If they are missing, it displays a setup notice instead of misleadingly claiming to be online.

## Local development
```bash
npm install
cp .env.example .env.local
# Fill your own Supabase URL and public key
npm run dev
```

Cloudflare Pages automatically rebuilds the connected branch after commits once the GitHub integration is enabled. Authentication and data are shared between iPhone, iPad and browser when signed in as the same user.

## Data and privacy
- Each user's app state is stored in `role_model_states` with user-specific Supabase RLS policies.
- Inbox photos are stored in a private Supabase Storage bucket using user-specific paths.
- Synchronization includes conflict detection and an offline pending-save backup; localStorage only stores unsynced changes, not the full app's historical state.
- The app does not automatically import or delete any Focus Flow inbox or opportunity data.
