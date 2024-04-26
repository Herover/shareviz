import equal from "fast-deep-equal";
import { derived, type Readable } from "svelte/store";

export const createScope = <T>(db: Readable<any>, scope: string | Array<string | number>) => {
  const path = typeof scope == "string" ? scope.split(".") : scope;
  let val: T;
  return {
    path: typeof db["path"] == "undefined" ? path : db["path"].concat(path),
    ...derived<any, T>(db, ($db, set, update) => {
      // @ts-ignore
      const newScopedVal = path.reduce<T>((acc, part) => acc?.[part], $db);
      if (val == null) {
        // @ts-ignore
        val = newScopedVal;
        // @ts-ignore
        update(() => newScopedVal);
      } else if (!equal(val, newScopedVal)) {
        // @ts-ignore
        val = newScopedVal;
        // @ts-ignore
        update(() => newScopedVal);
      }
    }),
  } as { path: string[] } & ReturnType<typeof derived<any, T>>;
};
