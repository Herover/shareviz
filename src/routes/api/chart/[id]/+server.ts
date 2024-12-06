import { json } from "@sveltejs/kit";
import { db } from "../../../../../server_lib/user.js";

export async function GET({ params, locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (
    session == null ||
    typeof user == "undefined" ||
    typeof user.id != "string"
  ) {
    return json({ message: "invalid token" }, { status: 400 });
  }

  try {
    const charts = await db.getUserCharts(user.id, params.id);
    if (charts.length == 0) {
      throw new Error("chart not found");
    }
    return json({ chart: charts[0] });
  } catch (err) {
    console.error(err);
    return json({ message: "could not get chart" }, { status: 500 });
  }
}

export async function PUT({ params, request, locals }) {
  const session = await locals.auth();

  const user = session?.user;
  if (
    session == null ||
    typeof user == "undefined" ||
    typeof user.id != "string"
  ) {
    return json({ message: "invalid token" }, { status: 400 });
  }

  const { name } = await request.json();
  if (typeof name != "string") {
    return json({ message: "invalid name" }, { status: 400 });
  }

  try {
    // Check if user can access chart
    const charts = await db.getUserCharts(user.id, params.id);
    if (charts.length == 0) {
      throw new Error("chart not found");
    }

    await db.updateChart(params.id, name);
    return json({});
  } catch (err) {
    console.error(err);
    return json({ message: "could not update chart" }, { status: 500 });
  }
}
