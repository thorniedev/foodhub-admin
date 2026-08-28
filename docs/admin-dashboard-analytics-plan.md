# FoodHub Admin Dashboard Analytics Plan

## Purpose

The admin dashboard should help an administrator answer four questions quickly:

1. Are people using FoodHub?
2. Is the food and store catalog healthy and discoverable?
3. Are recommendations performing correctly and safely?
4. Which store, item, or content record needs attention next?

The backend owns metric definitions, aggregation, period comparison, ranking, and export generation. The frontend only requests a report and renders the returned values.

## Scope of the First Backend Release

This release reads existing FoodHub tables and does not add a new analytics event table. It provides:

- Date-ranged admin dashboard overview data.
- Previous-period comparison for overview metrics.
- Daily activity trend points.
- Store performance ranking.
- Popular menu-item ranking.
- Location-level performance summary with the top item and store per location.
- Category performance summary.
- Action items for incomplete, stale, and pending records.
- Admin-only CSV and PDF exports for all report types.

The implementation does not report orders, revenue, GMV, or payments because the current backend does not expose an order/payment data model. Those metrics should be added only after an order lifecycle is persisted.

## Data Sources

| Source | Dashboard use |
| --- | --- |
| `users` | Total users and new users |
| `profiles` | Active profile count |
| `stores` | Active, pending, and review status |
| `menu_items` | Live catalog size and content quality |
| `foods` and `food_categories` | Canonical item and category labels |
| `interaction_events` | Views, clicks, likes, skips, active users, and trends |
| `bookmarks` | Store and menu-item saves |
| `recommendation_sessions` | Recommendation volume, success, and latency |
| `recommendation_items` | Recommendation exposure by menu item |
| `recommendation_safety_checks` | Blocked candidate count |

Feedback is not included in the first live SQL report because the backend currently has no persisted feedback table. Once feedback is stored server-side, add average rating, low-rating rate, category/status matrix, and unresolved feedback actions.

## Date Range Contract

All analytics endpoints accept optional ISO dates:

```text
from=2026-08-01&to=2026-08-27
```

The range is inclusive for the requested dates and is evaluated in `Asia/Phnom_Penh`. If omitted, the backend uses the previous 30 calendar dates ending on the resolved `to` date; the current date can therefore be a partial day. The comparison range has the same duration immediately before the requested range.

The backend should reject:

- `from` after `to`.
- Ranges longer than 366 days.
- Invalid or unparseable dates.

## Overview Metrics

The overview response returns both a convenient legacy-compatible total and a `kpis` map. Each KPI contains the current value, previous-period value, and percentage change.

| KPI | Definition |
| --- | --- |
| `totalUsers` | Non-deleted rows in `users` |
| `activeUsers` | Distinct users with an interaction in the selected period |
| `newUsers` | Users created in the selected period |
| `totalProfiles` | Active, non-deleted profiles |
| `activeStores` | Approved, active, non-deleted stores |
| `pendingStores` | Non-deleted stores awaiting review |
| `liveMenuItems` | Non-deleted menu items with `AVAILABLE` status |
| `totalMenuItems` | All non-deleted menu items |
| `recommendationSessions` | Recommendation sessions started in the selected period |
| `recommendationSuccessRate` | Ready or completed sessions divided by all sessions |
| `averageRecommendationLatencyMs` | Average recorded recommendation response time |
| `likes` | `LIKE` interaction events |
| `skips` | `SKIP` interaction events |
| `bookmarks` | Bookmarks created in the selected period |
| `safetyBlocks` | Safety checks with `BLOCKED` result |
| `openDataIssues` | Incomplete menu items plus pending stores |

`changePercent` is `null` when the previous value is zero and the current value is non-zero. This avoids presenting an infinite percentage as a misleading KPI.

## Trend Graph

The overview includes one daily series with:

- `newUsers`
- `activeUsers`
- `recommendationSessions`
- `itemViews`

The frontend can render users and sessions as lines and item views as bars. The backend returns zero-filled days so the graph does not have gaps when there was no activity.

## Store Performance

Endpoint:

```text
GET /api/v1/admin/dashboard/stores?from=&to=&page=0&size=20
```

Each row contains:

- Store identity and location.
- Average rating and review status.
- Menu-item count.
- Store views and unique viewers.
- Clicks, likes, and bookmarks.
- Click-through rate.
- Incomplete menu-item count.
- Transparent performance score.

The initial score is a bounded operational score, not a business truth:

```text
score =
  30% normalized unique viewers
+ 25% normalized clicks
+ 20% normalized bookmarks
+ 15% average rating / 5
+ 10% menu completeness
```

The normalizers use conservative fixed thresholds so a single large store does not dominate every result. The score components must remain visible in the response so an administrator can understand the ranking. When order conversion becomes available, replace click volume with completed-order conversion.

Interpretation examples:

| Pattern | Recommended action |
| --- | --- |
| High views, low clicks | Improve store or item images, names, and descriptions |
| High rating, low views | Improve discoverability and recommendation exposure |
| High clicks, many incomplete items | Complete menu metadata and media |
| Many bookmarks, low rating | Review food quality and store information |
| Pending review status | Review and approve or reject the store |

## Popular Menu Items

Endpoint:

```text
GET /api/v1/admin/dashboard/items?from=&to=&page=0&size=20
```

Each row contains:

- Menu-item, food, store, and category names.
- Views, unique viewers, clicks, likes, skips, bookmarks.
- Recommendation appearances.
- Click-through rate.
- Availability status.
- Missing-content count.
- Popularity score.

The first score is:

```text
score =
  45% normalized unique viewers
+ 30% normalized clicks
+ 25% normalized bookmarks
```

Popularity and quality should remain separate. A highly viewed item with many skips is popular in exposure but may need content or product review.

## Location And Category Analysis

The store and item reports accept live filters:

```text
city=Phnom Penh
province=Phnom Penh
categoryCode=NOODLES
latitude=11.5564&longitude=104.9282&radiusKm=5
```

`city` and `province` are matched against the store catalog. A coordinate filter uses the store's PostGIS `location` point and defaults to a 5 km radius when coordinates are supplied without `radiusKm`. The supported radius is greater than 0 and at most 50 km; latitude and longitude must be provided together. These validations prevent an accidental global report or an invalid spatial query.

Location summary endpoint:

```text
GET /api/v1/admin/dashboard/locations?from=&to=&city=&province=&latitude=&longitude=&radiusKm=
```

Each location row includes active stores, menu-item count, views, unique viewers, clicks, click-through rate, the most-viewed item, and the store owning that item. The location label uses city first, then province, then `Unknown` when the catalog has no area value.

Category summary endpoint:

```text
GET /api/v1/admin/dashboard/categories?from=&to=&city=&province=&categoryCode=
```

Each category row includes active stores, menu items, views, unique viewers, clicks, bookmarks, and click-through rate. This helps answer questions such as “which category is popular in Phnom Penh?” by combining the category filter with a city or radius filter.

## Action Items

The overview returns a short list of issues that can be acted on immediately:

- `INCOMPLETE_MENU_ITEM`: missing description, image, or ingredient data.
- `STALE_MENU_ITEM`: no update for at least 90 days.
- `PENDING_STORE`: store is waiting for administrator review.

Each action item includes severity, entity UUID, entity name, related store, and a recommended action. The existing admin alert system can later materialize these findings as persistent alerts, but the first release keeps them as calculated report data.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/admin/dashboard/overview` | KPI cards, trends, top stores, popular items, actions |
| `GET` | `/api/v1/admin/dashboard/stores` | Paged store performance report; accepts location filters |
| `GET` | `/api/v1/admin/dashboard/items` | Paged popular item report; accepts location and category filters |
| `GET` | `/api/v1/admin/dashboard/locations` | Grouped location performance summary; accepts location filters |
| `GET` | `/api/v1/admin/dashboard/categories` | Grouped category performance summary; accepts location filters |
| `GET` | `/api/v1/admin/analytics/export` | CSV or PDF report download; accepts the same filters |

All endpoints require the existing `ADMIN` role.

Example export requests:

```text
GET /api/v1/admin/analytics/export?report=overview&format=CSV&from=2026-08-01&to=2026-08-27
GET /api/v1/admin/analytics/export?report=stores&format=PDF&city=Phnom%20Penh&from=2026-08-01&to=2026-08-27
GET /api/v1/admin/analytics/export?report=items&format=CSV&categoryCode=NOODLES&latitude=11.5564&longitude=104.9282&radiusKm=5&from=2026-08-01&to=2026-08-27
GET /api/v1/admin/analytics/export?report=locations&format=CSV&from=2026-08-01&to=2026-08-27
GET /api/v1/admin/analytics/export?report=categories&format=PDF&province=Phnom%20Penh&from=2026-08-01&to=2026-08-27
```

## Export Content

### CSV

CSV is intended for analysis in Excel, Google Sheets, or a data workflow. It includes report metadata, selected date range, and a flat table.

Supported reports:

- `overview`: KPI rows and daily trend rows.
- `stores`: store performance rows.
- `items`: popular menu-item rows.
- `locations`: one row per store location with top item and store.
- `categories`: one row per active food category.

CSV exports use UTF-8, include a header row, record the selected filters, escape commas, quotes, and line breaks, and are limited to the first 1,000 ranked rows per report.

For `overview`, KPI and trend rows remain global because those definitions are platform-wide. Location and category filters apply to the store, item, location, and category report types.

### PDF

PDF is intended for sharing a short management report. It contains:

- Report title and date range.
- KPI summary.
- Top stores or items.
- Location or category summary rows for those report types.
- Action items when exporting the overview.
- Generated timestamp.

The first implementation uses an internal lightweight PDF renderer and ASCII-safe labels. A later reporting release can replace it with a full PDF library and localized Khmer fonts.

## Backend Implementation Notes

- Use parameterized SQL through `NamedParameterJdbcTemplate`.
- Keep location, category, and date filters in parameterized SQL so each request reflects current catalog and interaction data.
- Use the existing PostGIS store point for radius filtering; do not infer a location from a user's private profile data.
- Keep aggregation in the backend; do not make the frontend download raw events.
- Use `occurred_at` for behavior events and `started_at` or `created_at` for recommendation periods.
- Use distinct `user_id` for active-user metrics.
- Exclude soft-deleted records from current catalog totals.
- Return zero instead of null for numeric counts.
- Keep ranking formulas deterministic and documented.
- Do not expose email addresses, profile names, or sensitive recommendation context in analytics exports.
- Add daily/hourly rollup tables only after the raw-query version is measured in production.
- Add database indexes in a separate schema-synchronized migration if report latency requires it.

### Why Native SQL First

Spring Data JPA can execute native queries, database views, and stored procedures. This release uses parameterized native SQL in `AdminAnalyticsRepository` because the dashboard needs a variable date range, optional city/province/category filters, and an optional spatial radius on every request. A normal SQL view cannot receive those request parameters; a materialized view would need refresh scheduling and introduces data freshness decisions. A view or materialized view becomes worthwhile when raw event volume makes these reports slow, the query shape stabilizes, and a measured refresh interval is acceptable. Stored procedures are reserved for multi-step workflows or database-owned batch calculations, not simple read-only report queries.

## Future Extensions

1. Persist feedback and add rating/triage analytics.
2. Add order, completion, and revenue metrics when the order domain exists.
3. Add user/session-level location dimensions only when the product has an approved privacy-safe location model.
4. Add retention cohorts: day 1, day 7, and day 30.
5. Add asynchronous export jobs for reports larger than 1,000 rows.
6. Add scheduled daily rollups and anomaly detection.
7. Add materialized admin alerts from recurring action items.
