// SPDX-License-Identifier: MPL-2.0

import type { Root } from "./chart";

export const formatVersion = 6;

export const defDoc: Root = {
  m: {
    v: formatVersion,
  },
  data: { sets: [] },
  chart: {
    title: "TITLE GOES HERE",
    subTitle: "AND SUBTITLE GOES HERE",
    width: 390,
    height: 500,
    sourceTextLeft: "Source: <YOUR SOURCE>",
    sourceTextLeftLink: "",
    sourceTextRight: "YOUR NAME",
    sourceTextRightLink: "",
    chartType: "hBar",
    // TODO: should be created dynamically
    scales: [
      {
        name: "x",
        dataKey: "antal",
        type: "linear",
        dataRange: [0, 15000000],
      },
      {
        name: "color",
        dataKey: "",
        type: "categoriesColor",
        colors: {
          default: {
            light: {
              c: "#888888",
              v: "#888888",
            },
          },
          byKey: [
            {
              k: "2023",
              c: {
                light: {
                  c: "#aa2222",
                  v: "#aa2222",
                },
              },
              legend: "2023",
              x: 0,
              y: 0,
              rx: 0,
              ry: -32,
              line: "none",
            },
            {
              k: "2022",
              c: {
                light: {
                  c: "#ff8888",
                  v: "#ff8888",
                },
              },
              legend: "2022",
              x: 0,
              y: 0,
              rx: 0,
              ry: -32,
              line: "none",
            },
          ],
        },
      },
      {
        name: "lineX",
        dataKey: "tid",
        type: "linear",
        dataRange: [2010, 2023],
      },
      {
        name: "lineY",
        dataKey: "antal",
        type: "linear",
        dataRange: [0, 15000000],
      },
    ],
    elements: [],
  },
  style: {
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    titleSize: 2,
    titleBold: true,
    subTitleSize: 1.1,
    subTitleBold: true,
    sourceMargin: 8,
    bgColor: "#ffffff",
    textColor: "#000000",
  },
};
