// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "@playwright/test";
import { DEFAULT_PASSWORD, signIn, signOut, signUp, uniqueEmail } from "./helpers";

test.describe("auth", () => {
  test("a new user can sign up via /signup and lands on /me", async ({ page }) => {
    const email = uniqueEmail("signup");
    await signUp(page, email);
    await expect(page).toHaveURL(/\/me(\/|$|\?)/);
  });

  test("signup rejects an email already in use", async ({ page }) => {
    const email = uniqueEmail("dup");
    await signUp(page, email);
    await signOut(page);

    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(DEFAULT_PASSWORD);
    await page.getByLabel("Repeat password").fill(DEFAULT_PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();

    // Server redirects back to /signup?msg=email when the email is taken.
    await page.waitForURL(/\/signup\?msg=email/);
  });

  test("an existing user can sign in and sign out", async ({ page }) => {
    const email = uniqueEmail("login");
    await signUp(page, email);
    await signOut(page);

    await signIn(page, email);
    await expect(page).toHaveURL(/\/me(\/|$|\?)/);

    await signOut(page);
    // After signout, visiting a protected route bounces back to "/".
    await page.goto("/me");
    await page.waitForURL((url) => url.pathname === "/");
  });

  test("signin with a wrong password is rejected", async ({ page }) => {
    const email = uniqueEmail("badpw");
    await signUp(page, email);
    await signOut(page);

    await page.goto("/");
    await page.getByLabel("Email").fill(email);
    // exact: the page also has a "Show password" reveal button.
    await page.getByLabel("Password", { exact: true }).fill("totally-wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    // password_error redirect lands back on "/" with the msg flag.
    await page.waitForURL(/\/\?msg=password_error/);
  });
});
