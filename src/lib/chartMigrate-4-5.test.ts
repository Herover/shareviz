// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "vitest";
import { migrate } from "./chartMigrate";
import { createLocalDoc } from "./chartStore";

test("0", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      chart: {
        elements: [],
      },
      m: {
        v: 4,
      },
    },
    noStorage: true,
  });

  migrate(doc, 5);

  expect(doc.data).toEqual({
    chart: {
      elements: [],
    },
    m: {
      v: 5,
    },
  });
});

test("line", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      chart: {
        elements: [
          {
            type: "line",
            d: {
              style: {
                default: {
                  color: "1",
                  contextColor: "2",
                  label: {
                    color: "3",
                  },
                },
                byKey: [
                  {
                    color: "4",
                    contextColor: "5",
                    label: {
                      color: "6",
                    },
                  },
                  {
                    color: "7",
                    label: {
                      color: "9",
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      m: {
        v: 4,
      },
    },
    noStorage: true,
  });

  migrate(doc, 5);

  expect(doc.data).toEqual({
    chart: {
      elements: [
        {
          type: "line",
          d: {
            style: {
              default: {
                color: {
                  light: {
                    c: "1",
                    v: "1",
                  },
                },
                contextColor: {
                  light: {
                    c: "2",
                    v: "2",
                  },
                },
                label: {
                  color: {
                    light: {
                      c: "3",
                      v: "3",
                    },
                  },
                },
              },
              byKey: [
                {
                  color: {
                    light: {
                      c: "4",
                      v: "4",
                    },
                  },
                  contextColor: {
                    light: {
                      c: "5",
                      v: "5",
                    },
                  },
                  label: {
                    color: {
                      light: {
                        c: "6",
                        v: "6",
                      },
                    },
                  },
                },
                {
                  color: {
                    light: {
                      c: "7",
                      v: "7",
                    },
                  },
                  label: {
                    color: {
                      light: {
                        c: "9",
                        v: "9",
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
    m: {
      v: 5,
    },
  });
});

test("hbar", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      chart: {
        elements: [
          {
            type: "hBar",
            d: {
              colors: {
                default: "1",
                byKey: [
                  {
                    c: "2",
                  },
                  {
                    c: "3",
                  },
                ],
              },
            },
          },
        ],
      },
      m: {
        v: 4,
      },
    },
    noStorage: true,
  });

  migrate(doc, 5);

  expect(doc.data).toEqual({
    chart: {
      elements: [
        {
          type: "hBar",
          d: {
            colors: {
              default: {
                light: {
                  c: "1",
                  v: "1",
                },
              },
              byKey: [
                {
                  c: { light: { c: "2", v: "2" } },
                },
                {
                  c: { light: { c: "3", v: "3" } },
                },
              ],
            },
          },
        },
      ],
    },
    m: {
      v: 5,
    },
  });
});

test("range", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      chart: {
        elements: [
          {
            type: "range",
            d: {
              rangeCategoryKeys: [{ color: "1" }, { color: "2" }],
            },
          },
        ],
      },
      m: {
        v: 4,
      },
    },
    noStorage: true,
  });

  migrate(doc, 5);

  expect(doc.data).toEqual({
    chart: {
      elements: [
        {
          type: "range",
          d: {
            rangeCategoryKeys: [
              { color: { light: { c: "1", v: "1" } } },
              { color: { light: { c: "2", v: "2" } } },
            ],
          },
        },
      ],
    },
    m: {
      v: 5,
    },
  });
});
