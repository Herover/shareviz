import { json } from '@sveltejs/kit';
import { db } from '../../../../../../server_lib/sqlite';
import { ORGANIZATION_ROLES } from '$lib/consts';

export async function POST({ locals, params }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const isAdmin = (await db.getOrganizationUsers(params.id))
    .findIndex(e => e.usersOrganizations.userId == user.id && e.usersOrganizations.role == ORGANIZATION_ROLES.ADMIN) != -1;
  if (!isAdmin) {
    return json({ message: "unauthorized" }, { status: 403 });
  }

  const code = await db.addOrganizationInvite(params.id);

  return json({ message: "ok", code }, { status: 200 });
}
