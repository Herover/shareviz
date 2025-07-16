// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { db } from "$lib/../../server_lib/sqlite";

export async function PUT({ request, locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const { code } = await request.json();

  try {
    await db.addUserOrganizationRelation(code, user.id);
  } catch (err) {
    console.error(err);
    return json({ message: "invalid invite" }, { status: 400 });
  }

  return json({ message: "ok" }, { status: 200 });
}
