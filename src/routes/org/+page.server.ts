import { json } from '@sveltejs/kit';
import { db } from '../../../server_lib/sqlite.js';

export async function load({ locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const orgs = await db.getUserOrganizations(user.id);

  return {
    organizations: orgs,
  };
}
