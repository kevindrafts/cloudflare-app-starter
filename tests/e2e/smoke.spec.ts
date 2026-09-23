import { test, expect } from "@playwright/test";
test("overview renders sample data without layout overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A good place to begin." }),
  ).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Website refresh" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("create, validate, edit and delete a project through the UI", async ({
  page,
  request,
}) => {
  const name = `Browser project ${Date.now()}`;
  let id: string | undefined;
  try {
    await page.goto("/projects");
    await page
      .getByRole("button", { name: "New project", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Create project", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "Give your project a name.",
    );
    await page.getByLabel("Project name", { exact: true }).fill(name);
    await page.getByLabel("Description").fill("Created in a real browser");
    await page
      .getByRole("button", { name: "Create project", exact: true })
      .click();
    const card = page.getByRole("article", { name, exact: true });
    await expect(card).toBeVisible();
    const body = await (await request.get("/api/projects")).json();
    id = body.projects.find((p: { name: string }) => p.name === name)?.id;
    await page.reload();
    await expect(card).toBeVisible();
    await page
      .getByRole("button", { name: `Edit ${name}`, exact: true })
      .click();
    await page.getByLabel("Status", { exact: true }).selectOption("done");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(card.getByText("Completed", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: `Delete ${name}`, exact: true })
      .click();
    await page.getByRole("button", { name: "Keep project" }).click();
    await expect(card).toBeVisible();
    await page
      .getByRole("button", { name: `Delete ${name}`, exact: true })
      .click();
    await page
      .getByRole("button", { name: "Delete project", exact: true })
      .click();
    await expect(card).toHaveCount(0);
  } finally {
    if (id) await request.delete(`/api/projects/${id}`);
  }
});
test("search and status filters narrow projects", async ({ page }) => {
  await page.goto("/projects");
  await page.getByLabel("Search projects").fill("no-such-project");
  await expect(page.getByText("No matching projects")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByLabel("Filter by status").selectOption("done");
  await expect(
    page.getByRole("article", { name: "Design foundations" }),
  ).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Website refresh" }),
  ).toHaveCount(0);
});
test("empty, loading and recoverable error states", async ({ page }) => {
  await page.route("**/api/projects", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({ json: { projects: [] } });
  });
  await page.goto("/projects");
  await expect(
    page.getByRole("status", { name: "Loading projects" }),
  ).toBeVisible();
  await expect(
    page.getByText("A fresh page for your next idea."),
  ).toBeVisible();
  await page.unroute("**/api/projects");
  await page.route("**/api/projects", (route) =>
    route.fulfill({ status: 500, json: { error: "Temporary test outage" } }),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("Temporary test outage");
  await page.unroute("**/api/projects");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("article", { name: "Website refresh" }),
  ).toBeVisible();
});
test("settings survive reload and deep links work", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "dark", exact: true }).check();
  await page.getByLabel("Card density").selectOption("compact");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("status")).toContainText("Preferences saved");
  await page.reload();
  await expect(page.locator("html")).toHaveClass("dark");
  await expect(page.getByLabel("Card density")).toHaveValue("compact");
  await page.goto("/not-a-page");
  await expect(
    page.getByRole("heading", { name: "This page doesn’t live here." }),
  ).toBeVisible();
});
test("navigation is accessible on mobile", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile)
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Settings" })
    .click();
  await expect(page).toHaveURL(/\/settings/);
  await expect(
    page.getByRole("heading", { name: "A workspace that feels like you." }),
  ).toBeVisible();
});
