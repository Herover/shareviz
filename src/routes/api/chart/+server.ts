import { json } from "@sveltejs/kit";
import * as json1 from "ot-json1";
import { db } from ".$lib/../../server_lib/user.js";
import { connection } from "$lib/../../server_lib/sharedb";
import { defDoc } from "$lib/initialDoc.js";

export async function GET({ locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }
  const charts = await db.getUserCharts(user.id);
  return json({ charts }, { status: 200 });
  // return json({  }, { status: 200 });
}

export async function POST({ request, locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const { teamId, folderId }: { teamId?: string; folderId?: string } = await request.json();

  const ref = crypto.randomUUID();
  const doc = connection.get("examples", ref);
  await new Promise<void>((resolve, reject) =>
    doc.create(defDoc, json1.type.uri, (err) => {
      if (typeof err != "undefined") reject(err);
      resolve();
    }),
  );

  const id = await db.addChart(ref, "Chart name", user.id, teamId, folderId);
  return json({ message: "ok", id, ref }, { status: 200 });
}
