// SPDX-License-Identifier: MPL-2.0

import { db } from "$lib/../../server_lib/sqlite.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent, params }) => {
  // `teams` is loaded by the organization layout and holds every team the
  // current user belongs to; narrow it to the organization being viewed.
  const { teams } = await parent();

  // This is slightly expensive, consider making a optimized DB query later.
  const teamCards = await Promise.all(
    teams
      .filter((t) => t.teams.organizationId === params.organizationId)
      .map(async (t) => {
        const [members, charts] = await Promise.all([
          db.getTeamMembers(t.teams.id),
          db.getTeamCharts(t.teams.id),
        ]);

        const lastActivity = charts.reduce(
          (max, c) => Math.max(max, c.updated ?? 0, c.created ?? 0),
          0,
        );

        return {
          id: t.teams.id,
          name: t.teams.name,
          description: t.teams.description,
          role: t.usersTeams.role,
          members: members.map((m) => ({
            id: m.user.id,
            name: m.user.name ?? "",
            image: m.user.image ?? undefined,
          })),
          memberCount: members.length,
          chartCount: charts.length,
          lastActivity,
        };
      }),
  );

  return { teamCards };
};
