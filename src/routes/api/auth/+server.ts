import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
  const { username, password } = await request.json();

  // TODO
  if (password !== "123") {
    cookies.set("x-token", "", { path: "/" });
    return json({ message: "unauthorized" }, { status: 403 });
  }
  const userId = username;
  const name = username;
  const token = userId;

  cookies.set("x-token", token, { path: "/" });

  return json({ userId , name }, { status: 200 });
}
