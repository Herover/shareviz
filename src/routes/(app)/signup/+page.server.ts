// SPDX-License-Identifier: MPL-2.0

import { randomBytes } from "node:crypto";
import { db } from "$lib/../../server_lib/user";
import type { Actions } from "./$types";
import { redirect } from "@sveltejs/kit";
import { hash, verify } from "@node-rs/argon2";
import { setSessionCookie } from "$lib/auth";

export const actions: Actions = {
  default: async ({ request, locals, cookies, getClientAddress }) => {
    // User should not be signed in at this points
    if (locals.session) {
      redirect(303, "/");
    }

    const data = await request.formData();
    const password = data.get("password");
    const email = data.get("email");
    if (typeof password != "string") {
      return redirect(303, "/signup?msg=error");
    }
    if (typeof email != "string" || !email.includes("@")) {
      return redirect(303, "/signup?msg=error");
    }

    const existingUser = await db.getUser({ username: email });
    if (existingUser != null) {
      return redirect(303, "/signup?msg=email");
    }

    const salt = randomBytes(16);
    const pwHash = await hash(password, { salt: salt });
    const user = await db.addUser({ email, name: email.split("@")[0] });
    await db.addUserPasswordLogin(user.id, pwHash, salt.toString("base64"));

    setSessionCookie(user.id, request, cookies, getClientAddress(), "password");

    return redirect(303, "/org");
  },
};
