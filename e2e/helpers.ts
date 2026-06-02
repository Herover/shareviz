// SPDX-License-Identifier: MPL-2.0

import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";

const STATE_FILE = path.resolve(".e2e-data/state.json");

export interface E2EState {
  bootstrapOrgId: string;
  bootstrapInviteCode: string;
  settingsOrgId: string;
  settingsInviteCode: string;
  settingsMemberInviteCode: string;
}

export function readState(): E2EState {
  return JSON.parse(readFileSync(STATE_FILE, "utf8"));
}

export function uniqueEmail(prefix = "user"): string {
  // Random + time keeps emails unique across retries/parallel projects.
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${suffix}@example.test`;
}

export const DEFAULT_PASSWORD = "test-password-1234";

export async function signUp(page: Page, email: string, password = DEFAULT_PASSWORD) {
  await page.goto("/signup");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Repeat password").fill(password);
  await page.getByRole("button", { name: "Create user" }).click();
  // Signup redirects to /me on success.
  await page.waitForURL(/\/me(\/|$|\?)/);
}

export async function signIn(page: Page, email: string, password = DEFAULT_PASSWORD) {
  await page.goto("/");
  await page.getByLabel("Username").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL(/\/me(\/|$|\?)/);
}

export async function signOut(page: Page) {
  // /signout is a POST form action. Submit via a tiny generated form so we
  // don't depend on a UI affordance that may move around.
  await page.goto("/me");
  await page.evaluate(() => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/signout";
    document.body.appendChild(form);
    form.submit();
  });
  await page.waitForURL((url) => url.pathname === "/");
}

export async function useInvite(page: Page, code: string) {
  await page.goto(`/invite?code=${encodeURIComponent(code)}`);
  const joinButton = page.getByRole("button", { name: /^Join / });
  await expect(joinButton).toBeVisible();
  await joinButton.click();
  await page.waitForURL(/\/me(\/|$|\?)/);
}
