import * as sqlite from "./sqlite";

export interface User {
  id: string,
  username: string,
  password: string,
}

export interface NewUserArguments {
  username: string,
  password: string,
}
export interface GetUserArguments {
  username?: string,
  id?: string,
}

export const db = sqlite.init();
