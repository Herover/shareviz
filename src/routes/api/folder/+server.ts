import { json } from "@sveltejs/kit";
import { db } from "$lib/../../server_lib/user";

export async function POST({ request, locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
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
    return json({ message: "unauthorized" }, { status: 401 });
  }

  const id = await db.addFolder(name, teamId, parentId);

  return json({ id }, { status: 200 });
}
