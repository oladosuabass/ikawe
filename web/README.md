# Ikawe Web

Nuxt app for browsing and consuming book summaries.

## Stack

- Nuxt 4
- TypeScript
- Mock API routes (`server/api/titles`) backed by placeholder data matching the Supabase `titles` schema

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000/explore](http://localhost:3000/explore).

## Routes

- `/` — redirects to `/explore`
- `/explore` — main browse page with genre sections, search, and filters
- `/genres/:slug` — all titles in a genre (e.g. `/genres/science-fiction`)
- `/titles/:slug/:id` — summary detail page (e.g. `/titles/atomic-habits/a1b2c3d4-...`)

## Data model

Types live in `app/types/title.ts` and mirror the `titles` table fields from `T2S/supabase_titles.sql`.

Mock titles are in `app/data/mock-titles.ts`. Swap the API handlers in `server/api/titles/` for Supabase when ready.

## Project layout

```
web/
├── app/
│   ├── assets/css/
│   ├── components/
│   ├── composables/
│   ├── data/
│   ├── pages/
│   ├── utils/
│   └── types/
└── server/api/titles/
```

The Chrome extension lives in `../chrome_extension/`.
