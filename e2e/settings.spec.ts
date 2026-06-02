// SPDX-License-Identifier: MPL-2.0

import { expect, test, type Page } from "@playwright/test";
import { readState, signUp, uniqueEmail, useInvite } from "./helpers";

// Fill a field, then wait for the PUT it fires on blur to complete — the page
// saves on blur, so an immediate reload/assert would otherwise race the request.
async function editAndSave(page: Page, selector: string, value: string, urlPart: string) {
  const field = page.locator(selector);
  await field.fill(value);
  await Promise.all([
    page.waitForResponse(
      (r) => r.request().method() === "PUT" && r.url().includes(urlPart) && r.ok(),
    ),
    field.blur(),
  ]);
}

test.describe("settings editing", () => {
  test("admin edits organization name + description and persists them", async ({ page }) => {
    const { settingsOrgId, settingsInviteCode } = readState();

    const adminEmail = uniqueEmail("org-editor");
    await signUp(page, adminEmail);
    await useInvite(page, settingsInviteCode);

    const apiPath = `/api/org/${settingsOrgId}`;
    const newName = `Edited Org ${Date.now()}`;
    const newDesc = "Organization description set by the e2e suite.";

    await page.goto(`/org/${settingsOrgId}`);
    // Admins can edit; the name field must be enabled.
    await expect(page.locator("#org-name")).toBeEnabled();

    // Save the name, reload from the server, and confirm it stuck. Reloading
    // between edits keeps each save working from fresh server state.
    await editAndSave(page, "#org-name", newName, apiPath);
    await page.reload();
    await expect(page.locator("#org-name")).toHaveValue(newName);

    await editAndSave(page, "#org-desc", newDesc, apiPath);
    await page.reload();
    await expect(page.locator("#org-desc")).toHaveValue(newDesc);
    // The name must survive the description save.
    await expect(page.locator("#org-name")).toHaveValue(newName);
  });

  test("admin edits team name + description and persists them", async ({ page }) => {
    const { settingsOrgId, settingsMemberInviteCode } = readState();

    // The team creator becomes a team admin, so org membership is enough here.
    const memberEmail = uniqueEmail("team-editor");
    await signUp(page, memberEmail);
    await useInvite(page, settingsMemberInviteCode);

    // Create a team the user owns (creator becomes team admin).
    const teamResponse = await page.request.post("/api/team", {
      data: { name: "Editable Team", organizationId: settingsOrgId },
    });
    expect(teamResponse.ok()).toBeTruthy();
    const { teamId } = await teamResponse.json();
    expect(typeof teamId).toBe("string");

    const apiPath = `/api/team/${teamId}`;
    const newName = `Edited Team ${Date.now()}`;
    const newDesc = "Team description set by the e2e suite.";

    await page.goto(`/org/${settingsOrgId}/team/${teamId}`);
    await expect(page.locator("#ts-name")).toHaveValue("Editable Team");

    await editAndSave(page, "#ts-name", newName, apiPath);
    await page.reload();
    await expect(page.locator("#ts-name")).toHaveValue(newName);

    await editAndSave(page, "#ts-desc", newDesc, apiPath);
    await page.reload();
    await expect(page.locator("#ts-desc")).toHaveValue(newDesc);
    await expect(page.locator("#ts-name")).toHaveValue(newName);
  });
});
