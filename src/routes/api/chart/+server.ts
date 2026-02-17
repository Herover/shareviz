// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import * as json1 from "ot-json1";
import { db } from "$lib/../../server_lib/user.js";
import { connection } from "$lib/../../server_lib/sharedb";
import { defDoc, formatVersion } from "$lib/initialDoc.js";
import type { Root } from "$lib/chart.js";
import { getLogger } from "../../../lib/log";

const logger = getLogger();

export async function GET({ locals }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }
  const charts = await db.getUserCharts(user.id);
  return json({ charts }, { status: 200 });
}

export async function POST({ request, locals }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const {
    teamId,
    folderId,
    data,
    isUserChart,
  }: { teamId?: string; folderId?: string; data?: string; isUserChart?: boolean } =
    await request.json();

  let docData: Root;
  try {
    docData = typeof data == "string" ? (JSON.parse(data) as Root) : defDoc;
  } catch (e) {
    logger.error("unable to parse data", e instanceof Error ? e.message : e);
    return json({ message: "unable to parse document" }, { status: 400 });
  }

  // TODO: optionally fully verify docData structure
  if (!docData || !docData.m || typeof docData.m.v != "number") {
    return json({ message: "unknown document format" }, { status: 400 });
  } else if (docData.m.v < formatVersion) {
    return json({ message: "format is too old" }, { status: 400 });
  } else if (docData.m.v > formatVersion) {
    return json({ message: "more recent than we support" }, { status: 400 });
  }

  const ref = crypto.randomUUID();
  const doc = connection.get("examples", ref);
  await new Promise<void>((resolve, reject) =>
    doc.create(docData, json1.type.uri, (err) => {
      if (typeof err != "undefined") reject(err);
      else resolve();
    }),
  );

  const id = await db.addChart(ref, "Chart name", user.id, teamId, folderId);

  if (isUserChart) {
    await db.addUserChart(user.id, id);
  }

  return json({ message: "ok", id, ref }, { status: 200 });
}
