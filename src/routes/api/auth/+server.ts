import { json } from '@sveltejs/kit';
import { db } from "$lib/server/user.js";

export async function POST({ request, cookies }) {
  const { username, password } = await request.json();

  if (typeof username != "string") {
    cookies.set("x-token", "", { path: "/" });
    return json({ message: "unauthorized" }, { status: 403 });
  }

  const user = await db.getUser({ username });
  if (typeof user != "object" || typeof password != "string" || typeof user.password != "string" || user.password !== password) {
    cookies.set("x-token", "", { path: "/" });
    return json({ message: "unauthorized" }, { status: 403 });
  }
  const userId = user.id;
  const token = user.id; // TODO

  cookies.set("x-token", token, { path: "/" });

  return json({ userId, username }, { status: 200 });
}
