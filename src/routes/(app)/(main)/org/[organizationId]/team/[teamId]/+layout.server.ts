// SPDX-License-Identifier: MPL-2.0

import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, params, parent }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    redirect(302, "/");
  }

  const parentData = await parent();
  const team = parentData.teams.find((e) => e.teams.id == params.teamId);

  return {
    team,
  };
}
