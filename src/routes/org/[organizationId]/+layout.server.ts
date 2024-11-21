import { redirect } from '@sveltejs/kit';
import { db } from '../../../../server_lib/sqlite.js';
import { ORGANIZATION_ROLES } from '$lib/consts.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, params }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    redirect(302, "/");
  }

  const orgUsers = (await db.getOrganizationUsers(params.organizationId))
    .map(user => ({
      name: user.user.name,
      id: user.user.id,
      image: user.user.image,
      role: user.usersOrganizations.role,
    }));
  const userIsOrgAdmin = orgUsers
    .findIndex((e) => e.id == user.id && e.role == ORGANIZATION_ROLES.ADMIN) != -1;

  return {
    orgUsers,
    userIsOrgAdmin,
  };
}
