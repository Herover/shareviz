import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
  cookies.delete("x-token", { path: "/" });

  return json({}, { status: 200 });
}
