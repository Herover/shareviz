import { json } from '@sveltejs/kit';
import { db } from "$lib/server/user.js";

export async function POST({ request }) {
  const { username, password } = await request.json();

  if (typeof password != "string" || typeof password != "string") {
    return json({ message: "invalid parameter" }, { status: 400 });
  }

  const userId = await db.newUser({ username, password });

  return json({ userId }, { status: 200 });
}
