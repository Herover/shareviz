// SPDX-License-Identifier: MPL-2.0

import { sampleCharts } from "$lib/sampleCharts";
import type { PageLoad } from "./$types";

export const ssr = true;

export const load: PageLoad = ({ url }) => {
  return {
    msg: url.searchParams.get("msg"),
    returnURL: url.searchParams.get("return_url"),
    sampleCharts,
  };
};
