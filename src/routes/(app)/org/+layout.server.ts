import { redirect } from "@sveltejs/kit";
import { db } from "$lib/../../server_lib/sqlite.js";

export async function load({ locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    redirect(302, "/");
  }

  const orgs = await db.getUserOrganizations(user.id);

  return {
    organizations: orgs,
  };
}
