import { readFileSync } from "node:fs";
const config = JSON.parse(
  readFileSync(new URL("../wrangler.json", import.meta.url), "utf8"),
);
const id = config.d1_databases?.find((db) => db.binding === "DB")?.database_id;
if (!id || id === "00000000-0000-0000-0000-000000000000") {
  console.error(
    "Provision D1 first: pnpm exec wrangler d1 create cloudflare-app-starter-db. Copy the returned database_id into wrangler.json, then run pnpm db:migrate:remote. See README.md.",
  );
  process.exit(1);
}
