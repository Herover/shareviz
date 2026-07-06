// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { db } from "$lib/../../server_lib/user.js";
import { getLogger } from "../../../../lib/log";

const logger = getLogger();

export async function GET({ params, locals }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  try {
    // A chart is accessible through one of the user's teams or as a personal chart
    let charts = await db.getUserTeamCharts(user.id, params.id);
    if (charts.length == 0) {
      charts = await db.getUserCharts(user.id, params.id);
    }
    if (charts.length == 0) {
      return json({ message: "chart not found" }, { status: 404 });
    }
    return json({ chart: charts[0] });
  } catch (err) {
    logger.error("unable to find user chart", err);
    return json({ message: "could not get chart" }, { status: 500 });
  }
}

export async function PUT({ params, request, locals }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const { name, folderId }: { name?: string; folderId?: string } = await request.json();

  try {
    // Check if user can access chart, through a team or as a personal chart
    let charts = await db.getUserTeamCharts(user.id, params.id);
    if (charts.length == 0) {
      charts = await db.getUserCharts(user.id, params.id);
    }
    if (charts.length == 0) {
      return json({ message: "chart not found" }, { status: 404 });
    }

    await db.updateChart(params.id, { name, folderId });
    return json({});
  } catch (err) {
    logger.error("unable to update chart", err);
    return json({ message: "could not update chart" }, { status: 500 });
  }
}
