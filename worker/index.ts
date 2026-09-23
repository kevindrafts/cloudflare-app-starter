import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { drizzle } from "drizzle-orm/d1";
import { desc, eq, sql } from "drizzle-orm";
import { projects } from "./db/schema";
import { projectIdSchema, projectInputSchema } from "../shared/contracts";
type Bindings = { DB: D1Database; DEMO_MODE: string };
const app = new Hono<{ Bindings: Bindings }>();
app.use("*", secureHeaders());
app.use("/api/*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  const origin = c.req.header("Origin");
  if (
    !["GET", "HEAD", "OPTIONS"].includes(c.req.method) &&
    origin &&
    origin !== new URL(c.req.url).origin
  ) {
    return c.json({ error: "Cross-origin writes are not allowed." }, 403);
  }
  await next();
});
app.use(
  "/api/*",
  bodyLimit({
    maxSize: 8192,
    onError: (c) => c.json({ error: "Request body is too large." }, 413),
  }),
);
app.get("/api/health", (c) =>
  c.json({
    ok: true,
    mode: c.env.DEMO_MODE === "true" ? "public-demo" : "disabled",
  }),
);
// This is intentionally a PUBLIC demo. Origin checks are not authentication.
// Replace this gate with session authentication and per-record authorization before real data.
app.use("/api/projects", async (c, next) => {
  if (c.env.DEMO_MODE !== "true")
    return c.json(
      {
        error:
          "Demo API disabled. Add authentication and authorization before enabling private data.",
      },
      403,
    );
  await next();
});
app.use("/api/projects/*", async (c, next) => {
  if (c.env.DEMO_MODE !== "true")
    return c.json({ error: "Demo API disabled." }, 403);
  await next();
});
app.get("/api/projects", async (c) => {
  const rows = await drizzle(c.env.DB)
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt))
    .limit(200);
  return c.json({ projects: rows });
});
app.post("/api/projects", async (c) => {
  if (!c.req.header("Content-Type")?.includes("application/json"))
    return c.json({ error: "Use application/json." }, 415);
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON." }, 400);
  }
  const parsed = projectInputSchema.safeParse(body);
  if (!parsed.success)
    return c.json(
      {
        error: "Check the project details.",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      400,
    );
  const db = drizzle(c.env.DB);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(projects);
  if (count >= 200)
    return c.json(
      {
        error:
          "This demo is limited to 200 projects. Delete one before adding another.",
      },
      409,
    );
  const now = new Date().toISOString();
  const [project] = await db
    .insert(projects)
    .values({
      ...parsed.data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return c.json({ project }, 201);
});
app.put("/api/projects/:id", async (c) => {
  const id = projectIdSchema.safeParse(c.req.param("id"));
  if (!id.success) return c.json({ error: "Invalid project ID." }, 400);
  if (!c.req.header("Content-Type")?.includes("application/json"))
    return c.json({ error: "Use application/json." }, 415);
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON." }, 400);
  }
  const parsed = projectInputSchema.safeParse(body);
  if (!parsed.success)
    return c.json(
      {
        error: "Check the project details.",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      400,
    );
  const [project] = await drizzle(c.env.DB)
    .update(projects)
    .set({ ...parsed.data, updatedAt: new Date().toISOString() })
    .where(eq(projects.id, id.data))
    .returning();
  if (!project) return c.json({ error: "Project not found." }, 404);
  return c.json({ project });
});
app.delete("/api/projects/:id", async (c) => {
  const id = projectIdSchema.safeParse(c.req.param("id"));
  if (!id.success) return c.json({ error: "Invalid project ID." }, 400);
  const rows = await drizzle(c.env.DB)
    .delete(projects)
    .where(eq(projects.id, id.data))
    .returning({ id: projects.id });
  if (!rows.length) return c.json({ error: "Project not found." }, 404);
  return c.body(null, 204);
});
app.notFound((c) => c.json({ error: "API route not found." }, 404));
app.onError((error, c) => {
  console.error("API request failed", error);
  return c.json({ error: "Something went wrong. Please try again." }, 500);
});
export default app;
