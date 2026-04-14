# Page Component & Chart Map

## Rules (Naming + Placement)
- Page-specific components must live in `src/app/<page>/_components/`.
- Page-specific component names must use page prefix + PascalCase (example: `HomePageContent`, `HomeBrowseSnapshotChart`).
- Shared components remain in `src/components` and should only stay shared when used by 2+ routes.
- Every chart component must be documented with:
  - chart library
  - data source endpoint/procedure
  - owner tag (`<page>-local` or `shared`)

## Homepage (`/`, `/home`, `/dashboard`)

### Route Entrypoints
- `/` -> `src/app/page.tsx`
- `/home` -> `src/app/home/page.tsx`
- `/dashboard` -> `src/app/dashboard/page.tsx`

All three currently render `HomePageContent` from `src/app/home/_components/HomePageContent.tsx`.

### Section / Component Tree
- `HomePageContent` (`home-local`)
  - Tailwind hero shell + CTAs
  - `HomeAboutInsightPanel` (`home-local`)
  - All overview section
    - `HomeBrowseSnapshotChart` (`home-local`)
  - Tools section
    - `HomeToolsSection` (`home-local`)
  - Supported-by section
  - Status changes section
    - `HomeStatusChangesSection` (`home-local`)
  - Trending section
    - `Clients` (`shared`)
  - Dashboard overview section
    - `HomeCategoryDonutChart` (`home-local`)
    - `HomeStatusDonutChart` (`home-local`)
  - Latest updates section

Shared dependencies used by homepage:
- `FeedbackWidget`, `TwitterTimeline`, `FAQ`, `SupportedBy`, `Clients`, `BoyGirl3`, `LoaderComponent`.

### Homepage Chart Matrix
| Component | Purpose | Chart Library | Data Source | Ownership |
|---|---|---|---|---|
| `HomeBrowseSnapshotChart` | Yearly stacked overview (category/status modes) + CSV controls | `@ant-design/plots` (`Column`) | `GET /api/v4/home-chart`, `client.home.getAllProposals()` (oRPC), fallback `GET /api/new/all` | `home-local` |
| `HomeCategoryDonutChart` | Category composition donut | `@ant-design/plots` (`Pie`) | `dataset` prop from `HomePageContent` (`GET /api/new/all`) | `home-local` |
| `HomeStatusDonutChart` | Status composition donut | `@ant-design/plots` (`Pie`) | `dataset` prop from `HomePageContent` (`GET /api/new/all`) | `home-local` |
| `HomeStatusChangesSection` | Category cards + status-by-category chart grid | `@ant-design/plots` via `StatusColumnChart2` | `useAllEipsData()` -> `GET /api/new/all` | `home-local` (section) + `shared` (chart primitive) |

## Core (`/core`)

### Route Entrypoint
- `/core` -> `src/app/core/page.tsx`

`/core` renders `CorePageContent` from `src/app/core/_components/CorePageContent.tsx`.

### Section / Component Tree
- `CorePageContent` (`core-local`)
  - Category tab navigation (`StatusTabNavigation`)
  - Header + KPI cards (`AnalyticsStatCard`)
  - Status distribution card (`CategoryDistributionChart`)
  - Insights card (`StatusInsightsCard`)
  - FAQ (`FAQSection`)
  - Core proposal table (`TableStatus`)
  - Core yearly status chart (`StatusColumnChart`)

Shared dependencies used by `/core`:
- `AllLayout`, `Header`, `LoaderComponent`, `TableStatus`, `StatusColumnChart`, `StatusTabNavigation`, `AnalyticsStatCard`, `CategoryDistributionChart`, `StatusInsightsCard`, `FAQSection`.

### Core Chart Matrix
| Component | Purpose | Chart Library | Data Source | Ownership |
|---|---|---|---|---|
| `CategoryDistributionChart` | Core status distribution visualization | `recharts` | `CorePageContent` computed status summary from `client.home.getAllProposals()` or `GET /api/new/all` fallback | `shared` |
| `StatusColumnChart` | Core status-over-year stacked chart | `@ant-design/plots` (`Column`) | `/api/new/final-status-by-year` | `shared` |

## Status (`/status`)

### Route Entrypoint
- `/status` -> `src/app/status/page.tsx`

`/status` renders `StatusPageContent` from `src/app/status/_components/StatusPageContent.tsx`.

### Section / Component Tree
- `StatusPageContent` (`status-local`)
  - Header + anchor sections (`draft-vs-final`, `draft`, `review`, `lastcall`, `final`, `stagnant`, `withdrawn`, `living`)
  - Draft-vs-final summary chart (`AreaStatus2`)
  - Per-status chart + metric box rows:
    - `DraftBarChart2` (imported as `StackedColumnChart`)
    - `CBoxStatus2`
  - Aggregate status visualizations:
    - `DonutStatus`
    - `Donut`
    - `InPie` (`PieC`)

Shared dependencies used by `/status`:
- `AllLayout`, `Header`, `LoaderComponent`, `AreaStatus2`, `DraftBarChart2`, `CBoxStatus2`, `DonutStatus`, `Donut`, `InPie`.

### Status Chart Matrix
| Component | Purpose | Chart Library | Data Source | Ownership |
|---|---|---|---|---|
| `AreaStatus2` | Draft vs Final timeline summary | `@ant-design/plots` | `getStatusTimelineV2Data()` via `/api/new/statusChanges/*` shape | `shared` |
| `DraftBarChart2` | Per-status monthly/yearly trend bars | `@ant-design/plots` (`Column`) | `StatusPageContent` filtered timeline rows from `getStatusTimelineV2Data()` | `shared` |
| `CBoxStatus2` | Per-status category box stats | custom card/chart UI | `StatusPageContent` filtered timeline rows from `getStatusTimelineV2Data()` | `shared` |
| `DonutStatus` | Status composition donut | `@ant-design/plots` (`Pie`) | `allData` from `client.home.getAllProposals()` or `GET /api/new/all` fallback | `shared` |
| `Donut` | Category/type composition donut | `@ant-design/plots` (`Pie`) | `allData` from `client.home.getAllProposals()` or `GET /api/new/all` fallback | `shared` |
| `InPie` (`PieC`) | Secondary status/category summary chart | `@ant-design/plots` | `allData` and filtered status rows from `StatusPageContent` | `shared` |

## Networking (`/networking`)

### Route Entrypoint
- `/networking` -> `src/app/networking/page.tsx`

`/networking` renders `NetworkingPageContent` from `src/app/networking/_components/NetworkingPageContent.tsx`.

### Section / Component Tree
- `NetworkingPageContent` (`networking-local`)
  - Category tab navigation (`StatusTabNavigation`)
  - Header + KPI cards (`AnalyticsStatCard`)
  - Status distribution card (`CategoryDistributionChart`)
  - Insights card (`StatusInsightsCard`)
  - FAQ (`FAQSection`)
  - Networking proposal table (`TableStatus` with `cat="Networking"`)
  - Networking yearly status chart (`StatusColumnChart`)

Shared dependencies used by `/networking`:
- `AllLayout`, `Header`, `LoaderComponent`, `TableStatus`, `StatusColumnChart`, `StatusTabNavigation`, `AnalyticsStatCard`, `CategoryDistributionChart`, `StatusInsightsCard`, `FAQSection`.

### Networking Chart Matrix
| Component | Purpose | Chart Library | Data Source | Ownership |
|---|---|---|---|---|
| `CategoryDistributionChart` | Networking status distribution visualization | `recharts` | `NetworkingPageContent` computed status summary from `GET /api/new/all` | `shared` |
| `StatusColumnChart` | Networking status-over-year stacked chart | `@ant-design/plots` (`Column`) | `/api/new/final-status-by-year` | `shared` |

## Interface (`/interface`)

### Route Entrypoint
- `/interface` -> `src/app/interface/page.tsx`

`/interface` renders `InterfacePageContent` from `src/app/interface/_components/InterfacePageContent.tsx`.

### Section / Component Tree
- `InterfacePageContent` (`interface-local`)
  - Category tab navigation (`StatusTabNavigation`)
  - Header + KPI cards (`AnalyticsStatCard`)
  - Status distribution card (`CategoryDistributionChart`)
  - Insights card (`StatusInsightsCard`)
  - FAQ (`FAQSection`)
  - Interface proposal table (`TableStatus` with `cat="Interface"`)

Shared dependencies used by `/interface`:
- `AllLayout`, `Header`, `LoaderComponent`, `TableStatus`, `StatusTabNavigation`, `AnalyticsStatCard`, `CategoryDistributionChart`, `StatusInsightsCard`, `FAQSection`.

### Interface Chart Matrix
| Component | Purpose | Chart Library | Data Source | Ownership |
|---|---|---|---|---|
| `CategoryDistributionChart` | Interface status distribution visualization | `recharts` | `InterfacePageContent` computed status summary from `GET /api/new/all` | `shared` |

## Meta (`/meta`)

### Route Entrypoint
- `/meta` -> `src/app/meta/page.tsx`

`/meta` renders `MetaPageContent` from `src/app/meta/_components/MetaPageContent.tsx`.

### Section / Component Tree
- `MetaPageContent` (`meta-local`)
  - Category tab navigation (`StatusTabNavigation`)
  - Header + KPI cards (`AnalyticsStatCard`)
  - Status distribution card (`CategoryDistributionChart`)
  - Insights card (`StatusInsightsCard`)
  - FAQ (`FAQSection`)
  - Meta proposal table (`TableStatus` with `cat="Meta"`)
  - Meta yearly status chart (`StatusColumnChart`)

Shared dependencies used by `/meta`:
- `AllLayout`, `Header`, `LoaderComponent`, `TableStatus`, `StatusColumnChart`, `StatusTabNavigation`, `AnalyticsStatCard`, `CategoryDistributionChart`, `StatusInsightsCard`, `FAQSection`.

### Meta Chart Matrix
| Component | Purpose | Chart Library | Data Source | Ownership |
|---|---|---|---|---|
| `CategoryDistributionChart` | Meta status distribution visualization | `recharts` | `MetaPageContent` computed status summary from `GET /api/new/all` | `shared` |
| `StatusColumnChart` | Meta status-over-year stacked chart | `@ant-design/plots` (`Column`) | `/api/new/final-status-by-year` | `shared` |

## Informational (`/informational`)

### Route Entrypoint
- `/informational` -> `src/app/informational/page.tsx`

`/informational` renders `InformationalPageContent` from `src/app/informational/_components/InformationalPageContent.tsx`.

### Section / Component Tree
- `InformationalPageContent` (`informational-local`)
  - Category tab navigation (`StatusTabNavigation`)
  - Header + KPI cards (`AnalyticsStatCard`)
  - Status distribution card (`CategoryDistributionChart`)
  - Insights card (`StatusInsightsCard`)
  - FAQ (`FAQSection`)
  - Informational proposal table (`TableStatus` with `cat="Informational"`)
  - Informational yearly status chart (`StatusColumnChart`)

Shared dependencies used by `/informational`:
- `AllLayout`, `Header`, `LoaderComponent`, `TableStatus`, `StatusColumnChart`, `StatusTabNavigation`, `AnalyticsStatCard`, `CategoryDistributionChart`, `StatusInsightsCard`, `FAQSection`.

### Informational Chart Matrix
| Component | Purpose | Chart Library | Data Source | Ownership |
|---|---|---|---|---|
| `CategoryDistributionChart` | Informational status distribution visualization | `recharts` | `InformationalPageContent` computed status summary from `GET /api/new/all` | `shared` |
| `StatusColumnChart` | Informational status-over-year stacked chart | `@ant-design/plots` (`Column`) | `/api/new/final-status-by-year` | `shared` |

## ERC (`/erc`)

### Route Entrypoint
- `/erc` -> `src/app/erc/page.tsx`

`/erc` renders `ErcPageContent` from `src/app/erc/_components/ErcPageContent.tsx`.

### Section / Component Tree
- `ErcPageContent` (`erc-local`)
  - Header + view toggles (`category` / `status`)
  - Stats/insights block (`OtherStats`)
  - Overview charts (mode dependent):
    - `AllChart` (category)
    - `AllChart3` (status)
  - Category view sections:
    - `ERCCatBoxGrid`, `TypeGraphs4`, `ERCStatusGraph`, `CatTable2`
  - Status view sections:
    - `AreaC`, `StackedBarChart2`, `CBoxStatus3`, `CatTable`
  - Detailed table (`ErcTable`) and PR chart (`Ercsprs`)

Shared dependencies used by `/erc`:
- `AllLayout`, `Header`, `LoaderComponent`, `OtherStats`, `AllChart`, `AllChart3`, `AreaC`, `StackedBarChart2`, `CBoxStatus3`, `ERCCatBoxGrid`, `TypeGraphs4`, `ERCStatusGraph`, `CatTable`, `CatTable2`, `ErcTable`, `Ercsprs`.

### ERC Chart Matrix
| Component | Purpose | Chart Library | Data Source | Ownership |
|---|---|---|---|---|
| `AllChart` | ERC category overview chart | `@ant-design/plots` | `GET /api/new/all` filtered to ERC | `shared` |
| `AllChart3` | ERC status overview chart | `@ant-design/plots` | `GET /api/new/all` + status timeline data | `shared` |
| `AreaC` | Draft vs Final trend (ERC context) | `@ant-design/plots` | status timeline APIs (`/api/new/statusChanges/*`) | `shared` |
| `StackedBarChart2` | Status detail chart rows | `@ant-design/plots` | timeline data from `getStatusTimelineV2Data()` | `shared` |
| `ERCStatusGraph` | ERC status distribution/flow | mixed (`@ant-design/plots` + custom wrappers) | `GET /api/new/all` | `shared` |
| `Ercsprs` | ERC PR analytics chart | chart.js/recharts hybrid in shared component | PR endpoints and derived ERC rows | `shared` |

## All (`/all`)

### Route Entrypoint
- `/all` -> `src/app/all/page.tsx`

`/all` renders `AllPageContent` from `src/app/all/_components/AllPageContent.tsx`.

### Section / Component Tree
- `AllPageContent` (`all-local`)
  - Category filter controls (`All`, `EIP`, `ERC`, `RIP`)
  - CSV export action
  - `CSmartTable` listing merged proposal records with link-outs
  - mobile + desktop filter variants

Shared dependencies used by `/all`:
- `AllLayout`, `SearchBox`, `CloseableAdCard`, Chakra UI primitives, CoreUI `CSmartTable`.

### All Page Chart Matrix
| Component | Purpose | Chart Library | Data Source | Ownership |
|---|---|---|---|---|
| `CSmartTable` block | sortable/filterable proposal data grid (not a chart) | CoreUI Table | `GET /api/new/all` (merged, RIP duplicates filtered in-page) | `all-local` |

## Template: Add New Page Map

### `<page-route>`
- Route entrypoint(s):
- Main page component:
- Section/component tree:
- Charts used:

| Component | Purpose | Chart Library | Data Source | Ownership |
|---|---|---|---|---|
|  |  |  |  |  |

## Pending Next Pages
- `/eip`
- `/resources`
