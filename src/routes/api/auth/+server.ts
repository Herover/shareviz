import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
  const { username, password } = await request.json();

  const userid = username; // TODO

  const token = userid;

  cookies.set("x-token", token, { path: "/" });

  return json({ token }, { status: 201 });
}
