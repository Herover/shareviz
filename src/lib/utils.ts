enum Divide {
  None = 1,
  Thousands = 1000,
  Millions = 1000000,
}

export const formatNumber = (val: number, divide = Divide.None, thousandsDelim = ",", fractionDelim = ".") => {
  const str = "" + val / divide;

  let res = "";
  const [wholes, fraction] = str.split(".");
  for (let i = wholes.length - 1; i >= 0; i--) {
    if (res.length > 0 && (wholes.length - i - 1) % 3 == 0) {
      res = thousandsDelim + res;
    }
    res = wholes[i] + res;
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
export const group = <T extends any, U>(
  key: string,
  d: T[],
  f: (key: string, group: T[]) => U = (k, d) => d as U,
): U[] => {
  const groups = (d || []).reduce(
    (acc, line: any) => {
      const usedKey = line[key] || key
      if (acc[usedKey]) {
        acc[usedKey].push(line);
      } else {
        acc[usedKey] = [line];
      }
      return acc;
    },
    {} as { [key: string]: T[] },
  );

  return Object.keys(groups).map((k) => f(k, groups[k]));
};

export enum valueKinds {
  NUMBER = "number",
  TEXT = "text",
  DATE = "date",
}
export const valueParsers: { [name: string]: { fn: (string) => any, type: valueKinds } } = {
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
      const parts = d.match(/(\d{4})\-(\d{2})\-(\d{2})/);
      if (parts && parts.length == 4) {
        return new Date(`${parts[1]}-${parts[2]}-${parts[3]}T00:00:00+00:00`);
      }
      return null;
    },
    type: valueKinds.DATE,
  },
  yyyyMmm: {
    fn: (d: string) => {
      const parts = d.match(/(\d{4})\M(\d{2})/);
      if (parts && parts.length == 3) {
        return new Date(`${parts[1]}-${parts[2]}-01T00:00:00+00:00`);
      }
      return null;
    },
    type: valueKinds.DATE,
  },
};
