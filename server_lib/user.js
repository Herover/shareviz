import * as sqlite from "./sqlite.js";

/**
 * @typedef User
 * @prop {string} id
 * @prop {string} username
 * @prop {string} password
 */
/**
 * @typedef Team
 * @prop {string} id
 * @prop {string} name
 */
/**
 * @typedef ChartInfo
 * @prop {string} id
 * @prop {string} name
 * @prop {string} chartId
 * @prop {string | null} teamId
 * @prop {number | null} relationType
 */

export const db = sqlite.init();
