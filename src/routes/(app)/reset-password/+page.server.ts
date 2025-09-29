// SPDX-License-Identifier: MPL-2.0

import { redirect } from "@sveltejs/kit";
import { db } from "../../../../server_lib/user";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) {
    redirect(302, "/");
  }
  const passwordLogin = await db.getUserPasswordLogin(locals.session.user.id);
  return {
    hasPassword: passwordLogin != null,
  };
};
