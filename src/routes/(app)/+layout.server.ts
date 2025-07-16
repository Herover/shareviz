// SPDX-License-Identifier: MPL-2.0

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.auth();

  return {
    session,
  };
};
