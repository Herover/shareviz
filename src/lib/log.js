/**
 *
 * @param {object} commonAttributes
 */
export const getLogger = (commonAttributes = {}) => {
  return {
    log: function (/** @type {string} */ msg, /** @type {object} */ attributes = {}) {
      /* eslint-disable-next-line */
      console.log(
        JSON.stringify(
          { time: new Date().toISOString(), msg, ...commonAttributes, ...attributes },
          null,
          0,
        ),
      );
    },
    error: function (
      /** @type {string} */ msg,
      /** @type {any} */ attributes = {},
      /** @type {Error | any} */ error = undefined,
    ) {
      if (attributes instanceof Error) {
        error = attributes;
        attributes = {};
      }

      if (typeof attributes != "object") {
        attributes = {
          message: attributes,
        };
      }

      if (error instanceof Error) {
        attributes.name = error.name;
        attributes.message = error.message;
        attributes.stack = error.stack;
        attributes.cause = error.cause;
      }

      /* eslint-disable-next-line */
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
