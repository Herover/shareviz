import { json } from '@sveltejs/kit';
import { db } from "$lib/server/user.js";

export async function POST({ request, cookies }) {
  const { username, password } = await request.json();

  const user = await db.getUser({ username });
  if (typeof password != "string" || typeof user.password != "string" || user.password !== password) {
    cookies.set("x-token", "", { path: "/" });
    return json({ message: "unauthorized" }, { status: 403 });
  }
  const userId = username;
  const name = username;
  const token = userId;

  cookies.set("x-token", token, { path: "/" });

  return json({ userId, name }, { status: 200 });
}
