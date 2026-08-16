# RUF Asset Manager — Handover Documentation

*Last updated: July 2026 (post-overhaul)*

## 0. July 2026 overhaul — what changed

A large usability/consistency pass was applied to `ruf-asset-manager-gemini.html` (pre-overhaul copy kept as `ruf-asset-manager-gemini.backup.html`). Where this document contradicts the list below, the list wins:

- **Category is now a fixed dropdown**, not free text. New categories are added/removed in **Settings → Categories** (stored in Firestore `_config/settings.categories`). Typing-related bugs and typo categories are gone.
- **Merch is now an explicit flag** (`isMerch` on the item, "Sell in Merch Store" checkbox), no longer inferred from the category being spelled "Merch". Existing merch items are migrated automatically at boot. Renaming categories can no longer hide items from the store or wipe prices.
- **Change Admin PIN actually works now.** The PIN hash is stored in Firestore `_config/settings.pinHash` (applies to all devices); the hard-coded hash is only the factory default. Old flow just showed a fake "PIN updated!" toast. **Change the PIN on first use — the default is publicly known.**
- **Admin "Mark as Returned"** on a borrowed item's page closes the loan properly (ends the log, clears borrow fields). The Status dropdown is disabled while an item is borrowed — editing it used to leave items half-borrowed forever.
- **WhatsApp nudges**: borrows now store `borrowerContact` on the item; overdue items on the dashboard (and borrowed-item pages) get a one-tap wa.me link with a pre-written reminder.
- **Dashboard rework**: stats are tappable (open filtered lists); the duplicate all-items grid was replaced with Overdue and Low Stock (≤ `LOW_STOCK`, default 5) sections.
- **My Borrowed Items** (new welcome card): borrowers look up what they owe by name or phone; tapping an item leads to the return flow.
- **Orders page**: revenue summary (this month / all time), search box, CSV export (header button), a confirmation step before booth "✓ Payment Received", and an **Undo** on fulfilled orders (`unfulfilOrderTx` — restores stock in a transaction, reopens the order, logs the reversal).
- **Data exports**: Settings → Data Export has inventory + orders CSV downloads.
- **Remembered details**: name/contact/email auto-fill on this device after the first borrow/take/checkout (`localStorage`, `LS_PROFILE`). Disabled in booth kiosk mode.
- **Offline cache** enabled (`enablePersistence`); **load failures now show an error + retry** instead of an empty inventory.
- **Search** also matches category and effective location (finds items inside boxes by where the box sits).
- **Visual pass**: primary actions are solid navy (`.btn-primary`), touch press states added, form pages centred at 600px (`page-narrow`), Settings rebuilt into grouped cards, filter pills collapsed behind a Filters toggle with an item count, QR sticker sheet link restored in Settings, PIN auto-submits on the 4th digit.
- Known intentionally-skipped items: booth-order auto-expiry, gallery pinch-zoom, page transitions. AI identification key and payment QR remain as documented below.

**Second pass (same month):**

- **Consumables can now live in boxes.** The old "only non-consumable items can go in a box" rule is gone: the "Inside a box" location option, Manage Contents picker, and box-aware displays now cover consumables too. Taking from a consumable whose box is currently borrowed out is blocked with a "Box Currently In Use" notice.
- **Item forms restructured**: behaviour checkboxes (This is a box / Consumable / Sell in Merch Store / Available for borrowing) now sit together *above* "Where is it kept?", and Notes moved to the bottom. Category and behaviour sync both ways: ticking "This is a box" sets category to Box (untick reverts it), ticking "Sell in Merch Store" sets category to Merch, and picking the Box or Merch *category* switches the matching behaviour on.
- **QR generation is now self-contained.** The qrcodejs CDN dependency was removed and the `qrcode-generator` library (MIT) is embedded in the file — QR stickers and the payment QR render as crisp SVGs even on networks that block CDNs. See `qrInto()`.
- **Merch is excluded from "Take an Item".** Merch is bought through the store; scanning a merch item's QR as a borrower shows a "Buy in Merch Store" button instead of Take.

**Third pass — receipt emails & booth claim flow:**

- **Automatic receipt emails.** When staff confirm a payment (booth "✓ Payment Received" or online "Fulfil Order"), the customer gets an emailed receipt via **EmailJS** (`sendReceiptEmail`/`emailReceiptFor`; keys in Firestore `_config/settings.emailjs`, configured under Settings → Receipt Emails, full walkthrough in `EmailJS-Setup-Guide.md`). Fulfilled order cards show when/where the receipt went and carry an **📧 Email/Resend Receipt** button. If email isn't configured or the order has no customer email, sending is skipped silently — nothing else breaks.
- **Booth "We've Paid" step.** The kiosk payment screen now has a *✓ We've Paid* button (`paidClaimedAt` on the order). The customer's screen flips to "show staff your payment confirmation"; the staff order card shows *"Customer says they've paid — check your TnG/bank app, then confirm."* Payment verification remains deliberately manual — there is no consumer API for TnG/Malaysian banks; if automatic verification is ever wanted, that means moving to a payment gateway (e.g. ToyyibPay/Billplz) with per-transaction fees.
- Email quota: EmailJS free tier is 200/month. Exceeding it → upgrade EmailJS or migrate to the Firebase "Trigger Email" extension (app design unchanged — swap `sendReceiptEmail` to write a `mail` doc).

## 1. What this is

A single-file web app (`ruf-asset-manager.html`) for managing the fellowship's inventory: borrowable equipment, consumable supplies, sellable merch, and boxes (containers of items). It also runs a small merch shop with online ordering and a physical booth POS mode.

There is no build step and no server code. The entire app — HTML, CSS, and JavaScript — lives in one file. Host it anywhere static (Firebase Hosting, Netlify, even a file link) and it works.

**Stack**

| Layer | Technology |
|---|---|
| UI | Vanilla JS, DOM built per-page by `render()` |
| Database | Firebase Firestore (compat SDK v10.12) |
| File storage | Firebase Storage (item photos, receipts, fulfilment photos) |
| QR codes | qrcodejs (CDN) |
| AI identification | Google Gemini API (`gemini-2.5-flash`), called directly from the browser (see §8) |

Firebase credentials are **baked into the file** (`BAKED_FB` constant) so users need no setup. An admin can override them via Settings → Reconfigure Firebase (stored in `localStorage`). Note: unlike the Gemini key below, Firebase web config values are not secrets — Google designed them to be public in client code. What actually protects the data is Firestore/Storage security rules.

---

## 2. Item types — three separate concepts

The model deliberately separates three orthogonal ideas. Keeping these apart is the key to understanding the app:

1. **Category — what the item is.** Purely descriptive free text with suggestions: `Merch`, `Decor`, `Box`, `Categorise Later`. Category carries *no behaviour*, with one exception: typing **Merch** auto-sets consumable (see below). A box is typically categorised "Box", but the items *inside* it keep their own categories (a table runner inside a box is still `Decor`).

2. **Behaviour — how the item acts.** Two explicit flags:

| Type | How it's identified | Behaviour |
|---|---|---|
| **Borrowable item** | `isConsumable: false`, `isBox: false` | Borrowed/returned with a due date. Status Available / Borrowed / Missing. |
| **Consumable** | `isConsumable: true` | Has `inventoryCount`. People "take" quantities; each take/restock logged. Merch is a consumable with a `unitPrice` (RM), sold via the store/booth. |
| **Box** | `isBox: true` (the "This is a box" toggle in the logger) | A borrowable container. Borrowing it takes everything inside; items inside can also be borrowed individually but must be returned into the box. Never consumable, never nested inside another box. |

3. **Location — where the item is.** Either a named place (Store Room, Hall...) **or a box**. For non-consumable items the logger asks *"Where is it kept?"* with two choices: **At a location** (free-text with suggestions) or **Inside a box** (pick from existing boxes). Being in a box *is* the location — `storageLocation` is emptied and the item's displayed location derives from wherever the box currently sits.

Form rules: typing **Merch** as category auto-sets `isConsumable: true`; turning on the box toggle forces non-consumable and suggests the "Box" category; only non-consumable, non-box items can be placed inside a box (merch stock stays sellable; boxes can't nest).

> **Legacy migration:** older records that used the category "Box / Storage" to mean box are migrated automatically at boot — they get `isBox: true` and category `Box`. Boxes still categorised "Booth Kit" are also renamed to `Box`. See `loadAndStart()`.

---

## 3. Data model (Firestore)

### `items` collection (doc ID = item ID, e.g. `RUF-012`)

| Field | Type | Notes |
|---|---|---|
| `id` | string | `RUF-###`, from the `_counters` doc |
| `name`, `category`, `notes` | string | Category is free text with suggestions (Merch, Decor, Box, Categorise Later) |
| `storageLocation` | string | Where it lives when not borrowed. Empty for items kept in a box — the box is the location |
| `status` | string | `Available` / `Borrowed` / `Missing` (non-consumables) |
| `photoUrl` | string\|null | The chosen **cover/thumbnail** photo's URL — this is what every list card, the shop grid, cart, receipts, and box thumbnails display. Always one of the entries in `photos` (or the sole legacy photo). |
| `photos` | `{url, path}[]` | All photos attached to the item, in the order added. `path` is the Storage path (used to delete that specific photo); legacy items with only an old single `photoUrl` and no `photos` array are treated as a 1-photo array on read via `itemPhotos()` — no migration write needed. Capped at `MAX_PHOTOS` (5). |
| `availableForBorrow` | bool | Hidden from borrower list when false |
| `isConsumable` | bool | Switches the item between borrow-flow and take-flow |
| `inventoryCount` | number | Consumables only |
| `unitPrice` | number | Merch only, RM |
| `isBox` | bool | True = this item is a box (set via toggle in the logger) |
| `boxId` | string\|null | ID of the box this item is kept in (its location). Missing/null = at a named location |
| `borrowedBy`, `borrowDate`, `expectedReturn`, `activeLogId` | | Set while borrowed |
| `dateAdded` | Timestamp | |

### `borrowLogs`
One doc per borrow (`LOG-###`): item, borrower name/contact/reason, borrow date, expected return, actual return, return location, return photo URL.

### `consumableLogs`
One doc per stock movement (`CLOG-###`): `type: 'take' | 'restock'`, quantity, who, reason, `remainingAfter`. **Merch sales also write entries here** with the order ID in `takenBy` (e.g. `Jane Tan · ORD-004`), so an item's change log shows its full stock history.

### `orders` (merch)
One doc per order (`ORD-###`):

| Field | Notes |
|---|---|
| `type` | `online` or `booth` |
| `status` | `pending` (online, payment claimed) / `awaiting-payment` (booth) / `fulfilled` / `cancelled` |
| `customer` | `{ name, phone, email }` — all three required at checkout |
| `items` | `[{ itemId, name, qty, unitPrice }]` snapshot at order time |
| `total` | RM number |
| `receiptUrl` | Online orders: customer-uploaded payment screenshot (`receipts/{orderId}.jpg`) |
| `fulfilPhotoUrl` | Online fulfilment photo (`fulfilments/{orderId}.jpg`) |
| `createdAt`, `fulfilledAt`, `cancelledAt`, `cancelReason`, `fulfilChannel` | |

### `_counters`
One doc per ID sequence (`items`, `logs`, `consumables`, `orders`), incremented in a Firestore transaction so IDs never collide.

> **Firestore rules note:** customer devices (no login) must be able to read `items`/`orders` and create/update `orders`, plus write to `receipts/` in Storage. Review your security rules accordingly — the app has no Firebase Auth.

---

## 4. Stock reservation — the key invariant

For merch, **stock deducts only at fulfilment, never at order time.** Until then, active orders *reserve* stock:

```
available = inventoryCount − Σ qty in orders with status pending/awaiting-payment
```

- The store and booth show `available`, not the raw count, so two customers can't order the same last item.
- Cancelling an order releases its reservation automatically (no writes needed — reservation is computed live from the orders feed).
- Fulfilment runs in a **Firestore transaction** that re-checks the order status, so two admins tapping "fulfil" at once cannot double-deduct.
- A live `onSnapshot` listener on `orders` keeps every open device in sync (this is what makes the two-iPad booth work).

---

## 5. User-facing flows

### Welcome screen
Five cards: **Merch Store · Borrow / Return Item · Take an Item · Log an Item · Inventory Management.** The last two are PIN-gated.

### Borrow / return (non-consumables)
Browse list → item detail → *Borrow This Item* → collect-first popup → name/contact/reason/return-date form → item becomes Borrowed. Return requires a photo of the item and a drop-off location; the item's `storageLocation` updates to wherever it was left. QR stickers (Settings → QR sheet) deep-link to an item via `?item=RUF-012`.

### Take (consumables)
Item detail → *Take This Item* → name/contact/quantity/reason → deducts `inventoryCount` immediately and logs a `CLOG` entry. Restocking is done by admins from the Edit page.

### Merch Store (online) — *pay first, reserve, fulfil later*
1. Customer opens the store (welcome card, or direct link `?mode=shop`).
2. Adds merch to cart (qty capped at available stock) → checkout: name + phone + email (all required; email will later be used for e-receipts — not yet implemented).
3. Payment page: order summary, **payment QR (currently a dummy placeholder — swap in the real DuitNow QR)**, receipt-screenshot upload (required), then *I've Paid — Submit Order*.
4. Order lands as `pending` with the receipt attached; stock is reserved.
5. Admin verifies the receipt in **Merch Orders**, taps *Fulfil Order*, **must take a photo** of the packed items, confirms → stock deducts, order closes.

### Booth mode (physical booth, two iPads)
- **Customer iPad**: admin launches kiosk from Settings → *Launch Booth Mode* (or `?mode=booth`). Same store UI; checkout immediately creates an `awaiting-payment` order and shows the payment QR with a live "waiting for staff" status. Home navigation is hidden in kiosk mode; reload the page to exit.
- **Staff iPad**: open **Inventory Management → Merch Orders**. New booth orders appear instantly. After watching the customer pay, staff taps **✓ Payment Received** — one tap, no photo — stock deducts and the customer's screen flips to "Payment confirmed" on its own, then offers *New Order* for the next customer.
- Customers can cancel their own booth order from the QR screen (releases the reservation); admins can cancel any active order from the dashboard.

### Photos — multiple per item, with a chosen cover
- **Log an Item / Edit item** both show a photo strip: each photo is a tile with a **★ Cover** badge on whichever one is currently the thumbnail (tap any tile to make it the cover) and a **×** to remove it. A **+** tile lets you add more (up to `MAX_PHOTOS`, currently 5). The first photo taken in the logger still auto-runs AI identification as before; extra photos are just added on the confirm screen, no re-identification needed.
- **Viewing:** anywhere a photo is shown (item detail page, Merch Store grid) — if an item has more than one photo, a small "📷 N" badge appears on it. Tapping the photo opens a full-screen gallery (arrows + dots) to flip through all of them. This is what gives customers multiple views of a merch item before buying.
- Deleting a photo (in Edit) or deleting the whole item cleans up its file(s) in Storage — nothing orphaned.

### Boxes
- Create a box by logging an item and switching on **"This is a box"**. It's a normal borrowable item — photo, QR sticker, its own location — that other items can be kept in. (Category auto-suggests "Box".)
- Put items in it at log time — the *"Where is it kept?"* question offers **At a location / Inside a box** — or later via the box's **Manage Contents** picker (admin; search, tick/untick; ticking an item that's in another box moves it over).
- The box **is** the item's location: adding to a box clears the item's own `storageLocation`; releasing an item (untick, or deleting the box) hands it the box's last known location so nothing ends up location-less.
- Items inside a box **can be borrowed individually** (borrowing allowed by default) — the regular borrow flow and borrow log apply. The return flow skips the location picker and instructs the borrower to put the item back inside its box (`storageLocation` stays empty; the log records `In <box-id>`). If the whole box is out, individual borrowing is blocked with a "Box Currently In Use" popup.
- Borrowing the box takes everything inside; contents show *In Borrowed Box* and "with \<borrower\>" until the box is returned (items individually borrowed out at that moment keep their own Borrowed status). Returning the box to a new location relocates every item inside it in one step.
- Guardrails: no boxes inside boxes; consumables can't be boxed; the box toggle can't be switched off while the box still has contents; deleting a box releases (not deletes) its contents.

---

## 6. Admin features

Admin actions are gated by a 4-digit PIN (SHA-256 hash hard-coded in `verifyPin`; a successful unlock lasts 1 hour via `localStorage`). Admin surfaces:

- **Inventory Management dashboard** — stats, all items, and the **Merch Orders** button (shows a live pending count).
- **Merch Orders** — live queue with filters (Needs Action / Booth / Online / Fulfilled / Cancelled), customer details, receipt & fulfilment photo thumbnails, confirm/fulfil/cancel actions.
- **Log an Item** — photo-first flow with AI identification (§8).
- **Edit item** — all fields, restock control, box placement, delete (with confirm).
- **Settings** — Google AI (Gemini) API key, change PIN, booth-mode launcher, QR sticker sheet, Firebase reconfig.

---

## 7. URL parameters

| URL | Opens |
|---|---|
| `app.html?item=RUF-012` | That item's detail page (QR stickers use this) |
| `app.html?mode=shop` | Merch store directly (share this link / print as poster QR) |
| `app.html?mode=booth` | Booth kiosk mode (customer iPad) |

---

## 8. AI identification for the logger — status, setup & pending work

**How it works today:** in the *Log an Item* flow, taking a photo immediately sends it to the **Google Gemini API** (`gemini-2.5-flash`, direct browser call to `generativelanguage.googleapis.com` with an `x-goog-api-key` header — no proxy). The model returns JSON — `{name, category, notes}` with category constrained to `Merch | Decor | Booth Kit | Categorise Later` — which pre-fills the form. If the AI answers "Booth Kit", the box toggle is switched on automatically. The user reviews/edits before saving. If the call fails, a toast says "fill in manually" and the form opens blank; **the flow never depends on AI succeeding.**

> This used to run on Anthropic's Claude API. It was switched to Google Gemini for cost reasons — Gemini's free tier (1,500 requests/day on `gemini-2.5-flash` as of mid-2026) comfortably covers a fellowship's item-logging volume with no billing set up.

**Key handling:** `runAI()` resolves the key as `localStorage.getItem(LS_KEY) || BAKED_KEY` — any admin can paste their own key in Settings to override the shared default; if none is set, everyone falls back to the baked-in default key.

### Step-by-step setup (getting AI identification working on a fresh deploy)

1. **Get a Gemini API key — the direct way.** Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)** (not the Google Cloud Console), sign in with any Google account, click **"Create API key"**, and let it create its own project (or pick an existing plain Gemini/AI Studio project). Copy the key. No credit card is required for the free tier.
   > ⚠️ **Don't create the key via Cloud Console's "Vertex Express" flow** (Credentials page → Create Credentials, bound to a `vertex-express@...` service account). That path gave us a key that returned **403 PERMISSION_DENIED** until "Gemini API" was manually enabled and selected under the key's API restrictions, and even after fixing that, kept returning **429** on literally the second request — Express Mode trial projects appear to carry a separate, much stricter quota than the standard AI Studio free tier. Creating the key straight from `aistudio.google.com/apikey` sidesteps this entirely and was what actually fixed it.
2. **Set the default (optional).** If you want AI identification to work out of the box for every device with zero setup, paste the key into the `BAKED_KEY` constant near the top of the file (currently line ~295). Skip this step if you'd rather every admin supply their own key instead (safer, more setup).
3. **Or set it per-admin (recommended for shared/public deployments).** Leave `BAKED_KEY` as an empty string `""`. Each admin then opens **Inventory Management → Settings → AI Identification** and pastes their own key into the **Google AI (Gemini) API Key** field — it saves to `localStorage` on input, no save button needed.
4. **Restrict the key (recommended if baked in).** In Google Cloud Console → *APIs & Services → Credentials*, select the key → **Application restrictions → HTTP referrers**, and restrict it to the domain(s) this app is hosted on. This stops the key from being usable elsewhere even if someone copies it out of view-source. Also worth setting a daily quota cap on the key to bound worst-case cost/abuse.
5. **Test it.** Go to **Log an Item**, take a photo of any object, and wait a couple of seconds — name/category/notes should auto-populate. If nothing happens, open the browser console: the code logs `'AI API error:'` with the HTTP status and response body, which tells you immediately whether it's an auth problem, a quota issue, or something else.
6. **Redeploy.** Since this is a single static file, "deploying" just means re-uploading `ruf-asset-manager.html` wherever it's hosted (Firebase Hosting, Netlify, a shared link, etc.) after any of the steps above.

**Pending / handover notes:**

1. **API key exposure (still applicable).** Whichever key ends up in `BAKED_KEY` is shipped to every browser that loads the file — same tradeoff that existed with the old Anthropic key, just on Google's side now. Mitigate with the HTTP referrer restriction and quota cap in step 4 above. The fully-safe alternative is still to proxy the call through a small serverless function (e.g. a Firebase Cloud Function) that holds the key server-side and never ships it to the client.
2. ~~Key handling inconsistency~~ — **Resolved.** `runAI()` now checks `localStorage` first and only falls back to `BAKED_KEY`, so per-admin overrides in Settings actually take effect.
3. **Model string.** `gemini-2.5-flash` should be reviewed periodically — Google's free-tier lineup changes (Pro-tier models left the free tier in April 2026). Check [ai.google.dev/gemini-api/docs/pricing](https://ai.google.dev/gemini-api/docs/pricing) before assuming a model is still free, and update the `model` segment of the URL in `runAI()` when it changes.
4. **Category drift.** Unchanged — the prompt's category list is hard-coded in `runAI()`. If you add categories elsewhere in the app, update the prompt text too, or the AI will never suggest them.
5. **No retry/queue.** Unchanged — one attempt per photo. A "Retry AI" button on the confirm screen would be a small, useful addition, especially at events with patchy connectivity.
6. **Quota/project gotcha (new).** If AI identification starts throwing 403 or 429 again, check *which* Google Cloud project the active key belongs to and how it was created (AI Studio direct vs. Cloud Console/Vertex Express — see the warning in step 1 above) before assuming it's a rate-limiting or billing problem.

---

## 9. Other known gaps / next steps

- **Payment QR is a dummy.** The QR shown at checkout encodes a placeholder string. Replace the `new QRCode(...)` payload in `pagePay()` with the real DuitNow QR (ideally a static image of the merchant QR).
- **Email receipts** — customer email is collected but nothing is sent yet (planned feature).
- **No Firebase Auth** — admin security is PIN-only, and Firestore rules must allow anonymous writes for ordering. Acceptable for a fellowship's scale; revisit if abuse appears.
- **Booth abandonment** — booth orders that never get paid sit as `awaiting-payment` reserving stock until staff cancels them. Consider an auto-expiry (e.g. cancel after 30 minutes) if this becomes a problem.
- **Single-file size** — the file is ~2,875 lines. If it keeps growing, consider splitting into modules with a bundler; until then, section header comments (`─── PAGES ───` etc.) are the map.

## 10. Quick reference — where things are in the code

| Concern | Function(s) |
|---|---|
| Routing | `render()` page map, `go()` / `goBack()` / `goWelcome()` |
| Data access | `loadItems`, `writeItem`, `writeLog`, `writeConsumableLog`, `nextId` |
| Orders & reservations | `subscribeOrders`, `reservedQty`, `availableStock`, `placeOrder`, `fulfilOrderTx`, `cancelOrder` |
| Boxes | `isBox` (flag check), `isBoxCat` (legacy migration only), `boxContents`, `itemBox`, `effectiveLocation`, `pageBoxManage`, `doBoxManageSave`; migration in `loadAndStart()` |
| Store / booth | `pageShop`, `pageCart`, `pagePay`, `doCheckout`, `doPlaceOnline`, `resetShop` |
| Admin orders | `pageOrders`, `pageFulfil`, `doFulfil`, `doConfirmBoothPayment` |
| AI identification | `runAI()`, `BAKED_KEY`, `LS_KEY` |
| Photos (multi + cover) | `uploadPhoto`, `removeItem`, `itemPhotos`, `photoStrip`, `galleryOverlay`, `MAX_PHOTOS` |
| PIN | `checkAdmin`, `verifyPin`, `doPin` |
