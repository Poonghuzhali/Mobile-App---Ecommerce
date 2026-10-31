# Razorpay (test mode only by default)

This project is set up for **Razorpay test checkout only** — not live payments.

1. Add **test** keys to `backend/.env` (never commit real secrets):

```env
RAZORPAY_TEST_MODE_ONLY=True
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret
```

`rzp_live_*` keys are **ignored** while `RAZORPAY_TEST_MODE_ONLY=True` (default). To allow live payments later (not recommended for this internship build), set `RAZORPAY_TEST_MODE_ONLY=False` and use live keys.

2. Restart Django after editing `.env`.

3. In the app: **Checkout → Razorpay → Pay with Razorpay**.

## Test payments (India — `rzp_test_` keys)

| Method | What to enter |
|--------|----------------|
| **UPI** (easiest) | `success@razorpay` |
| **Domestic test card** | `5267 3181 8797 5449` — any CVV, any future expiry |
| **Netbanking** | Pick any bank in test mode |

Full list: [Razorpay test card / UPI details](https://razorpay.com/docs/payments/payments/test-card-upi-details/).

### “International cards are not supported”

This is normal on **default Indian Razorpay accounts** (including test mode) if you pay with a **foreign / international card** (often after bank OTP).

**Fix for testing:** use **UPI `success@razorpay`** or the **domestic test card** above — not `4111…` or your real international card.

**Fix for live international cards:** Razorpay Dashboard → **Account & Settings** → **Payment methods** → enable **International Credit/Debit Cards** (Razorpay may require KYC / approval).

## API flow

- `POST /api/orders/payment/razorpay/create-order/` — creates Razorpay order from cart total (INR, paise).
- Client opens Razorpay Checkout (WebView in Expo Go).
- `POST /api/orders/payment/razorpay/complete/` — verifies signature server-side, then places the order.
