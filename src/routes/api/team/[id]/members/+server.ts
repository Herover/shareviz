// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { db, TEAM_ROLES } from "$lib/../../server_lib/sqlite";

export async function POST({ request, locals, params }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const isTeamAdmin =
    (await db.getTeamMembers(params.id)).findIndex(
      (u) => u.user.id == user.id && u.usersTeams.role == TEAM_ROLES.ADMIN,
    ) != -1;

  if (!isTeamAdmin) {
    return json({ message: "unauthorized" }, { status: 403 });
  }

  const { userId } = await request.json();
  if (typeof userId != "string") {
    return json({ message: "invalid userId" }, { status: 400 });
  }

  // TODO: check if user has access to organization

  try {
    await db.addUserTeamsRelation(params.id, userId, TEAM_ROLES.MEMBER);
  } catch (err) {
    if ((err as Error).message.includes("UNIQUE constraint failed:")) {
      return json({ message: "user already added" }, { status: 400 });
    } else {
      throw err;
    }
  }

  return json({ message: "ok" });
}

export async function DELETE({ request, locals, params }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const isTeamAdmin =
    (await db.getTeamMembers(params.id)).findIndex(
      (u) => u.user.id == user.id && u.usersTeams.role == TEAM_ROLES.ADMIN,
    ) != -1;

  if (!isTeamAdmin) {
    return json({ message: "unauthorized" }, { status: 403 });
  }

  const { userId } = await request.json();
  if (typeof userId != "string") {
    return json({ message: "invalid userId" }, { status: 400 });
  }

  try {
    await db.removeUserTeamsRelation(params.id, userId);
  } catch (err) {
    if ((err as Error).message == "There must be at least 1 admin after removal") {
      return json({ message: "There must be at least 1 admin after removal" }, { status: 400 });
    } else {
      throw err;
    }
  }

  return json({ message: "ok" });
}
