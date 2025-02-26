import {
  AxisLocation,
  AxisOrientation,
  AxisRepeatMode,
  HBarTotalLabelStyle,
  LabelLocation,
  LabelStyleLine,
  LineMissingStyle,
  LineSymbol,
  type Chart,
  type Line,
} from "$lib/chart";
import ShareDB from "sharedb/lib/client";
import type { ShareDBConnection } from "./data.svelte";

export class ChartStore {
  #doc: ShareDB.Doc = $state(new ShareDB.Doc());
  #connection?: ShareDBConnection;
  #data?: Chart = $derived(this.#connection?.data?.chart);

  constructor(connection: ShareDBConnection) {
    this.#doc = connection.doc;
    this.#connection = connection;
  }

  get data(): Chart | undefined {
    return this.#data;
  }

  setConfigTitle(value: string) {
    this.#doc.submitOp(["chart", "title", { r: 0, i: value }]);
  }
  setConfigSubTitle(value: string) {
    this.#doc.submitOp(["chart", "subTitle", { r: 0, i: value }]);
  }
  setConfigHeight(value: number) {
    this.#doc.submitOp(["chart", "height", { r: 0, i: value }]);
  }
  setConfigWidth(value: number) {
    this.#doc.submitOp(["chart", "width", { r: 0, i: value }]);
  }
  setSourceTextLeft(value: string) {
    this.#doc.submitOp(["chart", "sourceTextLeft", { r: 0, i: value }]);
  }
  setSourceTextLeftLink(value: string) {
    this.#doc.submitOp(["chart", "sourceTextLeftLink", { r: 0, i: value }]);
  }
  setSourceTextRight(value: string) {
    this.#doc.submitOp(["chart", "sourceTextRight", { r: 0, i: value }]);
  }
  setSourceTextRightLink(value: string) {
    this.#doc.submitOp(["chart", "sourceTextRightLink", { r: 0, i: value }]);
  }
  setScaleFrom(scaleIndex: number, value: number) {
    this.#doc.submitOp(["chart", "scales", scaleIndex, "dataRange", 0, { r: 0, i: value }]);
  }
  setScaleTo(scaleIndex: number, value: number) {
    this.#doc.submitOp(["chart", "scales", scaleIndex, "dataRange", 1, { r: 0, i: value }]);
  }
  setColorScaleKey(scaleIndex: number, colorIndex: number, value: string) {
    this.#doc.submitOp([
      "chart",
      "scales",
      scaleIndex,
      "colors",
      "byKey",
      colorIndex,
      "k",
      { r: 0, i: value },
    ]);
  }
  setColorScaleColor(scaleIndex: number, colorIndex: number, value: string) {
    this.#doc.submitOp([
      "chart",
      "scales",
      scaleIndex,
      "colors",
      "byKey",
      colorIndex,
      "c",
      { r: 0, i: value },
    ]);
  }
  setColorScaleLegend(scaleIndex: number, colorIndex: number, value: string) {
    this.#doc.submitOp([
      "chart",
      "scales",
      scaleIndex,
      "colors",
      "byKey",
      colorIndex,
      "legend",
      { r: 0, i: value },
    ]);
  }
  addColorScaleColor(scaleIndex: number, colorIndex: number, k = "", c = "", legend = "") {
    this.#doc.submitOp([
      "chart",
      "scales",
      scaleIndex,
      "colors",
      "byKey",
      colorIndex,
      { i: { c, k, legend } },
    ]);
  }
  removeColorScaleColor(scaleIndex: number, colorIndex: number) {
    this.#doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", colorIndex, { r: 0 }]);
  }
  setColorScaleDefaultColor(scaleIndex: number, value: string) {
    this.#doc.submitOp(["chart", "scales", scaleIndex, "colors", "default", { r: 0, i: value }]);
  }
  moveColorUp(scaleIndex: number, colorIndex: number) {
    this.#doc.submitOp([
      "chart",
      "scales",
      scaleIndex,
      "colors",
      "byKey",
      [colorIndex - 1, { d: 0 }],
      [colorIndex, { p: 0 }],
    ]);
  }
  moveColorDown(scaleIndex: number, colorIndex: number) {
    this.#doc.submitOp([
      "chart",
      "scales",
      scaleIndex,
      "colors",
      "byKey",
      [colorIndex, { p: 0 }],
      [colorIndex + 1, { d: 0 }],
    ]);
  }
  removeChartElement(elementIndex: number) {
    this.#doc.submitOp(["chart", "elements", elementIndex, { r: 0 }]);
  }
  moveElementUp(elementIndex: number) {
    this.#doc.submitOp([
      "chart",
      "elements",
      [elementIndex - 1, { d: 0 }],
      [elementIndex, { p: 0 }],
    ]);
  }
  moveElementDown(elementIndex: number) {
    this.#doc.submitOp([
      "chart",
      "elements",
      [elementIndex, { p: 0 }],
      [elementIndex + 1, { d: 0 }],
    ]);
  }

  addBarChart(elementIndex: number) {
    this.#doc.submitOp([
      "chart",
      "elements",
      elementIndex,
      {
        i: {
          type: "hBar",
          id: crypto.randomUUID(),
          d: {
            dataSet: "",
            categories: "",
            subCategories: "",
            stackSubCategories: true,
            portionSubCategories: false,
            value: "",
            labelWidth: 170,
            repeat: "",
            scale: {
              name: "x",
              dataKey: "antal",
              type: "linear",
              dataRange: [0, 1],
            },
            colors: {
              default: "#888888",
              byKey: [],
            },
            rectLabels: false,
            totalLabels: HBarTotalLabelStyle.NONE,
            axis: {
              location: AxisLocation.START,
              labelSpace: 0,
              orientation: AxisOrientation.HORIZONTAL,
              repeat: AxisRepeatMode.FIRST,
              major: {
                grid: true,
                enabled: true,
                tickSize: 8,
                tickWidth: 1,
                color: "#aaaaaa",
                labelDivide: 1000000,
                labelThousands: ",",
                afterLabel: " mio.",
                auto: {
                  from: 0,
                  each: 5000000,
                  labels: true,
                },
                ticks: [],
              },
              minor: {
                grid: false,
                enabled: false,
                tickSize: 8,
                tickWidth: 1,
                color: "#aaaaaa",
                labelDivide: 1000000,
                labelThousands: ",",
                afterLabel: " mio.",
                auto: {
                  from: 0,
                  each: 1000000,
                  labels: false,
                },
                ticks: [],
              },
            },
          },
        },
      },
    ]);
  }
  addLineChart(elementIndex: number) {
    this.#doc.submitOp([
      "chart",
      "elements",
      elementIndex,
      {
        i: {
          type: "line",
          id: crypto.randomUUID(),
          d: {
            dataSet: "",
            x: {
              key: "",
              scale: "lineX",
              axis: {
                location: AxisLocation.END,
                labelSpace: 8,
                orientation: AxisOrientation.HORIZONTAL,
                repeat: AxisRepeatMode.FIRST,
                major: {
                  grid: false,
                  enabled: true,
                  tickSize: 8,
                  tickWidth: 1,
                  color: "#aaaaaa",
                  labelDivide: 1,
                  labelThousands: "",
                  afterLabel: "",
                  auto: {
                    from: 0,
                    each: 10,
                    labels: true,
                  },
                  ticks: [],
                },
                minor: {
                  grid: false,
                  enabled: true,
                  tickSize: 4,
                  tickWidth: 1,
                  color: "#aaaaaa",
                  labelDivide: 1,
                  labelThousands: "",
                  afterLabel: "",
                  auto: {
                    from: 0,
                    each: 1,
                    labels: false,
                  },
                  ticks: [],
                },
              },
            },
            y: {
              key: "",
              scale: "lineY",
              axis: {
                location: AxisLocation.END,
                labelSpace: 8,
                orientation: AxisOrientation.VERTICAL,
                repeat: AxisRepeatMode.FIRST,
                major: {
                  grid: true,
                  enabled: true,
                  tickSize: 8,
                  tickWidth: 1,
                  color: "#aaaaaa",
                  labelDivide: 1,
                  labelThousands: ",",
                  afterLabel: "",
                  auto: {
                    from: 0,
                    each: 10,
                    labels: true,
                  },
                  ticks: [],
                },
                minor: {
                  grid: false,
                  enabled: false,
                  tickSize: 8,
                  tickWidth: 1,
                  color: "#aaaaaa",
                  labelDivide: 1,
                  labelThousands: "",
                  afterLabel: "",
                  auto: {
                    from: 0,
                    each: 1,
                    labels: false,
                  },
                  ticks: [],
                },
              },
            },
            categories: "",
            fill: false,
            stack: false,
            heightRatio: 0.9,
            style: {
              default: {
                k: "",
                color: "#000",
                contextColor: "#000",
                width: 1,
                label: {
                  text: "",
                  location: LabelLocation.Right,
                  color: "#000",
                  x: 0,
                  y: 0,
                  rx: 0,
                  ry: 0,
                  line: LabelStyleLine.None,
                },
                symbols: LineSymbol.NONE,
                missingStyle: LineMissingStyle.DASHED,
              },
              byKey: [],
            },
            repeat: "",
            repeatColumns: 4,
            repeatSettings: {
              default: {
                k: "",
                title: "",
                allCharts: false,
                ownChart: false,
              },
              byKey: [],
            },
          } as Line,
        },
      },
    ]);
  }
}
