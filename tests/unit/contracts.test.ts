import { describe, expect, it } from "vitest";
import { projectInputSchema, projectSchema } from "../../shared/contracts";
import app from "../../worker";
describe("shared project contracts", () => {
  it("trims user input and fills optional fields", () =>
    expect(projectInputSchema.parse({ name: "  New idea  " })).toEqual({
      name: "New idea",
      description: "",
      status: "planned",
    }));
  it.each([
    { name: "   " },
    { name: "a".repeat(81) },
    { name: "Valid", description: "x".repeat(501) },
    { name: "Valid", status: "secret" },
    { name: "Valid", ownerId: "spoofed" },
  ])("rejects invalid or unexpected input: %j", (value) =>
    expect(projectInputSchema.safeParse(value).success).toBe(false),
  );
  it("validates response IDs and timestamps", () =>
    expect(
      projectSchema.safeParse({
        name: "Valid",
        id: "not-an-id",
        createdAt: "yesterday",
        updatedAt: "today",
      }).success,
    ).toBe(false));
});
describe("disabled demo gate", () => {
  it.each([
    "/api/projects",
    "/api/projects/00000000-0000-4000-8000-000000000001",
  ])("blocks access without touching a database: %s", async (path) => {
    const response = await app.request(
      path,
      {},
      { DEMO_MODE: "false", DB: {} as D1Database },
    );
    expect(response.status).toBe(403);
  });
  it("does not leak exception details", async () => {
    const response = await app.request(
      "/api/projects",
      {},
      { DEMO_MODE: "true", DB: {} as D1Database },
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Something went wrong. Please try again.",
    });
  });
});
