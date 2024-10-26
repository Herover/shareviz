import { json } from '@sveltejs/kit';
import { db } from "../../../../server_lib/user.js";

export async function GET({ locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }
  console.log("get it")
  const teams = await db.getUserTeams(user.id);
  console.log("OK")
  return json({ userId: user.id, username: user.name, teams }, { status: 200 });
}
