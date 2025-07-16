// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "vitest";
import { migrate } from "./chartMigrate";
import { createLocalDoc } from "./chartStore";

test("0 lines", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      chart: {
        elements: [],
      },
      m: {
        v: 2,
      },
    },
    noStorage: true,
  });

  migrate(doc, 3);

  expect(doc.data).toEqual({
    chart: {
      elements: [],
    },
    m: {
      v: 3,
    },
  });
});

test("0 repeatSettings", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      chart: {
        elements: [
          {
            type: "line",
            d: {
              repeatSettings: {
                byKey: [],
              },
              style: {
                default: {},
                byKey: [],
              },
            },
          },
        ],
      },
      m: {
        v: 2,
      },
    },
    noStorage: true,
  });

  migrate(doc, 3);

  expect(doc.data).toEqual({
    chart: {
      elements: [
        {
          type: "line",
          d: {
            style: {
              default: {
                contextColor: "#000",
              },
              byKey: [],
            },
            repeatSettings: {
              byKey: [],
            },
          },
        },
      ],
    },
    m: {
      v: 3,
    },
  });
});

test("0 repeatSettings", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      chart: {
        elements: [
          {
            type: "line",
            d: {
              style: {
                default: {},
                byKey: [],
              },
              repeatSettings: {
                byKey: [],
              },
            },
          },
        ],
      },
      m: {
        v: 2,
      },
    },
    noStorage: true,
  });

  migrate(doc, 3);

  expect(doc.data).toEqual({
    chart: {
      elements: [
        {
          type: "line",
          d: {
            style: {
              default: {
                contextColor: "#000",
              },
              byKey: [],
            },
            repeatSettings: {
              byKey: [],
            },
          },
        },
      ],
    },
    m: {
      v: 3,
    },
  });
});

test("1 repeatSettings", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      chart: {
        elements: [
          {
            type: "line",
            d: {
              style: {
                default: {},
                byKey: [{}],
              },
              repeatSettings: {
                byKey: [
                  {
                    k: "1",
                    title: "2",
                  },
                ],
              },
            },
          },
        ],
      },
      m: {
        v: 2,
      },
    },
    noStorage: true,
  });

  migrate(doc, 3);

  expect(doc.data).toEqual({
    chart: {
      elements: [
        {
          type: "line",
          d: {
            style: {
              default: {
                contextColor: "#000",
              },
              byKey: [
                {
                  contextColor: "#000",
                },
              ],
            },
            repeatSettings: {
              byKey: [
                {
                  k: "1",
                  title: "2",
                  ownChart: true,
                  allCharts: false,
                },
              ],
            },
          },
        },
      ],
    },
    m: {
      v: 3,
    },
  });
});

test("2 charts 2 repeatSettings", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      chart: {
        elements: [
          {
            type: "line",
            d: {
              style: {
                default: {},
                byKey: [{}, {}],
              },
              repeatSettings: {
                byKey: [
                  {
                    k: "1",
                    title: "2",
                  },
                  {
                    k: "3",
                    title: "4",
                  },
                ],
              },
            },
          },
          {
            type: "line",
            d: {
              style: {
                default: {},
                byKey: [{}, {}],
              },
              repeatSettings: {
                byKey: [
                  {
                    k: "5",
                    title: "6",
                  },
                  {
                    k: "7",
                    title: "8",
                  },
                ],
              },
            },
          },
        ],
      },
      m: {
        v: 2,
      },
    },
    noStorage: true,
  });

  migrate(doc, 3);

  expect(doc.data).toEqual({
    chart: {
      elements: [
        {
          type: "line",
          d: {
            style: {
              default: {
                contextColor: "#000",
              },
              byKey: [
                {
                  contextColor: "#000",
                },
                {
                  contextColor: "#000",
                },
              ],
            },
            repeatSettings: {
              byKey: [
                {
                  k: "1",
                  title: "2",
                  ownChart: true,
                  allCharts: false,
                },
                {
                  k: "3",
                  title: "4",
                  ownChart: true,
                  allCharts: false,
                },
              ],
            },
          },
        },
        {
          type: "line",
          d: {
            style: {
              default: {
                contextColor: "#000",
              },
              byKey: [
                {
                  contextColor: "#000",
                },
                {
                  contextColor: "#000",
                },
              ],
            },
            repeatSettings: {
              byKey: [
                {
                  k: "5",
                  title: "6",
                  ownChart: true,
                  allCharts: false,
                },
                {
                  k: "7",
                  title: "8",
                  ownChart: true,
                  allCharts: false,
                },
              ],
            },
          },
        },
      ],
    },
    m: {
      v: 3,
    },
  });
});
