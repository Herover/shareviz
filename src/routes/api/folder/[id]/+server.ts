// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { db } from "$lib/../../server_lib/user";

export async function PUT({ params, request, locals }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const { name, parentId }: { name?: string; parentId?: string | null } = await request.json();

  const folder = await db.getFolder(params.id);
  if (folder.teamId == null) {
    return json({ message: "unauthorized" }, { status: 403 });
  }

  const teams = await db.getUserTeams(user.id);
  if (teams.findIndex((t) => t.teams.id == folder.teamId) == -1) {
    return json({ message: "unauthorized" }, { status: 403 });
  }

  if (typeof parentId == "string" && parentId.length > 0) {
    if (parentId == params.id) {
      return json({ message: "folder cannot be its own parent" }, { status: 400 });
    }
    const teamFolders = await db.getFolders(folder.teamId);
    const byId = new Map(teamFolders.map((f) => [f.id, f]));
    if (!byId.has(parentId)) {
      return json({ message: "invalid parentId" }, { status: 400 });
    }
    let cursor = byId.get(parentId);
    const seen = new Set<string>();
    while (cursor?.parentId) {
      if (cursor.parentId == params.id) {
        return json({ message: "cycle detected" }, { status: 400 });
      }
      if (seen.has(cursor.parentId)) break;
      seen.add(cursor.parentId);
      cursor = byId.get(cursor.parentId);
    }
  }

  await db.editFolder(params.id, { name, parentId });

  return json({ message: "ok" }, { status: 200 });
}
