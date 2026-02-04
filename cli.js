/* eslint-disable no-console */
import { randomBytes } from "node:crypto";

import { hash } from "@node-rs/argon2";

import { db } from "./server_lib/sqlite.js";

const main = async () => {
  const command = process.argv[2];
  console.log(process.arg);

  if (command == "pw-reset") {
    const email = process.argv[3];
    const password = process.argv[4];

    const salt = randomBytes(16);
    const pwHash = await hash(password, { salt: salt });
    const r = await db.setUserPasswordLogin(email, pwHash, salt);
    console.log(r ? "OK" : "Failed");
  } else {
    console.log("Unknown command");
  }
};
main();
