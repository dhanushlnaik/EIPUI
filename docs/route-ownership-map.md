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

## Batch 1 (Completed in this change)
- `app` owns page routes:
  - `/feedbacks`
  - `/feedback-dashboard`
- `app` owns API routes:
  - `/api/Feedback/getAllFeedback`
  - `/api/Feedback/getEnhancedFeedback`
  - `/api/test-discord-webhook`
- `pages` ownership removed:
  - `src/pages/feedbacks.tsx`
  - `src/pages/feedback-dashboard.tsx`
  - `src/pages/api/Feedback/getAllFeedback.tsx`
  - `src/pages/api/Feedback/getEnhancedFeedback.tsx`
  - `src/pages/api/test-discord-webhook.ts`

## Batch 2 (Completed in this change)
- `app` owns page routes:
  - `/contributors`
  - `/contributors/[username]`
- `app` owns API routes:
  - `/api/contributors/stats`
  - `/api/contributors/list`
  - `/api/contributors/analytics`
  - `/api/contributors/recent-activities`
  - `/api/contributors/export-detailed`
  - `/api/contributors/timeline`
  - `/api/contributors/lastSyncTime`
- `pages` ownership removed:
  - `src/pages/contributors/index.tsx`
  - `src/pages/contributors/[username].tsx`
  - `src/pages/api/contributors/stats.ts`
  - `src/pages/api/contributors/list.ts`
  - `src/pages/api/contributors/analytics.ts`
  - `src/pages/api/contributors/recent-activities.ts`
  - `src/pages/api/contributors/export-detailed.ts`
  - `src/pages/api/contributors/timeline.ts`
  - `src/pages/api/contributors/lastSyncTime.ts`

## Batch 3 (Completed in this change)
- `app` owns page routes:
  - `/Analytics`
  - `/EditorAnalytics`
- `app` owns API routes:
  - `/api/editorAnalytics`
  - `/api/DownloadCounter`
- `pages` ownership removed:
  - `src/pages/Analytics/index.tsx`
  - `src/pages/EditorAnalytics/index.tsx`
  - `src/pages/api/editorAnalytics.ts`
  - `src/pages/api/DownloadCounter/index.tsx`

## Batch 4 (Recommended next)
- `app` target API routes (Analytics charts/data):
  - `/api/AnalyticsCharts/*`
  - `/api/AnalyticsData/*`

## Guardrail
- Run `npm run check:route-collisions` before merge.
- A failing check means the same pathname exists in both routers and must be resolved before shipping.
