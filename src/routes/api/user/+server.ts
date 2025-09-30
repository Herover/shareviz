// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { db } from "$lib/../../server_lib/user.js";

export async function GET({ locals }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }
  const teams = await db.getUserTeams(user.id);
  const organizations = await db.getUserOrganizations(user.id);
  return json({ userId: user.id, username: user.name, teams, organizations }, { status: 200 });
}
