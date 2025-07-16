// SPDX-License-Identifier: MPL-2.0

import { db } from "$lib/../../server_lib/sqlite.js";

export async function load({ params, parent }) {
  const data = await parent();
  const invites = data.userIsOrgAdmin ? await db.getOrganizationInvites(params.organizationId) : [];

  return { invites };
}
