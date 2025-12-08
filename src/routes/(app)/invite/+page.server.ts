// SPDX-License-Identifier: MPL-2.0

import { db } from "$lib/../../server_lib/sqlite";
import { getLogger } from "$lib/log.js";

const logger = getLogger();

export async function load({ url, locals }) {
  const session = locals.session;

  if (session?.user != null && session?.user?.id != null) {
    const code = url.searchParams.get("code");

    if (code != null) {
      try {
        const org = await db.getOrganizationInvite(code);
        const joinedOrgs = await db.getUserOrganizations(session.user.id);
        return {
          organizationName: org.organizations.name,
          alreadyJoined: joinedOrgs.some((e) => e.organizations.id == org.organizations.id),
        };
      } catch (error) {
        logger.error("unable to find invite", error);
      }
    }
  }
  return {
    organizationName: null,
  };
}
