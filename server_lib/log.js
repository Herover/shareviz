/**
 *
 * @param {object} commonAttributes
 */
export const getLogger = (commonAttributes) => {
  return {
    log: function (/** @type {string} */ msg, /** @type {object} */ attributes) {
      console.log(
        JSON.stringify(
          { time: new Date().toISOString(), msg, ...commonAttributes, ...attributes },
          null,
          0,
        ),
      );
    },
    error: function (/** @type {string} */ msg, /** @type {object} */ attributes) {
      console.error(
        JSON.stringify(
          { time: new Date().toISOString(), msg, ...commonAttributes, ...attributes },
          null,
          1,
        ),
      );
    },
    getLogger: (/** @type {object} */ newCommonAttributes) =>
      getLogger({ ...commonAttributes, ...newCommonAttributes }),
  };
};
