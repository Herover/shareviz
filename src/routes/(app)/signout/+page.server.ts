// SPDX-License-Identifier: MPL-2.0

import { redirect } from "@sveltejs/kit";
import { SESSION_COOKIE_KEY } from "../../../../server_lib/auth";
import type { Actions } from "./$types";
export const actions: Actions = {
  default: ({ cookies }) => {
    cookies.delete(SESSION_COOKIE_KEY, { path: "/" });

    return redirect(303, "/");
  },
};
