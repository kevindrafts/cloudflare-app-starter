# Contributing

Bug reports and focused improvements are welcome. Explain the user-visible problem, include reproduction steps, and keep unrelated changes in separate pull requests.

Use the Node version in `.nvmrc` and the pnpm version in `package.json`. Install with `pnpm install --frozen-lockfile`, run `pnpm exec playwright install chromium` once, then run `pnpm check` and `pnpm test` before submitting. `pnpm test` builds the production assets and exercises them in the local Cloudflare runtime. No Cloudflare credentials are needed.

Use `pnpm format` for consistent formatting. Commit lockfile changes with dependency updates. Keep `.env`, `.dev.vars`, local databases, and credentials out of Git. Add tests for changed behavior, and update the README when changing setup or deployment commands.

This repository deliberately stays small. Discuss new services or mandatory integrations in an issue before adding them.
