# Security status

This is an educational demo for localhost with fictional data. Do not expose the running service to the internet or enter real passwords or personal information.

Known limitations visible in the supplied code:

- Passwords are stored in plaintext and serialized with user responses, including list/login/registration and some conflict responses.
- Login does not create a server-authenticated session, cookie, or bearer token.
- Controllers have no enforced authorization. Role-dependent UI controls can be bypassed by calling the API directly; the update API accepts role changes.
- Cancellation trusts the caller's supplied user ID. It does not verify a signed-in identity.
- Input validation is limited, username uniqueness is checked in application code, and rate limiting is absent.
- Swagger is enabled outside development too. HTTP startup is intended for a local demo.

Before hosting, implement password hashing, authenticated sessions, policy-based authorization and ownership checks, response DTOs that omit passwords, stricter validation, HTTPS, and abuse protections. Review dependencies with a working vulnerability-data connection.

The repository package removes stored databases, original hardcoded bootstrap credentials, generated bundles, build output, archive copies, and inherited remote references. `.gitignore` reduces accidental disclosure but is not a substitute for reviewing staged files. Never publish logs, database copies, real user screenshots, environment files, private keys, or credentials. If any credential was previously public, rotate it; deleting a file does not erase Git history.

No security contact was provided. Do not disclose sensitive vulnerability details or credentials in public issues; arrange a private channel with the repository owner.
