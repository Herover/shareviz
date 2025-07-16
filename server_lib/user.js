// SPDX-License-Identifier: MPL-2.0

import * as sqlite from "./sqlite.js";
/**
 * @typedef ChartInfo
 * @prop {string} id
 * @prop {string} name
 * @prop {string} chartRef
 * @prop {string | null} teamId
 * @prop {number | null} relationType
 */
export const db = sqlite.db;
