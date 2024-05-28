import { writable } from 'svelte/store';

import ReconnectingWebSocket from 'reconnecting-websocket';
// @ts-expect-error missing types
import {json1} from 'sharedb-client-browser/dist/ot-json1-umd.cjs';
 // @ts-expect-error missing types
import sharedb from 'sharedb-client-browser/dist/sharedb-client-umd.cjs';
import { WebSocket } from 'ws';
import { createScope } from './dataScope';
import type { HBar, Line, Root, Set, Chart, Axis, AxisGrid, Style, LineStyleKey } from './chart';
import { notifications } from './notificationStore';
// import { type Doc } from "sharedb";
// import { type Connection, type LocalPresence, type Presence } from 'sharedb/lib/client';

interface PresenceData {
  selected: string
  color: string
}

export const db = function createDB() {
  let doc: any; // Doc;
  let connection: any;
  
  let presence: any; // Presence<PresenceData>;
  //let localPresence: any; // LocalPresence<PresenceData>;

  let connected = false;

  //let myColor = `hsl(${Math.random() * 360} 100% 50%)`;

  const { subscribe, set, update } = writable<{
    connected: boolean,
    doc: /* Doc */ Root | null,
    /** True if document was fetched but is undefined */
    missing: boolean,
    presences: unknown,
    presenceTargets: unknown,
  }>({ connected, doc: null, missing: false, presences: {}, presenceTargets: {} });

  return {
    subscribe, set, update,
    connect: () => {
      const socket = new ReconnectingWebSocket(`//${window.location.host}/sharedb?aaaa=bbbb`, ["ws"], {
        // ShareDB handles dropped messages, and buffering them while the socket
        // is closed has undefined behavior
        maxEnqueuedMessages: 0,
        WebSocket: WebSocket,
      });
      socket.addEventListener("error", e =>  console.warn(e.message, e))
      
      socket.addEventListener("open", () => update(d => {
        d.connected = connected = true;
        return d;
      }));

      socket.addEventListener("close", () => update(d => {
        d.connected = connected = false;
        return d;
      }));
        

      sharedb.types.register(json1.type);
      connection = new sharedb.Connection(socket);
    

      return () => socket.close();
    },
    load: (docId: string) => {
      // Create local Doc instance mapped to 'examples' collection document with id 'counter'
      doc = connection.get('examples', docId);
      doc.on("error", (e: Error) => notifications.addError(e.message))

      
      presence = connection.getPresence('x-' + docId);
      presence.subscribe((e: any) => console.log("presence subscribe callback", e));
      const presences: {[key: string]: PresenceData} = {};
      const presenceTargets: {[key: string]: string} = {};
      presence.on('receive', (presenceId: string, data: any) => {
        if (data === null) {
          delete presenceTargets[presences[presenceId].selected];
          delete presences[presenceId]
          update(d => {
            d.presences = presences;
            d.presenceTargets = presenceTargets;
            return d;
          });
        } else {
          if (typeof presences[presenceId] != "undefined" && typeof presenceTargets[presences[presenceId].selected] != "undefined") {
            delete presenceTargets[presences[presenceId].selected];
          }
          presences[presenceId] = { selected: data.selected, color: data.color };
          presenceTargets[data.selected] = presenceId;
          update(d => {
            d.presences = presences;
            d.presenceTargets = presenceTargets;
            return d;
          });
        }
      });
      presence.on("error", (e: any) => {
        console.log("presence error", e)
      })
      // localPresence = presence.create();
    
      const onData = (e?: Error) => {
        if (e && typeof e.message == "string") notifications.addError(e.message);
        console.log("doc", doc, doc.data)
        set({
          doc: doc.data,
          missing: typeof doc.data === "undefined",
          connected,
          presences,
          presenceTargets,
        });
      }
      // window.localPresence = localPresence
      // window.presence = presence
    
      // Get initial value of document and subscribe to changes
      doc.subscribe(onData);
      // When document changes (by this client or any other, or the server),
      // update the number on the page
      doc.on('op', onData);
    },
    create: () => {
      return new Promise<string>((resolve, reject) => {
        // TODO: id collision detection
        const docId = ("" + Math.random()).split(".")[1];
        doc = connection.get('examples', docId);
        doc.on("error", (e: Error) => console.warn("doc error", e));
        doc.create({
          meta: {
            publicRead: false,
            access: [],
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
                  default: "#888888",
                  byKey: [
                    { k: "2023", c: "#aa2222", legend: "2023" },
                    { k: "2022", c: "#ff8888", legend: "2022" },
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
        } as Root, json1.type.uri, (err: Error | undefined) => {
          if (err) reject(err);
          resolve(docId);
        });
      });
    },

    getRecent: (): Promise<any> => {
      return new Promise((resolve, reject) => {
        connection.createFetchQuery("examples", { $limit: 5 }, {}, (err: Error | undefined, results: any) => {
          if (err) reject(err);
          resolve(results);
        });
      });
    },

    chart: () => {
      const scoped = createScope<Chart>(db, ["doc", "chart",]);
      return {
        ...scoped,
        hBar: (elementIndex: number) => {
          const hbarScope = createScope<HBar>(scoped, ["elements", elementIndex, "d"]);

          return {
            ...hbarScope,
            setLabelWidth: (value: number) => doc.submitOp(["chart", "elements", elementIndex, "d", "labelWidth", { r: 0, i: value }]),
            setCategories: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "d", "categories", { r: 0, i: value }]),
            setSubCategories: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "d", "subCategories", { r: 0, i: value }]),
            setValue: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "d", "value", { r: 0, i: value }]),
            setRepeat: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "d", "repeat", { r: 0, i: value }]),
            setDataSet: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "d", "dataSet", { r: 0, i: value }]),
            axis: () => axis(hbarScope, ["axis"], doc),
          };
        },
        line: (elementIndex: number) => {
          const hbarScope = createScope<Line>(scoped, ["elements", elementIndex, "d"]);

          return {
            ...hbarScope,
            setDataSet: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "d", "dataSet", { r: 0, i: value }]),
            setXKey: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "d", "x", "key", { r: 0, i: value }]),
            setYKey: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "d", "y", "key", { r: 0, i: value }]),
            setCategoriesKey: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "d", "categories", { r: 0, i: value }]),
            setFill: (value: boolean) => doc.submitOp(["chart", "elements", elementIndex, "d", "fill", { r: 0, i: value }]),
            setStack: (value: boolean) => doc.submitOp(["chart", "elements", elementIndex, "d", "stack", { r: 0, i: value }]),
            xAxis: axis(hbarScope, ["x", "axis"], doc),
            yAxis: axis(hbarScope, ["y", "axis"], doc),
            defaultLineStyle: () => lineStyle(hbarScope, ["style", "default"], doc),
            lineStyle: (i: number) => lineStyle(hbarScope, ["style", "byKey", i], doc),
            addLineStyle: (i: number) => doc.submitOp(["chart", "elements", elementIndex, "d", "style", "byKey", i, {
              i: {
                k: "",
                color: "#000",
                width: 1,
                label: { text: "", location: "right", color: "#000" },
              },
            }]),
          };
        },
        setConfigTitle: (value: string) => doc.submitOp(["chart", "title", { r: 0, i: value }]),
        setConfigSubTitle: (value: string) => doc.submitOp(["chart", "subTitle", { r: 0, i: value }]),
        setConfigHeight: (value: number) => doc.submitOp(["chart", "height", { r: 0, i: value }]),
        setConfigWidth: (value: number) => doc.submitOp(["chart", "width", { r: 0, i: value }]),
        setSourceTextLeft: (value: string) => doc.submitOp(["chart", "sourceTextLeft", { r: 0, i: value }]),
        setSourceTextLeftLink: (value: string) => doc.submitOp(["chart", "sourceTextLeftLink", { r: 0, i: value }]),
        setSourceTextRight: (value: string) => doc.submitOp(["chart", "sourceTextRight", { r: 0, i: value }]),
        setSourceTextLeftRight: (value: string) => doc.submitOp(["chart", "sourceTextLeftRight", { r: 0, i: value }]),
        setScaleFrom: (scaleIndex: number, value: number) => doc.submitOp(["chart", "scales", scaleIndex, "dataRange", 0, { r: 0, i: value }]),
        setScaleTo: (scaleIndex: number, value: number) => doc.submitOp(["chart", "scales", scaleIndex, "dataRange", 1, { r: 0, i: value }]),
        setColorScaleKey: (scaleIndex: number, colorIndex: number, value: string) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", colorIndex, "k", { r: 0, i: value }]),
        setColorScaleColor: (scaleIndex: number, colorIndex: number, value: string) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", colorIndex, "c", { r: 0, i: value }]),
        setColorScaleLegend: (scaleIndex: number, colorIndex: number, value: string) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", colorIndex, "legend", { r: 0, i: value }]),
        addColorScaleColor: (scaleIndex: number, colorIndex: number, k = "", c = "", legend = "") => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", colorIndex, { i: { c, k, legend } }]),
        removeColorScaleColor: (scaleIndex: number, colorIndex: number) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", colorIndex, { r: 0 }]),
        setColorScaleDefaultColor: (scaleIndex: number, value: string) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "default", { r: 0, i: value }]),
        moveColorUp: (scaleIndex: number, colorIndex: number) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", [ colorIndex, { p: 0 } ], [ colorIndex - 1, { d: 0 } ]]),
        moveColorDown: (scaleIndex: number, colorIndex: number) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", [ colorIndex, { p: 0 } ], [ colorIndex + 1, { d: 0 } ]]),
        addBarChart: (elementIndex: number) => doc.submitOp(["chart", "elements", elementIndex, {
          i: {
            type: "hBar",
            d: {
              dataSet: "",
              categories: "",
              subCategories: "",
              value: "",
              labelWidth: 170,
              repeat: "",
              scale: "x", // FIXME
              axis: {
                location: "start",
                labelSpace: 0,
                orientation: "vertical",
                repeat: "first",
                major: {
                  grid: true,
                  enabled: true,
                  tickSize: 8,
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
        }]),
        addLineChart: (elementIndex: number) => doc.submitOp(["chart", "elements", elementIndex, {
          i: {
            type: "line",
            d: {
              dataSet: "",
              x: {
                key: "",
                scale: "lineX",
                axis: {
                  location: "end",
                  labelSpace: 64,
                  orientation: "vertical",
                  repeat: "first",
                  major: {
                    grid: false,
                    enabled: true,
                    tickSize: 8,
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
                  location: "end",
                  labelSpace: 64,
                  orientation: "horizontal",
                  repeat: "first",
                  major: {
                    grid: true,
                    enabled: true,
                    tickSize: 8,
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
              style: {
                default: {
                  k: "",
                  color: "#000",
                  width: 1,
                  label: { text: "", location: "right", color: "#000" },
                },
                byKey: []
              },
            },
          },
        }]),
        removeChartElement: (elementIndex: number) => doc.submitOp(["chart", "elements", elementIndex, { r: 0 }]),
        moveElementUp: (elementIndex: number) => doc.submitOp(["chart", "elements", [ elementIndex, { p: 0 } ], [ elementIndex - 1, { d: 0 } ]]),
        moveElementDown: (elementIndex: number) => doc.submitOp(["chart", "elements", [ elementIndex, { p: 0 } ], [ elementIndex + 1, { d: 0 } ]]),
      };
    },
    style: () => {
      const styleScope = createScope<Style>(db, ["doc", "style"]);
      
      return {
        ...styleScope,
        setTitleBold: (value: boolean) => doc.submitOp(["style", "titleBold", { r: 0, i: value }]),
        setSubTitleBold: (value: boolean) => doc.submitOp(["style", "subTitleBold", { r: 0, i: value }]),
        setTitleSize: (value: number) => doc.submitOp(["style", "titleSize", { r: 0, i: value }]),
        setSubTitleSize: (value: number) => doc.submitOp(["style", "subTitleSize", { r: 0, i: value }]),
        setMarginLeft: (value: number) => doc.submitOp(["style", "marginLeft", { r: 0, i: value }]),
        setMarginRight: (value: number) => doc.submitOp(["style", "marginRight", { r: 0, i: value }]),
        setMarginTop: (value: number) => doc.submitOp(["style", "marginTop", { r: 0, i: value }]),
        setMarginBottom: (value: number) => doc.submitOp(["style", "marginBottom", { r: 0, i: value }]),
        setBGColor: (value: string) => doc.submitOp(["style", "bgColor", { r: 0, i: value }]),
        setTextColor: (value: string) => doc.submitOp(["style", "textColor", { r: 0, i: value }]),
      };
    },
    dataSet: (index: number) => {
      const dataSetScope = createScope<Set>(db, ["doc", "data", "sets", index]);
      
      return {
        ...dataSetScope,
        setRaw: (value: string) => doc.submitOp(["data", "sets", index, "raw", { r: 0, i: value }]),
        setType: (value: string) => doc.submitOp(["data", "sets", index, "type", { r: 0, i: value }]),
        setColumnType: (colIndex: number, value: string) => doc.submitOp(["data", "sets", index, "rows", colIndex, "type", { r: 0, i: value }]),
        addColumn: (colIndex: number, key: string, type: string) => doc.submitOp(["data", "sets", index, "rows", colIndex, { i: { key, type }}]),
        removeColumn: (colIndex: number) => doc.submitOp(["data", "sets", index, "rows", colIndex, { r: true }]),
      };
    },
    addDataSet: (index: number) => doc.submitOp(["data", "sets", index, { i: { id: "" + Date.now(), type: "tsv", raw: "", rows: [] } }]),
  };
}();

export const axis = (scope: ReturnType<typeof createScope>, key: string[], doc: any) => {
  const axisScope = createScope<Axis>(scope, key);

  return {
    ...axisScope,
    setLocation: (value: string) => doc.submitOp([...axisScope.path.slice(1), "location", { r: 0, i: value }]),
    setOrientation: (value: string) => doc.submitOp([...axisScope.path.slice(1), "orientation", { r: 0, i: value }]),
    setRepeat: (value: string) => doc.submitOp([...axisScope.path.slice(1), "repeat", { r: 0, i: value }]),
    setLabelSpace: (value: number) => doc.submitOp([...axisScope.path.slice(1), "labelSpace", { r: 0, i: value }]),
    major: axisGrid(axisScope, "major", doc),
    minor: axisGrid(axisScope, "minor", doc),
  };
};

export const axisGrid = (scope: ReturnType<typeof createScope>, key: string, doc: any) => {
  const majorScope = createScope<AxisGrid>(scope, [key]);

  return {
    ...majorScope,
    setGrid: (value: boolean) => doc.submitOp([...majorScope.path.slice(1), "grid", { r: 0, i: value }]),
    setEnabled: (value: boolean) => doc.submitOp([...majorScope.path.slice(1), "enabled", { r: 0, i: value }]),
    setTickSize: (value: number) => doc.submitOp([...majorScope.path.slice(1), "tickSize", { r: 0, i: value }]),
    setColor: (value: string) => doc.submitOp([...majorScope.path.slice(1), "color", { r: 0, i: value }]),
    setLabelDivide: (value: number) => doc.submitOp([...majorScope.path.slice(1), "labelDivide", { r: 0, i: value }]),
    setLabelThousands: (value: string) => doc.submitOp([...majorScope.path.slice(1), "labelThousands", { r: 0, i: value }]),
    setAutoFrom: (value: number) => doc.submitOp([...majorScope.path.slice(1), "auto", "from", { r: 0, i: value }]),
    setAutoEach: (value: number) => doc.submitOp([...majorScope.path.slice(1), "auto", "each", { r: 0, i: value }]),
    setAutoLabels: (value: boolean) => doc.submitOp([...majorScope.path.slice(1), "auto", "labels", { r: 0, i: value }]),
    setAfterLabel: (value: string) => doc.submitOp([...majorScope.path.slice(1), "afterLabel", { r: 0, i: value }]),
    addTick: (index: number) => doc.submitOp([...majorScope.path.slice(1), "ticks", index, { i: { n: 0, l: "" } }]),
    removeTick: (index: number) => doc.submitOp([...majorScope.path.slice(1), "ticks", index, { i: 0 }]),
    setTickValue: (tickIndex: number, value: number) => doc.submitOp([...majorScope.path.slice(1), "ticks", tickIndex, "n", { r: 0, i: value }]),
    setTickLabel: (tickIndex: number, value: string) => doc.submitOp([...majorScope.path.slice(1), "ticks", tickIndex, "l", { r: 0, i: value }]),
  };
};

export const lineStyle = (scope: ReturnType<typeof createScope>, key: (string | number)[], doc: any) => {
  const styleScope = createScope<LineStyleKey>(scope, key);

  return {
    ...styleScope,
    setLabelLocation: (value: string) => doc.submitOp([...styleScope.path.slice(1), "label", "location", { r: 0, i: value }]),
    setLabelText: (value: string) => doc.submitOp([...styleScope.path.slice(1), "label", "text", { r: 0, i: value }]),
    setKey: (value: string) => doc.submitOp([...styleScope.path.slice(1), "k", { r: 0, i: value }]),
    setColor: (value: string) => doc.submitOp([...styleScope.path.slice(1), "color", { r: 0, i: value }]),
    setLabelColor: (value: string) => doc.submitOp([...styleScope.path.slice(1), "label", "color", { r: 0, i: value }]),
    setwidth: (value: number) => doc.submitOp([...styleScope.path.slice(1), "width", { r: 0, i: value }]),
    delete: () => doc.submitOp([...styleScope.path.slice(1), { r: 0 }]),
  };
};
