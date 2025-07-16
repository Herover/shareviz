// SPDX-License-Identifier: MPL-2.0

import { db } from "$lib/../../server_lib/sqlite";

export async function load({ url, locals }) {
  const session = await locals.auth();

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
        console.log((error as Error).message);
      }
    }
  }
  return {
    organizationName: null,
  };
}
