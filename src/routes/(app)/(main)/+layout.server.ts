// SPDX-License-Identifier: MPL-2.0

import { redirect } from "@sveltejs/kit";
import { db } from "$lib/../../server_lib/sqlite.js";

export async function load({ locals }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    redirect(302, "/");
  }

  const orgs = await db.getUserOrganizations(user.id);

  return {
    organizations: orgs,
  };
}
