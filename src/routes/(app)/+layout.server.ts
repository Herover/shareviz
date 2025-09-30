// SPDX-License-Identifier: MPL-2.0

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = locals.session;

  return {
    session,
  };
};
