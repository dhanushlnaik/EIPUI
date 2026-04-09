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

## Batch 5 (Completed in this change)
- `app` owns page routes:
  - `/boards`
  - `/eip_board`
  - `/review`
- `app` owns API routes:
  - `/api/all_board`
  - `/api/new/all`
- `pages` ownership removed:
  - `src/pages/boards/index.tsx`
  - `src/pages/eip_board/index.tsx`
  - `src/pages/review/index.tsx`
  - `src/pages/api/all_board/index.tsx`
  - `src/pages/api/new/all/index.tsx`

## Batch 6 (Completed in this change)
- `app` owns page routes:
  - `/boardsnew`
  - `/interface`
  - `/status`
- `app` owns API routes:
  - `/api/FullBoards`
  - `/api/new/graphsv2`
- `pages` ownership removed:
  - `src/pages/boardsnew/index.tsx`
  - `src/pages/interface/index.tsx`
  - `src/pages/status/index.tsx`
  - `src/pages/api/FullBoards/index.tsx`
  - `src/pages/api/new/graphsv2/index.tsx`

## Batch 7 (Completed in this change)
- `app` owns page routes:
  - `/draft`
  - `/final`
  - `/last-call`
  - `/living`
  - `/withdrawn`
  - `/stagnant`
- `app` API dependency used by these routes:
  - `/api/new/all` (migrated in Batch 5)
- `pages` ownership removed:
  - `src/pages/draft/index.tsx`
  - `src/pages/final/index.tsx`
  - `src/pages/last-call/index.tsx`
  - `src/pages/living/index.tsx`
  - `src/pages/withdrawn/index.tsx`
  - `src/pages/stagnant/index.tsx`

## Batch 8 (Completed in this change)
- `app` owns page routes:
  - `/core`
  - `/erc`
  - `/meta`
  - `/networking`
  - `/informational`
- `app` API dependencies used by these routes:
  - `/api/new/all` (migrated in Batch 5)
  - `/api/new/graphsv2` (migrated in Batch 6)
- `pages` ownership removed:
  - `src/pages/core/index.tsx`
  - `src/pages/erc/index.tsx`
  - `src/pages/meta/index.tsx`
  - `src/pages/networking/index.tsx`
  - `src/pages/informational/index.tsx`

## Batch 9 (Completed in this change)
- `app` owns page routes:
  - `/all`
  - `/alltable`
  - `/eiptable`
  - `/erctable`
  - `/riptable`
- `app` API dependencies used by these routes:
  - `/api/new/all` (migrated in Batch 5)
  - `/api/DownloadCounter` (migrated in Batch 3)
- `pages` ownership removed:
  - `src/pages/all/index.tsx`
  - `src/pages/alltable/index.tsx`
  - `src/pages/eiptable/index.tsx`
  - `src/pages/erctable/index.tsx`
  - `src/pages/riptable/index.tsx`

## Batch 10 (Completed in this change)
- `app` owns page routes:
  - `/FAQs/EIP`
  - `/FAQs/ERC`
  - `/FAQs/RIP`
- `pages` ownership removed:
  - `src/pages/FAQs/EIP/index.tsx`
  - `src/pages/FAQs/ERC/index.tsx`
  - `src/pages/FAQs/RIP/index.tsx`

## Batch 11 (Completed in this change)
- `app` owns page routes:
  - `/privacy`
  - `/About`
  - `/resources`
  - `/grants`
  - `/trivia`
- `pages` ownership removed:
  - `src/pages/privacy/index.tsx`
  - `src/pages/About/index.tsx`
  - `src/pages/resources/index.tsx`
  - `src/pages/grants/index.tsx`
  - `src/pages/trivia/index.tsx`

## Batch 12 (Completed in this change)
- `app` owns page routes:
  - `/newsletter`
  - `/milestones2024`
  - `/donate`
- `pages` ownership removed:
  - `src/pages/newsletter/index.tsx`
  - `src/pages/milestones2024/index.tsx`
  - `src/pages/donate.tsx`

## Guardrail
- Run `npm run check:route-collisions` before merge.
- A failing check means the same pathname exists in both routers and must be resolved before shipping.
