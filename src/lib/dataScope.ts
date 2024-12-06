// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck no good way to type the db argument
import equal from "fast-deep-equal";
import { derived, type Readable } from "svelte/store";

export const createScope = <T>(
  db: Readable<any>,
  scope: string | Array<string | number>,
) => {
  const path = typeof scope == "string" ? scope.split(".") : scope;
  let val: T;
  return {
    path: typeof db["path"] == "undefined" ? path : db["path"].concat(path),
    ...derived<any, T>(db, ($db, set, update) => {
      const newScopedVal = path.reduce<T>((acc, part) => acc?.[part], $db);
      if (val == null) {
        val = newScopedVal;
        update(() => newScopedVal);
      } else if (!equal(val, newScopedVal)) {
        val = newScopedVal;
        update(() => newScopedVal);
      }
    }),
  } as { path: string[] } & ReturnType<typeof derived<any, T>>;
};
