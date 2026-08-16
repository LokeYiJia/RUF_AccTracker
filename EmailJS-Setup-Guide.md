# Receipt Emails — EmailJS Setup Guide (≈15 minutes)

The app emails customers a receipt automatically when staff confirm their payment. Email is sent through **EmailJS** (free tier: 200 emails/month, no credit card). You set it up once; the keys are shared with every admin device through the app's database.

## Step 1 — Create the account & connect Gmail

1. Go to **[emailjs.com](https://www.emailjs.com)** → Sign Up (free).
2. In the dashboard: **Email Services → Add New Service → Gmail** → connect the fellowship's Gmail account (receipts will be sent *from* this address).
3. Note the **Service ID** shown on the service card (looks like `service_ab12xyz`).

## Step 2 — Create the receipt template

1. **Email Templates → Create New Template.**
2. **Settings tab** of the template:
   - **To Email:** `{{to_email}}`
   - **Subject:** `Your RUF receipt — {{order_id}}`
   - (Optional) **Reply To:** the fellowship's Gmail.
3. **Content tab** → switch to the **code/HTML view** (`</>` icon) and paste everything in the box below, replacing whatever is there.
4. Save, and note the **Template ID** (looks like `template_cd34uvw`).

```html
<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden">
  <div style="background:#213659;color:#ffffff;padding:22px 26px">
    <div style="font-size:20px;font-weight:bold">RUF — Receipt</div>
    <div style="font-size:13px;opacity:.85;margin-top:4px">Reformed University Fellowship</div>
  </div>
  <div style="padding:24px 26px;color:#111111">
    <p style="margin:0 0 16px">Hi {{to_name}},</p>
    <p style="margin:0 0 16px">Thank you for your purchase! Your payment has been confirmed. 🎉</p>
    <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:16px">
      <tr><td style="padding:4px 0;color:#6B7280">Order</td><td style="padding:4px 0;text-align:right;font-weight:bold">{{order_id}}</td></tr>
      <tr><td style="padding:4px 0;color:#6B7280">Ordered</td><td style="padding:4px 0;text-align:right">{{order_date}}</td></tr>
      <tr><td style="padding:4px 0;color:#6B7280">Paid</td><td style="padding:4px 0;text-align:right">{{paid_date}}</td></tr>
      <tr><td style="padding:4px 0;color:#6B7280">Channel</td><td style="padding:4px 0;text-align:right">{{channel}}</td></tr>
    </table>
    <div style="background:#F5F5F5;border-radius:8px;padding:14px 16px;font-size:14px;white-space:pre-line;margin-bottom:14px">{{items}}</div>
    <table style="width:100%;font-size:16px;border-collapse:collapse">
      <tr><td style="padding:8px 0;border-top:2px solid #111111;font-weight:bold">Total paid</td><td style="padding:8px 0;border-top:2px solid #111111;text-align:right;font-weight:bold">{{total}}</td></tr>
    </table>
    <p style="margin:18px 0 0;font-size:13px;color:#6B7280">This is your official receipt. If anything looks wrong, just reply to this email.</p>
  </div>
</div>
```

## Step 3 — Get the Public Key

**Account → General → Public Key** (a short code like `Fx2Ab9cDeFgHiJk`).

## Step 4 — Paste the three keys into the app

App → **Inventory Management → ⚙ Settings → Receipt Emails**: fill in Service ID, Template ID, Public Key → **Save Keys** → enter your own email next to **Send Test** and check your inbox (and spam folder — mark it "not spam" once and later receipts land normally).

That's it. From then on:

- **Booth:** customer taps *✓ We've Paid* → staff verify in TnG/bank → tap *✓ Payment Received* → receipt emails itself.
- **Online:** staff verify the uploaded payment screenshot against the bank/TnG statement → *Fulfil Order* → receipt emails itself.
- Every fulfilled order card also has an **📧 Email Receipt / Resend Receipt** button, and shows when and where the receipt was sent.

## Notes

- If email isn't set up (or a customer gave no email), everything else still works — the app just skips the email quietly.
- Free tier is 200 emails/month. If a big event will exceed that, EmailJS's paid tier is cheap, or we can switch to the Firebase email extension later — the app-side design doesn't change.
- The keys let someone send emails through your EmailJS account (not read your Gmail). If abused, regenerate the Public Key in EmailJS and re-save it in Settings.
