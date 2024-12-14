import { json } from "@sveltejs/kit";
import { db } from "../../../../../server_lib/sqlite";

export type TeamResponse = {
  charts: Awaited<ReturnType<typeof db.getTeamCharts>>;
  members: {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      emailVerified: Date | null;
      image: string | null;
    };
    role: number;
  }[];
  folders: Awaited<ReturnType<typeof db.getFolders>>;
  name: string;
  organizationId: string;
};

export async function GET({ params, locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  // TODO: Check if user has access to team

  const team = await db.getTeam(params.id);
  const members = await db.getTeamMembers(params.id);
  const charts = await db.getTeamCharts(params.id);
  const folders = await db.getFolders(params.id);
  return json(
    {
      charts,
      members: members.map((e) => ({ user: e.user, role: e.usersTeams.role })),
      folders,
      name: team.name,
      organizationId: team.organizationId,
    } satisfies TeamResponse,
    { status: 200 },
  );
}
