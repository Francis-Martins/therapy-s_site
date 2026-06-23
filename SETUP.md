# Setup Guide

## 1. Create your Supabase project
1. Go to https://supabase.com and sign up (free tier is enough).
2. Create a new project. Pick any name/region, set a database password (save it somewhere).
3. Once it's ready, go to **Project Settings → API**. You'll need:
   - **Project URL**
   - **anon public key**
4. Open `config.js` in this folder and paste them in:
   ```js
   const SUPABASE_URL = "https://your-project.supabase.co";
   const SUPABASE_ANON_KEY = "your-anon-key";
   ```

## 2. Create the database tables
In Supabase, go to **SQL Editor** → New query → paste and run this:

```sql
create table profile (
  id int primary key,
  name text,
  handle text,
  bio text,
  avatar_url text
);

insert into profile (id, name, handle, bio) values (1, 'Your Name', '@yourhandle', 'Short bio here.');

create table links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true
);
```

## 3. Set permissions (Row Level Security)
Run this in the SQL Editor too — it lets anyone READ your links (needed for the public page) but only a logged-in user can WRITE:

```sql
alter table profile enable row level security;
alter table links enable row level security;

create policy "public can read profile" on profile for select using (true);
create policy "public can read links" on links for select using (true);

create policy "auth can write profile" on profile for all using (auth.role() = 'authenticated');
create policy "auth can write links" on links for all using (auth.role() = 'authenticated');
```

## 4. Create your admin login
1. In Supabase, go to **Authentication → Users → Add user**.
2. Enter your email and a password. This is what you'll use to log into `/admin`.
3. Make sure **Email confirmations** are off for this single-user setup (Authentication → Providers → Email → toggle off "Confirm email"), or confirm the account manually.

## 5. Test locally
Just open `index.html` in your browser. The page should load placeholder content; once `config.js` has real keys, it'll connect to Supabase.

Visit `admin.html`, log in with the user you created, and try adding a link.

## 6. Deploy to Vercel
1. Push this folder to a GitHub repo.
2. Go to https://vercel.com, sign up, click **Add New → Project**, import the repo.
3. No build step needed — it's a static site. Deploy.
4. Once deployed, go to your Vercel project → **Settings → Domains** → add your own domain and follow the DNS instructions (Vercel will tell you what records to add at your domain registrar).

## 7. Day-to-day use
- To add/edit/remove links: go to `yourdomain.com/admin`, log in, manage from there.
- To change your name/bio/photo: same admin page, top section.
- No redeploys needed — changes save straight to Supabase and show up immediately on the public page.
