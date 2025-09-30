// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { db } from "$lib/../../server_lib/sqlite";
import { TEAM_ROLES } from "$lib/consts";

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
  const session = locals.session;

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

export async function PUT({ request, locals, params }) {
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

  const { name } = await request.json();
  if (typeof name != "string" || name.length == 0) {
    return json({ message: "invalid name" }, { status: 400 });
  }

  await db.updateTeam(params.id, { name });

  return json({
    message: "ok",
  });
}
