import { json } from '@sveltejs/kit';
import { db } from "../../../../server_lib/user.js";

export async function GET({ cookies }) {
  const id = cookies.get("x-token"); // TODO

  if (typeof id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const user = await db.getUser({ id });
  const charts = await db.getUserCharts(user.id);

  return json({ charts }, { status: 200 });
}
