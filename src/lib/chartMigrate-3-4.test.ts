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
        v: 3,
      },
    },
    noStorage: true,
  });

  migrate(doc, 4);

  expect(doc.data).toEqual({
    chart: {
      elements: [],
    },
    m: {
      v: 4,
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
              x: {
                axis: {
                  major: {
                    auto: {
                      from: 1,
                    },
                  },
                  minor: {
                    auto: {
                      from: 1,
                    },
                  },
                },
              },
              y: {
                axis: {
                  major: {
                    auto: {
                      from: 1,
                    },
                  },
                  minor: {
                    auto: {
                      from: 1,
                    },
                  },
                },
              },
            },
          },
        ],
      },
      m: {
        v: 3,
      },
    },
    noStorage: true,
  });

  migrate(doc, 4);

  expect(doc.data).toEqual({
    chart: {
      elements: [
        {
          type: "line",
          d: {
            x: {
              axis: {
                major: {
                  auto: {
                    from: "1",
                  },
                },
                minor: {
                  auto: {
                    from: "1",
                  },
                },
              },
            },
            y: {
              axis: {
                major: {
                  auto: {
                    from: "1",
                  },
                },
                minor: {
                  auto: {
                    from: "1",
                  },
                },
              },
            },
          },
        },
      ],
    },
    m: {
      v: 4,
    },
  });
});

test("hBar", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      chart: {
        elements: [
          {
            type: "hBar",
            d: {
              axis: {
                major: {
                  auto: {
                    from: 1,
                  },
                },
                minor: {
                  auto: {
                    from: 1,
                  },
                },
              },
            },
          },
        ],
      },
      m: {
        v: 3,
      },
    },
    noStorage: true,
  });

  migrate(doc, 4);

  expect(doc.data).toEqual({
    chart: {
      elements: [
        {
          type: "hBar",
          d: {
            axis: {
              major: {
                auto: {
                  from: "1",
                },
              },
              minor: {
                auto: {
                  from: "1",
                },
              },
            },
          },
        },
      ],
    },
    m: {
      v: 4,
    },
  });
});
