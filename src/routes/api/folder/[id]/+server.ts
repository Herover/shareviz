import { json } from "@sveltejs/kit";
import { db } from "$lib/../../server_lib/user";

export async function PUT({ params, request, locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const { name, parentId } = await request.json();
  if (typeof name != "string") {
    return json({ message: "invalid name" }, { status: 400 });
  }

  const folder = await db.getFolder(params.id);

  const teams = await db.getUserTeams(user.id);
  if (teams.findIndex((t) => t.teams.id == folder.teamId) == -1) {
    return json({ message: "unauthorized" }, { status: 401 });
  }

  await db.editFolder(params.id, { name, parentId });

  return json({ message: "ok" }, { status: 200 });
}
