# Initial Admin Setup

There is no default admin account and no password is ever committed to this
repository. You create the first account yourself, once, using a setup token you
control.

## Option A — Web-based setup (no SSH required, works on Hostinger)

1. **Set a setup token** on the server before anyone can use the setup screen. This
   is a secret you choose — treat it like a temporary password.

   - **Local development:** export it before starting PHP:
     ```bash
     CMS_SETUP_TOKEN=choose-a-long-random-string php -S localhost:8090 -t public
     ```
   - **Hostinger:** in hPanel → your website → Advanced → PHP Configuration (or
     Environment Variables, depending on your plan), add:
     ```
     CMS_SETUP_TOKEN=choose-a-long-random-string
     ```
     If your plan does not expose environment variables, you may temporarily hardcode
     the token as a fallback in `public/api/config.php`'s `SETUP_TOKEN` constant,
     complete setup, then **immediately delete it** from the file and redeploy.

2. Visit `https://yourdomain.com/admin/login`, click **"First time here? Create the
   admin account"**, and enter:
   - The setup token from step 1
   - A username
   - A password (at least 10 characters — use a real password manager to generate one)

3. Submit. The account is created and you're logged in immediately.

4. **Setup is now permanently disabled** — the API refuses to create a second account
   this way once any user exists (`users.json` is no longer empty). This is
   intentional; it prevents anyone else from ever using the setup screen again, even
   if they somehow learn the token. To add more admins later, this needs to be done
   through a future "manage users" feature or by directly editing `cms-data/users.json`
   with a hash generated as shown in Option B below.

5. Remove or rotate `CMS_SETUP_TOKEN` once setup is complete — it no longer does
   anything useful, but there's no reason to leave it configured.

## Option B — Generate a password hash yourself (if you prefer not to use the web form)

Run this locally with PHP (you have PHP installed if you can run this project at all):

```bash
php -r "echo password_hash('your-chosen-password', PASSWORD_DEFAULT), PHP_EOL;"
```

This prints a hash like `$2y$10$...`. Then manually create `cms-data/users.json`
(or edit it if it's still `[]`) with:

```json
[
  {
    "id": "user-0000000000000000000",
    "username": "admin",
    "passwordHash": "PASTE_THE_HASH_HERE",
    "role": "admin",
    "mustChangePassword": false,
    "createdAt": "2026-01-01T00:00:00+00:00",
    "updatedAt": "2026-01-01T00:00:00+00:00",
    "lastLoginAt": null
  }
]
```

Upload this file to `cms-data/users.json` on the server (remember: this file lives
**outside** `public_html`, one level above it — see README-CMS.md for the exact path).
You can now log in at `/admin/login` with the username and the plaintext password you
chose (never the hash itself).

## Changing your password later

Once logged in, go to **Admin → Profile** to change your password at any time. This
does not require the setup token.

## If you get locked out

- Wrong-password attempts are rate-limited (6 attempts per IP+username, then a
  15-minute lockout) — this is normal, not a bug. Wait 15 minutes.
- If you've genuinely lost the password, use Option B above to overwrite your user's
  `passwordHash` in `cms-data/users.json` with a freshly generated hash.
