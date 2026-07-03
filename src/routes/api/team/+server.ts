// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { db, TEAM_ROLES } from "$lib/../../server_lib/sqlite";
import { MAX_TEAMS_PER_ORGANIZATION } from "$lib/consts";

export async function POST({ request, locals }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const { name, organizationId } = await request.json();
  if (typeof name != "string") {
    return json({ message: "invalid name" }, { status: 400 });
  }
  if (typeof organizationId != "string") {
    return json({ message: "invalid organizationId" }, { status: 400 });
  }

  const organizations = await db.getUserOrganizations(user.id);
  if (organizations.findIndex((o) => o.organizations.id == organizationId) == -1) {
    return json({ message: "unauthorized" }, { status: 403 });
  }

  const existingTeams = await db.getOrganizationTeams(organizationId);
  if (existingTeams.length >= MAX_TEAMS_PER_ORGANIZATION) {
    return json(
      { message: `An organization may have at most ${MAX_TEAMS_PER_ORGANIZATION} teams` },
      { status: 409 },
    );
  }

  const teamId = await db.addTeam(name, organizationId);
  await db.addUserTeamsRelation(teamId, user.id, TEAM_ROLES.ADMIN);

  return json({ teamId });
}
