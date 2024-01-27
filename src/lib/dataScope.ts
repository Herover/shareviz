import equal from "fast-deep-equal";
import { derived, type Writable } from "svelte/store";

export const createScope = <T>(db: Writable<any>, scope: string) => {
  const path = scope.split(".");
  let val: null | T = null;
  return derived<any, T | null>(db, ($db, set, update) => {
    const newScopedVal = path.reduce<T>((acc, part) => acc?.[part], $db);
    if (val == null) {
      val = newScopedVal;
      update(() => newScopedVal);
    } else if (!equal(val, newScopedVal)) {
      val = newScopedVal;
      update(() => newScopedVal);
    }
  });
};
