import { json } from '@sveltejs/kit';
import { db } from "../../../../server_lib/sqlite";

export async function POST({ request, locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const { name, organizationId } = await request.json();
  if (typeof name != "string") {
    return json({ message: "invalid name" }, { status: 400 });
  }

  // TODO: check if user has access to organization

  const teamId = await db.addTeam(name, organizationId);
  await db.addUserTeamsRelation(teamId, user.id);

  return json({ teamId });
}
