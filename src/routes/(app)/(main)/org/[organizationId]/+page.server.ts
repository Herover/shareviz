// SPDX-License-Identifier: MPL-2.0

import { db } from "$lib/../../server_lib/sqlite.js";
import { TEAM_ROLES } from "$lib/consts.js";

export async function load({ params, parent }) {
  const data = await parent();
  const invites = data.userIsOrgAdmin ? await db.getOrganizationInvites(params.organizationId) : [];

  // Teams the current user belongs to within this organization. Administrators
  // additionally see every team in the organization, including ones they are
  // not a member of.
  const myTeamIds = new Set(
    data.teams
      .filter((t) => t.teams.organizationId === params.organizationId)
      .map((t) => t.teams.id),
  );

  const teamRows = data.userIsOrgAdmin
    ? await db.getOrganizationTeams(params.organizationId)
    : data.teams
        .filter((t) => t.teams.organizationId === params.organizationId)
        .map((t) => t.teams);

  const teamCards = await Promise.all(
    teamRows.map(async (team) => {
      const members = await db.getTeamMembers(team.id);
      return {
        id: team.id,
        name: team.name,
        description: team.description,
        isMember: myTeamIds.has(team.id),
        members: members.map((m) => ({
          id: m.user.id,
          name: m.user.name ?? "",
          image: m.user.image ?? undefined,
          isAdmin: m.usersTeams.role === TEAM_ROLES.ADMIN,
        })),
      };
    }),
  );
  teamCards.sort((a, b) => a.name.localeCompare(b.name));

  return { invites, teamCards };
}
