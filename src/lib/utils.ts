enum Divide {
  None = 1,
  Thousands = 1000,
  Millions = 1000000,
}

export const formatNumber = (val: number, divide = Divide.None, thousandsDelim = ",", fractionDelim = ".", decimals = 1) => {
  const str = "" + val / divide;

  let res = "";
  const [wholes, fraction] = str.split(".");
  for (let i = wholes.length - 1; i >= 0; i--) {
    if (res.length > 0 && (wholes.length - i - 1) % 3 == 0) {
      res = thousandsDelim + res;
    }
    res = wholes[i] + res;
  }

  if (typeof fraction != "undefined" && fraction.length > 0 && decimals > 0) {
    const fractionNum = Number.parseFloat("0." + fraction);
    const d = Math.pow(10, decimals);
    res += fractionDelim + (("" + (Math.round(fractionNum * d)) / d).split(".")[1] ?? "").padEnd(decimals, "0");
  }

  /* if (fraction) {
    res = res + fractionDelim + fraction;
  } */

  // switch (divide) {
  //   case Divide.Thousands:
  //     res += "tus"
  //     break;

  //   case Divide.Millions:
  //     res += " mio."
  //     break;

  //   default:
  //     break;
  // }

  return res;
}
export const group = <T, U>(
  key: string,
  d: T[],
  f: (key: string, group: T[], i: number) => U = (k, d) => d as U,
): U[] => {
  const groups = (orDefault(d, [])).reduce(
    (acc, line: any) => {
      const usedKey = orDefault(line[key], key);
      if (typeof acc[usedKey] != "undefined") {
        acc[usedKey].push(line);
      } else {
        acc[usedKey] = [line];
      }
      return acc;
    },
    {} as { [key: string]: T[] },
  );

  return Object.keys(groups).map((k, i) => f(k, groups[k], i));
};

export enum valueKinds {
  NUMBER = "number",
  TEXT = "text",
  DATE = "date",
}
export const valueParsers: { [name: string]: { fn: (s: string) => any, type: valueKinds } } = {
  number: {
    fn: (d: string) => Number.parseFloat(d),
    type: valueKinds.NUMBER,
  },
  text: {
    fn: (d: string) => d,
    type: valueKinds.TEXT,
  },
  ISODate: {
    fn: (d: string) => {
      const parts = d.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (parts && parts.length == 4) {
        return new Date(`${parts[1]}-${parts[2]}-${parts[3]}T00:00:00+00:00`);
      }
      return null;
    },
    type: valueKinds.DATE,
  },
  yyyyMmm: {
    fn: (d: string) => {
      const parts = d.match(/(\d{4})M(\d{2})/);
      if (parts && parts.length == 3) {
        return new Date(`${parts[1]}-${parts[2]}-01T00:00:00+00:00`);
      }
      return null;
    },
    type: valueKinds.DATE,
  },
};

export const orDefault = <T>(n: T | undefined, def: T): T => {
  if (typeof n == "undefined" || Number.isNaN(n)) {
    return def;
   }
   return n;
};
export const orNumber = (n: number | undefined, def = 0) => orDefault(n, def);

// Used to place un-ordered items last
export const negativeOneToInf = (n: number) => n == -1 ? Number.POSITIVE_INFINITY : n;
