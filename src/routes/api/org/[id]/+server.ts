// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { db } from "$lib/../../server_lib/sqlite";
import { ORGANIZATION_ROLES } from "$lib/consts";

export async function PUT({ request, locals, params }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const isAdmin =
    (await db.getOrganizationUsers(params.id)).findIndex(
      (e) =>
        e.usersOrganizations.userId == user.id &&
        e.usersOrganizations.role == ORGANIZATION_ROLES.ADMIN,
    ) != -1;
  if (!isAdmin) {
    return json({ message: "unauthorized" }, { status: 403 });
  }

  const { name, description } = await request.json();
  if (typeof name != "string" || name.length == 0) {
    return json({ message: "invalid name" }, { status: 400 });
  }
  if (typeof description != "undefined" && typeof description != "string") {
    return json({ message: "invalid description" }, { status: 400 });
  }

  const details: { name: string; description?: string } = { name };
  if (typeof description == "string") details.description = description;
  await db.updateOrganization(params.id, details);

  return json({ message: "ok" });
}
