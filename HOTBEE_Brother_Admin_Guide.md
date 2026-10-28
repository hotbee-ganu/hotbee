# HOTBEE — Brother's Master Admin & Operations Guide

_Last updated: 28 October 2026 — Official Production Release_

---

## 1. QUICK SUMMARY & IMPORTANT PORTALS

| Portal | Website URL | Login Details / Notes |
|---|---|---|
| **HOTBEE Storefront** | https://hotbee.netlify.app | Public customer store where customers buy T-shirts. |
| **Admin Command Center** | https://hotbee.netlify.app/admin/login | **PIN: `1234`** (Works on phone & laptop) |
| **Qikink Print Factory** | https://board.qikink.com | Your POD dashboard to make designs and check wallet. |
| **Razorpay Dashboard** | https://dashboard.razorpay.com | Tracks UPI/Card payments & bank settlements (T+2 days). |

---

## 2. HOW TO ADD NEW T-SHIRTS TO THE STORE (30 SECONDS)

You never need to touch code or enter complicated image links. Just follow these 4 steps:

### Step 1 — Get the Mockup & SKU from Qikink
1. Log in to **board.qikink.com**.
2. Create or open your T-shirt design.
3. Download the **mockup image** (PNG or JPG).
4. Copy the **Product SKU** (e.g., `MRnHs-Bk` for Men's Round Neck Black).

### Step 2 — Log in to HOTBEE Admin
1. Go to **hotbee.netlify.app/admin/login** on your phone or laptop.
2. Enter PIN: `1234` and tap **Enter Command Center**.

### Step 3 — Drag & Drop the Image
1. Click **Designs** in the sidebar menu (or go to **/admin/designs**).
2. Drag and drop your mockup image into the upload box (or tap **"Choose design files"**).
3. The design immediately appears in your library.

### Step 4 — 1-Click Publish to Live Store
1. On the design card, click the orange **"Publish"** button.
2. Fill in 4 simple fields:
   - **Title**: e.g., *HOTBEE Oversized Cyber Tee*
   - **Category**: Select *Round Neck T-Shirt*, *Oversized*, or *Hoodie* (automatically sets sizes S, M, L, XL, XXL).
   - **Qikink SKU**: Paste your SKU (e.g., `MRnHs-Bk`).
   - **Selling Price**: e.g., `₹899` (and MRP `₹1,499`).
3. Click **"Publish to Store"**. It is immediately LIVE for customers to buy!

---

## 3. WHAT HAPPENS WHEN A CUSTOMER BUYS (100% AUTOMATIC)

```text
Customer Places Order (UPI QR, GPay, Cards, or COD)
         ↓
Payment verified on server & Tax Invoice generated
         ↓
Order submitted to Qikink POD Factory automatically
         ↓
Qikink DTF prints, quality-inspects & packs in HOTBEE packaging
         ↓
Courier ships order with SMS tracking to customer
         ↓
Delivery completed → Money lands in your bank account!
```

---

## 4. HOW TO TEST A REAL ORDER RIGHT NOW

### A. Test from Customer Side:
1. Open **https://hotbee.netlify.app**.
2. Click any product and select a size (e.g., **L**).
3. Tap **Add to Cart** → **Proceed to Checkout**.
4. Enter test delivery address & mobile number.
5. Apply promo code: `WELCOME10` or `HOTBEE25`.
6. Choose **Razorpay UPI** to test live checkout.
7. Check the confirmation screen & download the Tax Invoice.

### B. Verify in Admin HQ:
1. Go to **hotbee.netlify.app/admin/orders**.
2. Your test order will appear at the top.
3. Verify customer address, phone number & total amount.
4. Click **"Sync from Qikink"** to verify factory status sync.
5. Go to **hotbee.netlify.app/track-order** and enter the Order ID (e.g., `HB-1001`) to see the live timeline.

---

## 5. HOW YOU GET PAID (MONEY FLOW & PROFIT MARGINS)

| Payment Method | How Money Reaches You | Settlement Timeline |
|---|---|---|
| **Online (Razorpay UPI, GPay, Cards)** | Razorpay deposits directly into your bank account. | **T+2 working days** |
| **Cash on Delivery (COD)** | Courier collects cash at doorstep; Qikink remits to your bank. | **Every Tuesday & Friday** |

### Profit Example on 1 T-Shirt:
- Customer pays on website: **₹999**
- Qikink manufacturing cost (Garment + DTF print + Packaging): **~₹380**
- **Your Net Profit on 1 sale:** **~₹619 PROFIT**

---

## 6. BROTHER'S GOLDEN RULES FOR DAILY OPERATIONS

1. **Keep ₹1,500 – ₹2,500 in your Qikink Wallet:** Qikink deducts the raw blank tee cost (~₹380) automatically from your wallet when printing. If your wallet is empty, orders will pause. Top up at _board.qikink.com → Wallet_.
2. **Check Admin Daily:** Open **hotbee.netlify.app/admin/orders** once a day to see new orders.
3. **Hit "Sync from Qikink":** Once every morning, tap the sync button to refresh tracking numbers.
4. **Keep adding fresh designs:** Whenever you make a cool new concept on Qikink, publish it to HOTBEE immediately to give customers new drops!
