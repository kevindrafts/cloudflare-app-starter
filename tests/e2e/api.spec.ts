import { test, expect } from "@playwright/test";
import {
  projectResponseSchema,
  projectsResponseSchema,
} from "../../shared/contracts";
test("real Workers API persists CRUD to local D1", async ({ request }) => {
  const created = await request.post("/api/projects", {
    data: {
      name: "API smoke project",
      description: "Local D1 integration",
      status: "planned",
    },
  });
  expect(created.status()).toBe(201);
  const { project } = projectResponseSchema.parse(await created.json());
  try {
    const list = await request.get("/api/projects");
    expect(list.headers()["cache-control"]).toBe("no-store");
    expect(
      projectsResponseSchema
        .parse(await list.json())
        .projects.some((p) => p.id === project.id),
    ).toBe(true);
    const updated = await request.put(`/api/projects/${project.id}`, {
      data: { name: "Updated via API", status: "done" },
    });
    expect(updated.status()).toBe(200);
    expect(
      projectResponseSchema.parse(await updated.json()).project.status,
    ).toBe("done");
  } finally {
    expect((await request.delete(`/api/projects/${project.id}`)).status()).toBe(
      204,
    );
  }
  expect((await request.delete(`/api/projects/${project.id}`)).status()).toBe(
    404,
  );
});
test("validation, malformed requests, unknown API routes and cross-origin writes", async ({
  request,
}) => {
  for (const data of [
    { name: "" },
    { name: "x".repeat(81) },
    { name: "Valid", status: "private" },
    { name: "Valid", owner: "someone" },
  ])
    expect((await request.post("/api/projects", { data })).status()).toBe(400);
  expect(
    (
      await request.post("/api/projects", {
        data: "{broken",
        headers: { "Content-Type": "application/json" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/projects", {
        data: "text",
        headers: { "Content-Type": "text/plain" },
      })
    ).status(),
  ).toBe(415);
  expect(
    (
      await request.post("/api/projects", {
        data: { name: "Blocked" },
        headers: { Origin: "https://other.example" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/projects", {
        data: { name: "Huge", description: "x".repeat(9000) },
      })
    ).status(),
  ).toBe(413);
  expect(
    (
      await request.put("/api/projects/not-an-id", {
        data: { name: "Invalid" },
      })
    ).status(),
  ).toBe(400);
  const missing = await request.get("/api/missing", {
    headers: { Accept: "text/html" },
  });
  expect(missing.status()).toBe(404);
  expect(missing.headers()["content-type"]).toContain("application/json");
  expect(
    (await request.get("/api", { headers: { Accept: "text/html" } })).status(),
  ).toBe(404);
  const absent = "00000000-0000-4000-8000-999999999999";
  expect(
    (
      await request.put(`/api/projects/${absent}`, {
        data: { name: "Missing" },
      })
    ).status(),
  ).toBe(404);
});
