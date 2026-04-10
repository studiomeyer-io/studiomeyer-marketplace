# Magic Link Setup

All StudioMeyer plugins authenticate with OAuth 2.1 + Magic Link. No passwords, no API keys to manage.

## First-time setup

After installing a plugin, the first tool call triggers the auth flow:

1. **Claude Code asks for your email.** Type the email you want the account attached to.
2. **Check your inbox.** You will get a message from `hello@studiomeyer.io` with a link. The link is valid for 10 minutes and single-use.
3. **Click the link.** You will see a short confirmation page.
4. **Return to Claude Code.** The tool call that triggered the flow now completes. The next call reuses the session.

Tokens are stored securely by Claude Code. You do not need to copy anything by hand.

## Why Magic Link and not a password?

Magic Link verifies that the email address is actually yours before issuing any access token. Earlier OAuth flows let anyone type any email and get a token, which made impersonation possible. Magic Link closes that hole.

## What if the email does not arrive?

- Check spam. Brevo SMTP, from `hello@studiomeyer.io`.
- Wait 30 seconds, then request a new link. The old one is invalidated automatically.
- Still nothing? Mail `hello@studiomeyer.io` and we will investigate.

## Token lifetime

- **Access token:** 60 minutes. Refreshed automatically by Claude Code.
- **Refresh token:** 30 days. Rotates on every refresh.
- **Magic Link:** 10 minutes, single-use.

## Disconnecting

```
/plugin uninstall studiomeyer-memory@studiomeyer
```

Uninstalling the plugin drops the local token. Server-side, the refresh token rotates out after 30 days of inactivity. If you want an instant revoke, mail `hello@studiomeyer.io`.

## Multiple plugins, one account

Memory, CRM, and GEO share the same tenant when you use the same email. Install all three and authenticate once per plugin. Crew is free and tenant-agnostic — no auth friction.
