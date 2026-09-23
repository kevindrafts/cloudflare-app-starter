# Security

Never commit credentials, `.env`, `.dev.vars`, or local database files. For a vulnerability, use the repository’s **Security → Report a vulnerability** flow when available; avoid putting sensitive reproduction details in a public issue. Do not send actual customer data.

Update dependencies regularly and run the checks before deploying. This is a starter, not a security guarantee. Review your own application’s data handling and access controls before using it with real people.

## Public demo boundary

The project API intentionally has no authentication. Every visitor can read and mutate every project. The UI labels this explicitly. Origin checks and input validation do not make the data private. Set `DEMO_MODE` to `false` to disable the demo API; this does **not** add authentication. Add server-side sessions and ownership checks for every query and mutation before storing private data. Also add appropriate rate limiting, abuse protection, backup, and retention policies for your product.
