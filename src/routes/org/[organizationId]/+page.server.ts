import { json } from '@sveltejs/kit';
import { db } from '../../../../server_lib/sqlite.js';
import { ORGANIZATION_ROLES } from '$lib/consts.js';

export async function load({ locals, params }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const orgUsers = await db.getOrganizationUsers(params.organizationId);
  const userIsOrgAdmin = orgUsers
    .findIndex((e) => e.usersOrganizations.userId == user.id && e.usersOrganizations.role == ORGANIZATION_ROLES.ADMIN);

  return {
    orgUsers,
    userIsOrgAdmin,
  };
}
