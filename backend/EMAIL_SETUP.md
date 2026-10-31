# Real email for OTP + order confirmations

## Resend (recommended)

1. Create an API key at [resend.com/api-keys](https://resend.com/api-keys).
2. In `backend/.env`:

```env
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=Vexo Cart <onboarding@resend.dev>
EMAIL_OTP_EXPIRE_MINUTES=10
```

3. **Restart Django** after editing `.env`.
4. Test:

```powershell
cd backend
..\venv\Scripts\python manage.py test_smtp your@gmail.com
```

5. In the app: **Register → Send OTP** → check inbox and spam.

**Note:** With `onboarding@resend.dev`, Resend only delivers to your **Resend account email** until you [verify a domain](https://resend.com/docs/dashboard/domains/introduction). After verification, set `RESEND_FROM_EMAIL=Vexo Cart <noreply@yourdomain.com>`.

---

## Gmail SMTP (alternative)

1. Turn on **2-Step Verification** on your Google account.
2. Create an **App password**: Google Account → Security → App passwords → Mail.
3. Remove or leave empty `RESEND_API_KEY`, then set `EMAIL_*` in `.env` (see `.env.example`).
4. Restart Django and run `manage.py test_smtp`.

---

## Troubleshooting

- Run `test_smtp` before testing OTP in the app.
- Restart Django after any `.env` change.
- Check spam; wait 1–2 minutes.
- Never commit `.env` or API keys to git.
