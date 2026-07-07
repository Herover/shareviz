// SPDX-License-Identifier: MPL-2.0

import { goto, invalidateAll } from "$app/navigation";
import { resolve } from "$app/paths";
import { addTeam } from "$lib/api";
import { notifications } from "$lib/notificationStore";

/**
 * Creates a new team in the organization and navigates to its settings page.
 * Errors are reported through the notification area.
 */
export const addNewTeam = async (organizationId: string) => {
  try {
    const newTeamId = await addTeam("New Team", organizationId);
    await goto(
      resolve("/(app)/(main)/org/[organizationId]/team/[teamId]", {
        organizationId,
        teamId: newTeamId,
      }),
    );
    invalidateAll();
  } catch (err) {
    notifications.addError((err as Error).message);
  }
};
