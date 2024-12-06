import { json } from "@sveltejs/kit";
import { db } from "../../../../../server_lib/sqlite";

export async function GET({ params, locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (
    session == null ||
    typeof user == "undefined" ||
    typeof user.id != "string"
  ) {
    return json({ message: "invalid token" }, { status: 400 });
  }

  // TODO: Check if user has access to team

  const team = await db.getTeam(params.id);
  const members = await db.getTeamMembers(params.id);
  const charts = await db.getTeamCharts(params.id);
  return json(
    {
      charts,
      members: members.map((e) => ({ user: e.user, role: e.usersTeams.role })),
      name: team.name,
      organizationId: team.organizationId,
    },
    { status: 200 },
  );
}
