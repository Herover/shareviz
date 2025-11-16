// SPDX-License-Identifier: MPL-2.0

import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
  return {
    msg: url.searchParams.get("msg"),
    returnURL: url.searchParams.get("return_url"),
  };
};
