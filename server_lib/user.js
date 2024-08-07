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
 * @typedef TeamChart
 * @prop {string} id
 * @prop {string} chart_id
 */

export const db = sqlite.init();
