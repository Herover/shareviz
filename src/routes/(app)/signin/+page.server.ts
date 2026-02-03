// SPDX-License-Identifier: MPL-2.0

import { randomBytes } from "node:crypto";
import { db } from "$lib/../../server_lib/user";
import type { Actions } from "./$types";
import { redirect } from "@sveltejs/kit";
import { hash, verify } from "@node-rs/argon2";
import { setSessionCookie } from "$lib/auth";

export const actions: Actions = {
  // default: signIn,
  password: async ({ cookies, request, getClientAddress }) => {
    const data = await request.formData();
    const username = data.get("username");
    const password = data.get("password");
    let returnURL = data.get("return_url");

    if (typeof returnURL != "string") {
      returnURL = "/org";
    }
    if (!returnURL.startsWith("/") || returnURL.startsWith("//")) {
      returnURL = "/org";
    }

    if (typeof username != "string" /* || typeof password != "string" */) {
      return redirect(303, "/?msg=password_error&return_url=" + encodeURI(returnURL));
    }

    const user = await db.getUser({ username });
    if (!user) {
      return redirect(303, "/?msg=password_error&return_url=" + encodeURI(returnURL));
    }

    const passwordLogin = await db.getUserPasswordLogin(user.id);
    if (!passwordLogin) {
      return redirect(303, "/?msg=password_error&return_url=" + encodeURI(returnURL));
    }

    if (typeof password != "string") {
      return redirect(303, "/?msg=password_error&return_url=" + encodeURI(returnURL));
    }

    const verified = await verify(passwordLogin.hash, password, {
      salt: Buffer.from(passwordLogin.salt, "base64"),
    });
    if (!verified) {
      return redirect(303, "/?msg=password_error&return_url=" + encodeURI(returnURL));
    }

    setSessionCookie(user.id, request, cookies, getClientAddress(), "password");

    return redirect(303, returnURL);
  },
  setPassword: async ({ request, locals }) => {
    if (!locals.session) {
      redirect(303, "/");
    }
    const data = await request.formData();
    const oldPassword = data.get("old_password");
    const newPassword = data.get("new_password");
    if (typeof newPassword != "string") {
      return redirect(303, "/reset-password?msg=password_error");
    }

    const passwordLogin = await db.getUserPasswordLogin(locals.session.user.id);
    if (passwordLogin != null) {
      if (typeof oldPassword != "string") {
        return redirect(303, "/reset-password?msg=password_error");
      }

      const verified = await verify(passwordLogin.hash, oldPassword, {
        salt: Buffer.from(passwordLogin.salt, "base64"),
      });
      if (!verified) {
        return redirect(303, "/reset-password?msg=password_error");
      }
    }

    // At this point, consider the user authorized to change their password

    const salt = randomBytes(16);
    const pwHash = await hash(newPassword, { salt: salt });
    await db.addUserPasswordLogin(locals.session.user.id, pwHash, salt.toString("base64"));

    return redirect(303, "/org");
  },
};
