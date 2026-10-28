# HOTBEE Commerce Platform — Admin & Operations Guide

_Last updated: 28 August 2026_

---

## 1. QUICK SUMMARY

- **Storefront**: https://hotbee.netlify.app
- **Admin portal**: https://hotbee.netlify.app/admin/login
- **Support phone**: +91 77951 83353 · **WhatsApp**: https://wa.me/917795183353
- **Support email**: hotbee@gmail.com
- **Tech stack**: Next.js 14 (server runtime) + Supabase (Postgres & Storage) + Razorpay + Qikink POD + Netlify
- **Theme**: Amber Gold (`#FF9D00`) on Obsidian Onyx (`#0A0C10`)
- **Project directory**: `D:\Hotbee-Ganu`

---

## 2. ONE-TIME SETUP (do this first)

### Step A — Create the database tables

1. Open your Supabase dashboard → **SQL Editor** → **New query**.
2. Open `supabase/setup.sql` from the project, copy everything, paste it in, press **Run**.

This creates every table, index, security policy, the `hotbee-designs` storage bucket, and three starter coupons. It is safe to run again.

> Until this is done, the admin panel shows a setup warning and the storefront falls back to the built-in demo products.

### Step B — Set the environment variables

In **Netlify → Site settings → Environment variables** (and in `.env.local` for your own computer):

| Variable | What it does |
|---|---|
| `ADMIN_PIN` | Your admin login PIN. **Change this from `1234`.** |
| `ADMIN_SESSION_SECRET` | A long random string that signs your login cookie. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key. Never share it. |
| `QIKINK_API_KEY` | Your Qikink ClientId. |
| `QIKINK_API_SECRET` | Your Qikink client secret. |
| `QIKINK_BASE_URL` | `https://api.qikink.com/api` for real orders, `https://sandbox.qikink.com/api` for testing. |
| `RAZORPAY_KEY_ID` | `rzp_live_…` for real money, `rzp_test_…` for testing. |
| `RAZORPAY_SECRET` | Used to verify every payment. Never share it. |
| `RESEND_API_KEY` | Optional — turns on order confirmation emails. |

Check everything is connected at **Admin → API Settings**. It tests each service live.

---

## 3. LOGGING IN

1. Go to **/admin/login**.
2. Enter your `ADMIN_PIN`.
3. Press **Enter Admin Command Center**.

The PIN is checked on the server and your session is a signed, http-only cookie that expires after 12 hours.

---

## 4. ADDING YOUR DESIGNS (the main daily job)

You no longer paste image links anywhere. The flow is:

### Step 1 — Make the design in Qikink

1. Log in to **board.qikink.com**.
2. Create your design on a t-shirt, hoodie or mug.
3. Download the **mockup image**, and note the **product SKU** (e.g. `MRnHs-Bk`).

### Step 2 — Drop the design into HOTBEE

1. Go to **Admin → Designs**.
2. **Drag and drop** your mockup images onto the upload box — as many at once as you like.
3. They upload themselves and appear in your library instantly.

### Step 3 — Publish it to the store

1. Click **Publish** on any design.
2. Fill in only:
   - **Product title** (a suggestion is pre-filled from the file name)
   - **Category** — this auto-fills the fabric, print type, sizes and colourways
   - **Selling price** and **MRP** (both pre-filled with sensible defaults)
   - **Qikink SKU** — paste the SKU from step 1
3. Press **Publish to store**. It is live immediately.

> **Why the SKU matters:** it tells the Qikink factory which garment to print on. Without it, an order is saved and the customer is charged, but the print job cannot be sent — Admin → Products flags any product missing a SKU in red. The customer's chosen size is appended automatically (`MRnHs-Bk` → `MRnHs-Bk-L`).

---

## 5. WHAT HAPPENS WHEN SOMEONE ORDERS

```
Customer places order (online payment or COD)
        ↓
Payment signature verified on our server (online orders only)
        ↓
Order saved to Supabase
        ↓
Print job pushed to Qikink automatically
        ↓
Customer tracks it at /track-order using the order ID (e.g. HB-89421)
        ↓
Qikink prints, packs and ships; courier collects COD cash
        ↓
Money reaches your bank
```

**Press "Sync from Qikink"** on Admin → Orders (or the dashboard) to pull the latest printing / shipping / delivery status and tracking numbers for every order at once.

---

## 6. HOW YOU GET PAID

### Online payments (Razorpay — UPI, GPay, PhonePe, cards, netbanking)
- Razorpay collects the money and settles it to your bank account in **T+2 working days**.
- Track it in **Razorpay Dashboard → Settlements**.

### Cash on Delivery (via Qikink couriers)
- The courier collects cash from the customer at the door.
- Qikink credits it to your bank on their remittance cycle — typically **every Tuesday and Friday**, 3–5 days after delivery.
- Track it in **Qikink Dashboard → Remittance / Wallet**.

### Example margin on one t-shirt
| | |
|---|---|
| Selling price on the website | ₹1,199 |
| Qikink cost (blank tee + printing + shipping) | ~₹380 |
| **Your profit** | **~₹819** |

---

## 7. THE OTHER ADMIN PAGES

- **Overview** (`/admin/dashboard`) — revenue, order count, active print jobs, product count, integration health, and the Qikink sync button.
- **Designs** (`/admin/designs`) — your artwork library. Upload, publish, delete.
- **Products** (`/admin/products`) — everything live on the store. Edit prices, change the SKU, hide an item, or delete it. Products missing a Qikink SKU are flagged.
- **Orders & Qikink** (`/admin/orders`) — every order with the customer's phone and address, filterable by status, with an invoice button and Qikink sync.
- **Coupons & Promos** (`/admin/coupons`) — create discount codes.
- **API Settings** (`/admin/settings`) — live connection tests and the full environment variable reference.

Every page works on your phone.

---

## 8. YOUR DAILY ROUTINE

1. Keep at least **₹2,000** in your Qikink wallet so print jobs dispatch automatically.
2. Check **Admin → Orders** for new orders.
3. Press **Sync from Qikink** to refresh tracking and delivery statuses.
4. Upload new designs whenever you make them.

---

## 9. BEFORE YOU GO LIVE — CHECKLIST

- [ ] Ran `supabase/setup.sql` in Supabase.
- [ ] Changed `ADMIN_PIN` from the default and set a random `ADMIN_SESSION_SECRET`.
- [ ] Swapped Qikink **sandbox** keys for **production** keys and set `QIKINK_BASE_URL` to `https://api.qikink.com/api`.
- [ ] Swapped Razorpay `rzp_test_` keys for `rzp_live_` keys.
- [ ] Confirmed **Admin → API Settings** shows all four services connected.
- [ ] Placed one real test order end to end and confirmed it appeared in your Qikink dashboard.
- [ ] Every product has a Qikink SKU (check Admin → Products for red warnings).

> **Note:** the keys currently in `.env.local` are Qikink **sandbox** and Razorpay **test** keys. Orders placed with them are not really printed and no real money moves.

---

_The accompanying `HOTBEE_Brother_Admin_Guide.pdf` was generated from an earlier version of this document and is now out of date — use this Markdown file._
