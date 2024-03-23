export const formatNumber = (val: string | number, thousandsDelim = ",", fractionDelim = ".") => {
  if (typeof val == "number") {
    val = "" + val;
  }

  let res = "";
  const [wholes, fraction] = val.split(".");
  for (let i = wholes.length - 1; i >= 0; i--) {
    if (res.length > 0 && (wholes.length - i - 1) % 3 == 0) {
      res = thousandsDelim + res;
    }
    res = wholes[i] + res;
  }

  /* if (fraction) {
    res = res + fractionDelim + fraction;
  } */

  return res;
}
