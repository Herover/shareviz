// SPDX-License-Identifier: MPL-2.0

import { json, error } from "@sveltejs/kit";
import { connection } from "$lib/../../server_lib/sharedb";
import { db } from "../../../../../../server_lib/user.js";

export async function GET({ params, locals }) {
  const session = locals.session;

  const user = session?.user;
  if (session == null || typeof user == "undefined" || typeof user.id != "string") {
    return error(403);
  }

  const chartId = params.id;

  if (!(await db.userCanAccessChart(user.id, chartId))) {
    return error(403);
  }

  const chart = await db.getChartById(chartId);

  return new Promise((resolve) => {
    connection.fetchSnapshot("examples", chart.chartRef, null, (err, snapshot) => {
      if (err != null) resolve(json({ message: "404" }, { status: 404 }));
      else resolve(json({ chart: snapshot.data }));
    });
  });
}
