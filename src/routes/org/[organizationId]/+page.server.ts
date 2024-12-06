import type { PageData } from "./$types.js";
import { db } from "../../../../server_lib/sqlite.js";

export async function load({ params, parent }) {
  const data: PageData = await parent();
  const invites = data.userIsOrgAdmin ? await db.getOrganizationInvites(params.organizationId) : [];

  return { invites };
}
