import { db } from "$lib/../../server_lib/sqlite.js";
import { redirect } from "@sveltejs/kit";
// import type { PageServerLoad } from "./$types.js";

// export const load: PageServerLoad = async ({ locals }) => {
export async function load({ locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    redirect(302, "/");
  }

  const accounts = await db.getUserAccounts(user.id);

  return { accounts };
}
