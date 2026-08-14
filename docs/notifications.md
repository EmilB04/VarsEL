# Notifications: findings and changes

An audit of how VarsEL's price alerts were implemented, what was wrong, and what
was changed. Written against the state of `main` at commit `ed758aa`.

---

## Summary

**No notification ever fired.** Not "sometimes", not "unreliably" — the delivery
path did not exist in any form. The notifications page collected alert
definitions, wrote them to `localStorage`, showed the user a confirmation
reading *"Du vil få varsel når betingelsene oppfylles"* ("You will be notified
when the conditions are met"), and nothing ever read those definitions back.

Everything else in this document is secondary to that.

| Area | Finding | Severity | Status |
|---|---|---|---|
| Delivery | No sender of any kind existed; alerts were write-only | Critical | Fixed (client-side delivery) |
| Scheduling | No scheduler existed; backend has no `@Scheduled` at all | Critical | Fixed (client-side engine) |
| Timezone | "Today" computed in UTC — wrong date for ~1–2 h nightly | High | Fixed |
| Timezone | DST-unsafe day arithmetic (`setDate()` on local `Date`) | Medium | Fixed |
| DST | 25-hour October day collides on the table row key | Medium | Fixed |
| Idempotency | No dedup mechanism (moot while nothing fired) | High | Fixed (ledger) |
| Config | No quiet hours, no per-day schedules | Medium | Added |
| Robustness | Unvalidated `JSON.parse` of `localStorage` into typed UI state | Medium | Fixed |
| Correctness | `condition: 'equal'` on a float price could never match | Medium | Fixed |
| Backend | No timeouts on the upstream HTTP call | Medium | Fixed |
| Backend | Response cache never evicted — unbounded growth | Medium | Fixed |
| Backend | Bad region/date returned 500 instead of 400 | Low | Fixed |
| Backend | Open-ended `startHour` defaulted to 1, dropping hour 0 | Low | Fixed |

---

## 1. What was actually there

### Backend

`grep` across `varsel/src/main/java` for `@Scheduled`, `@EnableScheduling`,
`JavaMailSender`, `spring-boot-starter-mail`, `push`, `webpush`, `firebase`,
`vapid` returns **nothing**. The backend is nine classes: a Spring Boot entry
point, three controllers (`PriceController`, `HealthController`, `CorsConfig`),
a region enum, a price DTO, and three helpers that fetch and reshape JSON from
`hvakosterstrommen.no`.

`pom.xml` declares exactly two dependencies: `spring-boot-starter-web` and
`org.json`. There is no scheduler, no mail transport, no push library, no
persistence layer, and no user identity — so the backend could not have
delivered a notification even in principle, and had nowhere to store who to
deliver it to.

### Frontend

`NotificationPage.vue` was self-contained. It maintained two arrays in
`localStorage`:

- `varsel-price-alerts` — `{ area, city, targetPrice, condition, enabled }`
- `varsel-cheapest-alerts` — `{ area, city, notificationTime, enabled }`

and offered create / toggle / delete. The only readers of those keys were the
page's own `loadPriceAlertsFromStorage()` and `loadCheapestAlertsFromStorage()`,
called on mount purely to re-render the list. Nothing compared a price against a
threshold. Nothing consulted `notificationTime`. `Notification`,
`ServiceWorker`, and `showNotification` appear nowhere in the codebase.

The toggles, the per-alert enable state, and the "You will be notified"
confirmations were therefore all decorative.

---

## 2. Reliability

### 2.1 Silent total failure

The only failure mode was the worst one: users were **silently never
notified**, 100% of the time, while the UI actively asserted the opposite. A
user who set a "notify me when power drops below 0.40 kr/kWh" alert would
conclude prices simply never dropped that low.

Double-notification was impossible, but only because notification was
impossible.

### 2.2 Unvalidated persisted state

```js
savedPriceAlerts.value = JSON.parse(stored);
```

The result was assigned straight into a `ref<PriceAlert[]>` with no shape check.
`localStorage` is user-writable and outlives app versions, so any hand-edited,
truncated, or partially-migrated value became a typed-but-wrong object.
`alert.targetPrice` could be a string, `alert.area` could be absent, and the
array could be an object. The `try/catch` only covered *parse* errors, not
*shape* errors.

### 2.3 No retry or failure surfacing

Not applicable before (nothing fetched), but it is now: the price backend runs
on a free tier that cold-starts after idle, so a fetch failing is routine rather
than exceptional. An engine that retried every 60 s regardless would hammer a
waking service.

---

## 3. Scheduling correctness (timezone / DST)

This is where the pre-existing, *user-visible* bugs were — they affected the
price pages too, not just the dead notification feature.

### 3.1 "Today" was computed in UTC

```js
const today = new Date().toISOString().slice(0, 10);
```

`toISOString()` is **always UTC**. Norway is UTC+1 (CET) in winter and UTC+2
(CEST) in summer. So every night between 00:00 and 01:00 — 02:00 in summer —
Norwegian local time, this expression returns **yesterday's** date, and the app
requested and displayed the wrong day's prices.

This appeared in `IndexPage.vue` (today's prices) and four places in
`HistoryPage.vue` (the `maxAllowedDate` ceiling and the previous / next / today
navigation buttons).

For a price-alert product this is directly load-bearing: the cheapest hour of
"today" is meaningless if "today" is off by one for the hours around midnight —
which is exactly when off-peak prices matter most.

### 3.2 DST-unsafe day arithmetic

```js
const currentDate = new Date(date.value);
currentDate.setDate(currentDate.getDate() - 1);
date.value = currentDate.toISOString().slice(0, 10);
```

`new Date('2026-03-29')` parses as UTC midnight, `setDate()` then mutates in
*browser-local* time, and `toISOString()` converts back to UTC. Across the two
Norwegian DST transitions (last Sunday of March, last Sunday of October) and for
users in negative UTC offsets, this round trip can land on the wrong calendar
day.

### 3.3 The 25-hour day

On the October transition Norway has 25 hours and the 02:00 slot occurs twice
(once at +02:00, once at +01:00). `JsonFormatter.formatPriceDateFields` renders
`time_start` as `dd.MM.yyyy HH:mm` and **discards the UTC offset**, so both
entries serialise to the identical string `"25.10.2026 02:00"`.

Both tables used `row-key="time_start"`, so those two rows collided on one key —
producing duplicate-key warnings and unstable sorting/rendering. The 23-hour
March day is benign by comparison (an hour is simply absent).

### 3.4 Naive wall-clock alert times

`notificationTime: '07:00'` carried no timezone. Any implementation would have
had to decide whether that meant 07:00 in the browser's zone, in UTC, or in
Norway. The only correct answer for Norwegian electricity prices is Norway.

---

## 4. Duplicate suppression

There was nothing to suppress, and no mechanism to do it with. Worth stating the
hazard explicitly, because a naive implementation gets this wrong: an engine
that polls every 60 s and fires whenever `price < threshold` will send the same
alert **60 times per hour**, since the condition stays true for the whole hour.

Any correct design needs a notion of "delivery slot" plus a persisted record of
which slots are spent.

---

## 5. Configurability

Available before: area, city, target price, condition (under / over / equal),
notification time, on/off.

Missing: quiet hours, per-weekday schedules, and any control over how often an
alert may repeat.

Also, `condition: 'equal'` was unimplementable as literally specified — prices
are floats with three decimals, so `price === 0.42` is essentially never true.
Offering it in the UI without defining a tolerance is a latent
never-fires-and-nobody-knows-why bug.

---

## 6. What changed

### 6.1 Norwegian wall-clock module — `src/scripts/osloTime.ts`

`Intl.DateTimeFormat` with an explicit `timeZone: 'Europe/Oslo'` supplies the
current Norwegian date, hour, minute and weekday. Day arithmetic
(`addOsloDays`) is done as pure calendar math in UTC on plain Y/M/D integers, so
a 23- or 25-hour day cannot shift the result. No date library was added —
`Intl` handles DST correctly and ships with the browser.

`IndexPage` and `HistoryPage` now use it for every date decision.

### 6.2 Validated, versioned alert store — `src/scripts/alertStore.ts`

- New schema key `varsel-alerts-v2` holding a single unified alert list.
- **One-time migration** from the two legacy keys, which are then removed so the
  migration cannot duplicate on re-run.
- `coerceAlert()` validates every field on load — unknown area, non-finite
  price, malformed `HH:mm`, out-of-range weekday, corrupt quiet-hours block — and
  drops entries that cannot be repaired. Nothing untyped reaches the UI.
- Alerts gained a stable `id` (`crypto.randomUUID`). The old code identified
  alerts by **array index**, which is not a stable identity: deleting alert #0
  silently re-pointed every subsequent toggle.

### 6.3 Delivery engine — `src/composables/useAlertEngine.ts`

Evaluates every enabled alert on a 60-second tick while the tab is visible, plus
immediately on `visibilitychange` (background tabs have their timers throttled
hard, so returning to the tab needs an explicit catch-up).

**Idempotency.** Each alert gets a deterministic delivery key derived only from
its id and the Norwegian calendar slot:

- price alerts → `{id}:{osloDate}:{osloHour}` — at most one per hour
- cheapest-hour alerts → `{id}:{osloDate}` — at most one per day

Keys are recorded in a persisted ledger (`varsel-alert-deliveries-v1`, 7-day
retention, pruned on load). Re-evaluating the same slot — next tick, after a
reload, or **in a second tab** — resolves to the same key and cannot deliver
twice. The key is also passed as the `Notification` `tag`, so the OS collapses
duplicates as a second line of defence.

**At-most-once, deliberately.** The ledger entry is written *before* the
notification is raised. A crash between the two loses one notification rather
than replaying it indefinitely. For price alerts that is the right trade: a
missed alert is a minor annoyance, an alert loop is a reason to uninstall.

**Catch-up window.** A cheapest-hour alert scheduled for 07:00 will still fire
if the tab is opened by 09:00, but not later — past the window the slot is
recorded as `missed`, so it neither fires 15 hours late nor gets re-checked all
day.

**Retries.** Failed passes back off exponentially (60 s → capped at 15 min) and
set a degraded flag the UI can surface, instead of retrying at full rate against
a cold-starting backend.

**Efficiency.** Prices are fetched once per distinct region per pass, so ten
alerts on NO1 cost one request, not ten.

**Quiet hours and per-day schedules.** Both are honoured, including quiet
windows that wrap past midnight (23:00–07:00). A suppressed delivery still
consumes its slot — that is what "quiet" means, as opposed to "deferred".

**`equal` is now defined** as "within ±0.005 kr/kWh", i.e. rounds to the same
øre.

### 6.4 Backend hardening

Not notification-specific, but on the path every alert evaluation takes:

- **Timeouts** (5 s connect / 10 s read) on the `hvakosterstrommen.no` request.
  There were none, so a hung upstream could pin a Tomcat thread indefinitely —
  and with the engine polling, that pressure is now continuous rather than
  user-driven.
- **Cache eviction.** `rawResponseCache` only *skipped* expired entries on read
  and never removed them, growing by one entry per (region, date) pair for the
  process lifetime. Now expired entries are dropped and the map is bounded at
  256.
- **Input validation.** An unknown region or malformed date raised
  `IllegalArgumentException` / `DateTimeParseException` out of the controller and
  surfaced as a 500. Now 400 with a clean message and no parser internals.
- **`contains("error")`** — a substring scan over the entire response body that
  would reject an otherwise valid payload — replaced with a JSON-array shape
  check.
- **`startHour` default** for an open-ended range changed from 1 to 0. Hour 0
  (00:00–01:00) is real and frequently the cheapest; it was being dropped.

---

## 7. Known limitation: delivery only runs while a tab is open

This is the important caveat and it is **not** fixed.

Delivery is client-side via the browser `Notification` API. If no VarsEL tab is
open, nothing evaluates and nothing fires. A 07:00 "cheapest hour" alert reaches
a user who does not have the app open at 07:00 only if they open it by 09:00.

That is a real constraint, and it was chosen deliberately over the alternative.
Genuine background delivery requires, at minimum:

1. A backend scheduler (`@EnableScheduling` + `@Scheduled`).
2. Persistence for alert definitions and push subscriptions — the backend
   currently has no database and no user identity.
3. **Web Push credentials**: a VAPID key pair, a push library (e.g.
   `nl-martijndwars:web-push-jdk`), and a service worker on the frontend.
4. Or an email transport: `spring-boot-starter-mail` plus SMTP credentials.

Every one of those is a new external dependency and/or a new secret, which the
brief asked to flag rather than introduce unilaterally. The client-side engine
delivers real value with zero new dependencies and zero credentials, and its
scheduling / idempotency / timezone logic is the part that would carry over
mostly unchanged to a server-side implementation.

**If you want true background delivery, that is the decision to make**, and it
implies standing up a database and a credential store alongside it.

A middle option worth considering: a service worker with Periodic Background
Sync would extend delivery somewhat beyond "tab open", but it is Chromium-only,
requires the app to be installed as a PWA, and the browser decides when (and
whether) to run it — so it is a partial improvement, not a solution.

---

## 8. Operational notes

- **Nothing to configure.** No new env vars, no migrations, no credentials.
- **Alert data migrates automatically** on first load of the notifications page.
  The legacy `varsel-price-alerts` / `varsel-cheapest-alerts` keys are consumed
  and removed. Existing alerts keep their settings and gain stable ids, empty
  day schedules (= every day) and quiet hours off.
- **Notification permission** is requested from an explicit button on the
  notifications page, never automatically on load. Browsers penalise
  permission prompts that fire without a user gesture, and several block them
  outright.
- **Without permission granted**, the engine still evaluates and still ledgers;
  deliveries land in the in-app "recent alerts" list rather than the OS. Granting
  permission later does not replay past slots.
