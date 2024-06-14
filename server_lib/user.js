import * as sqlite from "./sqlite.js";

/**
 * @typedef User
 * @prop {string} id
 * @prop {string} username
 * @prop {string} password
 */

export const db = sqlite.init();
