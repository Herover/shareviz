import { expect, test } from "vitest";
import { migrate } from "./chartMigrate";
import { createLocalDoc } from "./chartStore";

test("0 datasets", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: {
        sets: [],
      },
      m: {
        v: 1,
      },
    },
    noStorage: true,
  });

  migrate(doc, 2);

  expect(doc.data).toEqual({
    data: {
      sets: [],
    },
    m: {
      v: 2,
    },
  });
});

test("1 dataset with 1 column", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: {
        sets: [
          {
            rows: [{}],
          },
        ],
      },
      m: {
        v: 1,
      },
    },
    noStorage: true,
  });

  migrate(doc, 2);

  expect(doc.data).toEqual({
    data: {
      sets: [
        {
          rows: [{ dateFormat: "" }],
        },
      ],
    },
    m: {
      v: 2,
    },
  });
});

test("2 datasets with 2 columns", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: {
        sets: [
          {
            rows: [{}, {}],
          },
          {
            rows: [{}, {}],
          },
        ],
      },
      m: {
        v: 1,
      },
    },
    noStorage: true,
  });

  migrate(doc, 2);

  expect(doc.data).toEqual({
    data: {
      sets: [
        {
          rows: [{ dateFormat: "" }, { dateFormat: "" }],
        },
        {
          rows: [{ dateFormat: "" }, { dateFormat: "" }],
        },
      ],
    },
    m: {
      v: 2,
    },
  });
});

test("1 dataset with 1 column that is already migrated", () => {
  const doc = createLocalDoc("test", "1", {
    initial: {
      data: {
        sets: [
          {
            rows: [{ dateFormat: "YYYY" }],
          },
        ],
      },
      m: {
        v: 1,
      },
    },
    noStorage: true,
  });

  migrate(doc, 2);

  expect(doc.data).toEqual({
    data: {
      sets: [
        {
          rows: [{ dateFormat: "YYYY" }],
        },
      ],
    },
    m: {
      v: 2,
    },
  });
});
