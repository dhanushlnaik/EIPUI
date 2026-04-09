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

## Batch 4 (Completed in this change)
- `app` owns API routes (Analytics charts/data):
  - `/api/AnalyticsCharts/prs/[name]`
  - `/api/AnalyticsCharts/issues/[name]`
  - `/api/AnalyticsCharts/labels/[name]`
  - `/api/AnalyticsCharts/labels/[name]/details`
  - `/api/AnalyticsCharts/graph2/[name]`
  - `/api/AnalyticsCharts/graph3/[name]`
  - `/api/AnalyticsCharts/category-subcategory/[name]`
  - `/api/AnalyticsCharts/category-subcategory/[name]/details`
  - `/api/AnalyticsData/prs/[name]`
  - `/api/AnalyticsData/prs/[name]/[number]`
  - `/api/AnalyticsData/issues/[name]`
  - `/api/AnalyticsData/issues/[name]/[number]`
- `pages` ownership removed:
  - `src/pages/api/AnalyticsCharts/prs/[name].tsx`
  - `src/pages/api/AnalyticsCharts/issues/[name].tsx`
  - `src/pages/api/AnalyticsCharts/labels/[name].tsx`
  - `src/pages/api/AnalyticsCharts/labels/[name]/details.tsx`
  - `src/pages/api/AnalyticsCharts/graph2/[name].ts`
  - `src/pages/api/AnalyticsCharts/graph3/[name].ts`
  - `src/pages/api/AnalyticsCharts/category-subcategory/[name].ts`
  - `src/pages/api/AnalyticsCharts/category-subcategory/[name]/details.ts`
  - `src/pages/api/AnalyticsData/prs/[name]/index.tsx`
  - `src/pages/api/AnalyticsData/prs/[name]/[number].tsx`
  - `src/pages/api/AnalyticsData/issues/[name]/index.tsx`
  - `src/pages/api/AnalyticsData/issues/[name]/[number].tsx`

## Guardrail
- Run `npm run check:route-collisions` before merge.
- A failing check means the same pathname exists in both routers and must be resolved before shipping.
