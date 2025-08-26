// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { db } from "$lib/../../server_lib/sqlite";

export async function POST({ request, locals, params }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const canAccess = await db.userCanAccessChart(user.id, params.id);
  if (!canAccess) {
    return json({ message: "chart not found" }, { status: 404 });
  }

  const { version } = await request.json();
  if (typeof version != "number") {
    return json({ message: "version" }, { status: 400 });
  }

  // TODO: check if version exists on chart

  const publicationId = await db.addPublication(params.id, version);

  return json({ publicationId });
}

export async function GET({ locals, params }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const canAccess = await db.userCanAccessChart(user.id, params.id);
  if (!canAccess) {
    return json({ message: "chart not found" }, { status: 404 });
  }

  const publications = await db.getChartPublications(params.id);

  return json({ publications });
}
