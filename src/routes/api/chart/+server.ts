import { json } from '@sveltejs/kit';
import { db } from "../../../../server_lib/user.js";

export async function GET({ locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }
  const charts = await db.getUserCharts(user.id);
  return json({ charts }, { status: 200 });
  // return json({  }, { status: 200 });
}
