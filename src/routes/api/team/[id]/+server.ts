import { json } from '@sveltejs/kit';
import { db } from "../../../../../server_lib/sqlite";

export async function GET({ params, locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  // TODO: Check if user has access to team

  const members = await db.getTeamMembers(params.id);

  const charts = await db.getTeamCharts(params.id);
  return json({ charts, members: members.map(e => e.user) }, { status: 200 });
}
