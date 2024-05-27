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

export async function GET({ cookies }) {
  const id = cookies.get("x-token"); // TODO

  if (typeof id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const user = await db.getUser({ id });

  return json({ userId: user.id, username: user.username }, { status: 200 });
}
