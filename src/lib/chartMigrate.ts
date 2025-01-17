/**
 * Applies operations requred to upgrade a chart specification.
 *
 * Should be able to handle migrating multiple versions, but not downgrade.
 */
export const migrate = (doc: any) => {
  if (typeof doc.data.m == "undefined") {
    console.log("migrate: initial meta");

    doc.submitOp([
      [
        "m",
        {
          i: {
            v: 0,
          },
        },
      ],
      [
        "meta",
        {
          r: 0,
        },
      ],
    ]);
  }
};
