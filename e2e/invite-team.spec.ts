// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "@playwright/test";
import { readState, signIn, signOut, signUp, uniqueEmail, useInvite } from "./helpers";

test.describe("invite + team flow", () => {
  test("admin invites a second user and adds them to a team", async ({ page }) => {
    const { bootstrapOrgId, bootstrapInviteCode } = readState();

    // --- Admin signs up and joins the bootstrap org as admin ---
    const adminEmail = uniqueEmail("admin");
    await signUp(page, adminEmail);
    await useInvite(page, bootstrapInviteCode);

    // --- Admin creates a fresh invite for the second user ---
    await page.goto(`/org/${bootstrapOrgId}`);
    await page.getByRole("button", { name: "New invite" }).click();

    // The new invite code is rendered into a text input next to the button.
    const inviteInput = page.locator("input").first();
    await expect(inviteInput).toHaveValue(/[0-9a-f-]{36}/);
    const memberInviteCode = await inviteInput.inputValue();
    expect(memberInviteCode).not.toEqual(bootstrapInviteCode);

    // --- Admin creates a team via the API the UI normally calls ---
    const teamResponse = await page.request.post("/api/team", {
      data: { name: "QA Team", organizationId: bootstrapOrgId },
    });
    expect(teamResponse.ok()).toBeTruthy();
    const { teamId } = await teamResponse.json();
    expect(typeof teamId).toBe("string");

    await signOut(page);

    // --- Second user signs up and accepts the new invite ---
    const memberEmail = uniqueEmail("member");
    await signUp(page, memberEmail);
    await useInvite(page, memberInviteCode);

    // Grab the member's user id while we're signed in as them.
    const meResponse = await page.request.get("/api/user");
    expect(meResponse.ok()).toBeTruthy();
    const me = await meResponse.json();
    const memberUserId: string = me.userId;
    expect(typeof memberUserId).toBe("string");

    await signOut(page);

    // --- Admin signs back in and adds the member to the team ---
    await signIn(page, adminEmail);
    const addResponse = await page.request.post(`/api/team/${teamId}/members`, {
      data: { userId: memberUserId },
    });
    expect(addResponse.ok()).toBeTruthy();

    // --- Member can see the team they were added to ---
    await signOut(page);
    await signIn(page, memberEmail);
    await page.goto(`/org/${bootstrapOrgId}/team/${teamId}`);
    await expect(page.getByRole("heading", { name: "QA Team" })).toBeVisible();
  });
});
