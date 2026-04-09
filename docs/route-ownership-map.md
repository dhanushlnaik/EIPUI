# Route Ownership Map (Pages -> App)

This map is the migration guardrail for incremental routing work. A route can only be owned by one router at a time.

## Batch 0 (Completed in this change)
- `app` owns page route: `/test`
- `app` owns API routes:
  - `/api/test`
  - `/api/auth/[...nextauth]`
- `pages` ownership removed:
  - `src/pages/test/index.tsx`
  - `src/pages/api/test/index.tsx`
  - `src/pages/api/auth/[...nextauth].ts`

## Batch 1 (Recommended next)
- `app` target page routes: `/feedbacks`, `/feedback-dashboard`
- `app` target API routes:
  - `/api/Feedback/getAllFeedback`
  - `/api/Feedback/getEnhancedFeedback`
  - `/api/test-discord-webhook`

## Batch 2 (Recommended next)
- `app` target page routes: `/contributors`, `/contributors/[username]`
- `app` target API routes:
  - `/api/contributors/stats`
  - `/api/contributors/list`
  - `/api/contributors/analytics`
  - `/api/contributors/recent-activities`
  - `/api/contributors/export-detailed`

## Guardrail
- Run `npm run check:route-collisions` before merge.
- A failing check means the same pathname exists in both routers and must be resolved before shipping.
