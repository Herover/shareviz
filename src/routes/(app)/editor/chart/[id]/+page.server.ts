// SPDX-License-Identifier: MPL-2.0

import { db } from "$lib/../../server_lib/user.js";

export async function load({ locals, params }) {
  return {
    signedIn: typeof locals.session?.user == "object",
    chartRelations: await db.getChartRelations(params.id),
  };
}
