enum Divide {
  None = 1,
  Thousands = 1000,
  Millions = 1000000,
}

export const formatNumber = (val: number, thousandsDelim = ",", fractionDelim = ".", divide = Divide.Millions) => {
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

  switch (divide) {
    case Divide.Thousands:
      res += "tus"
      break;

    case Divide.Millions:
      res += " mio."
      break;

    default:
      break;
  }

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
