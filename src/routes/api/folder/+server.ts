// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { db } from "$lib/../../server_lib/user";
import { MAX_FOLDERS_PER_TEAM } from "$lib/consts";

export async function POST({ request, locals }) {
  const user = locals.session?.user;
  if (locals.session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const { name, teamId, parentId } = await request.json();
  if (typeof name != "string") {
    return json({ message: "invalid name" }, { status: 400 });
  }
  if (typeof teamId != "string") {
    return json({ message: "invalid teamId" }, { status: 400 });
  }

  const teams = await db.getUserTeams(user.id);
  if (teams.findIndex((t) => t.teams.id == teamId) == -1) {
    return json({ message: "unauthorized" }, { status: 403 });
  }

  const existingFolders = await db.getFolders(teamId);
  if (existingFolders.length >= MAX_FOLDERS_PER_TEAM) {
    return json(
      { message: `A team may have at most ${MAX_FOLDERS_PER_TEAM} folders` },
      { status: 409 },
    );
  }

  if (typeof parentId == "string" && parentId.length > 0) {
    const parent = await db.getFolder(parentId).catch(() => null);
    if (!parent || parent.teamId != teamId) {
      return json({ message: "invalid parentId" }, { status: 400 });
    }
  }

  const id = await db.addFolder(name, teamId, parentId);

  return json({ id }, { status: 200 });
}
