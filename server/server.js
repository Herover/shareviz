import { WebSocketServer } from "ws";
import WebSocketJSONStream from "@teamwork/websocket-json-stream";
import json1 from "ot-json1";
import { db } from "../server_lib/user.js";
import { backend, connection } from "../server_lib/sharedb.js";
import sharedb from "sharedb";
import {
  db as drizzledb,
  sessions,
  users,
} from "../server_lib/drizzle/schema.js";
import { eq, gt } from "drizzle-orm";

// Create initial document then fire callback
export function createDoc(callback) {
  var doc = connection.get("examples", "1");
  doc.fetch(function (err) {
    if (err) throw err;
    if (doc.type === null) {
      /** @type {import('./../src/lib/chart').Root} */
      const defaultChart = {
        meta: {
          publicRead: true,
          access: [{ userId: 1, write: true, read: true }],
        },
        data: {
          sets: [
            {
              id: "1",
              type: "tsv",
              name: "Overnatninger, nationalitet",
              raw: `gæstens nationalitet	område	antal	tid
Danmark	Region Hovedstaden	7079455	2022
Danmark	Region Sjælland	2762168	2022
Danmark	Region Syddanmark	7176068	2022
Danmark	Region Midtjylland	4756452	2022
Danmark	Region Nordjylland	3809946	2022
Verden udenfor Danmark	Region Hovedstaden	6405886	2022
Verden udenfor Danmark	Region Sjælland	726568	2022
Verden udenfor Danmark	Region Syddanmark	3972475	2022
Verden udenfor Danmark	Region Midtjylland	1400281	2022
Verden udenfor Danmark	Region Nordjylland	1526161	2022
Danmark	Region Hovedstaden	7243293	2023
Danmark	Region Sjælland	2698091	2023
Danmark	Region Syddanmark	6757571	2023
Danmark	Region Midtjylland	4612572	2023
Danmark	Region Nordjylland	3561663	2023
Verden udenfor Danmark	Region Hovedstaden	7435812	2023
Verden udenfor Danmark	Region Sjælland	754574	2023
Verden udenfor Danmark	Region Syddanmark	4169743	2023
Verden udenfor Danmark	Region Midtjylland	1423986	2023
Verden udenfor Danmark	Region Nordjylland	1427582	2023`,
              transpose: [],
              rows: [
                {
                  key: "gæstens nationalitet",
                  type: "text",
                },
                {
                  key: "område",
                  type: "text",
                },
                {
                  key: "tid",
                  type: "text",
                },
                {
                  key: "antal",
                  type: "number",
                },
              ],
            },
            {
              id: "2",
              type: "tsv",
              name: "Overnatninger, historisk",
              raw: `område	tid	antal
Region Hovedstaden	2010	7648237
Region Hovedstaden	2011	8351552
Region Hovedstaden	2012	8750366
Region Hovedstaden	2013	9143667
Region Hovedstaden	2014	9713230
Region Hovedstaden	2015	10443095
Region Hovedstaden	2016	10871724
Region Hovedstaden	2017	11101173
Region Hovedstaden	2018	11922254
Region Hovedstaden	2019	12596150
Region Hovedstaden	2020	5642906
Region Hovedstaden	2021	7869017
Region Hovedstaden	2022	13485341
Region Hovedstaden	2023	14679105
Region Sjælland	2010	2979458
Region Sjælland	2011	2901088
Region Sjælland	2012	2797532
Region Sjælland	2013	2839163
Region Sjælland	2014	2976010
Region Sjælland	2015	2956445
Region Sjælland	2016	3093372
Region Sjælland	2017	3077449
Region Sjælland	2018	3081443
Region Sjælland	2019	3117109
Region Sjælland	2020	2637739
Region Sjælland	2021	2985606
Region Sjælland	2022	3488736
Region Sjælland	2023	3452665
Region Syddanmark	2010	8573895
Region Syddanmark	2011	8594925
Region Syddanmark	2012	8302981
Region Syddanmark	2013	8347448
Region Syddanmark	2014	8639720
Region Syddanmark	2015	8895644
Region Syddanmark	2016	9154981
Region Syddanmark	2017	9209509
Region Syddanmark	2018	9550856
Region Syddanmark	2019	9681582
Region Syddanmark	2020	7967114
Region Syddanmark	2021	9167722
Region Syddanmark	2022	11148543
Region Syddanmark	2023	10927314
Region Midtjylland	2010	4443939
Region Midtjylland	2011	4559881
Region Midtjylland	2012	4487630
Region Midtjylland	2013	4603483
Region Midtjylland	2014	4700110
Region Midtjylland	2015	4805032
Region Midtjylland	2016	4935126
Region Midtjylland	2017	5081710
Region Midtjylland	2018	5112739
Region Midtjylland	2019	5121868
Region Midtjylland	2020	4404659
Region Midtjylland	2021	5102847
Region Midtjylland	2022	6156733
Region Midtjylland	2023	6036558
Region Nordjylland	2010	4502220
Region Nordjylland	2011	4738460
Region Nordjylland	2012	4632808
Region Nordjylland	2013	4479906
Region Nordjylland	2014	4439689
Region Nordjylland	2015	4455434
Region Nordjylland	2016	4584231
Region Nordjylland	2017	4555776
Region Nordjylland	2018	4640231
Region Nordjylland	2019	4814483
Region Nordjylland	2020	4035544
Region Nordjylland	2021	4514346
Region Nordjylland	2022	5336107
Region Nordjylland	2023	4989245`,
              transpose: [],
              rows: [
                {
                  key: "område",
                  type: "text",
                },
                {
                  key: "tid",
                  type: "number",
                },
                {
                  key: "antal",
                  type: "number",
                },
              ],
            },
          ],
        },
        chart: {
          title: "Fortsat stigning i overnatninger",
          subTitle: "Men kun i Region Hovedstaden",
          width: 390,
          height: 500,
          chartType: "hBar",
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
                  {
                    k: "Region Hovedstaden",
                    legend: "Region Hovedstaden",
                    c: "lch(38.24079414130722% 60 219.99901061253297)",
                  },
                  {
                    k: "Region Nordjylland",
                    legend: "Region Nordjylland",
                    c: "lch(68.24079414130722% 65 39.99901061253297)",
                  },
                  {
                    k: "Region Midtjylland",
                    legend: "Region Midtjylland",
                    c: "lch(78.24079414130722% 65 57.99901061253297)",
                  },
                  {
                    k: "Region Syddanmark",
                    legend: "Region Syddanmark",
                    c: "lch(88.24079414130722% 60 93.99901061253297)",
                  },
                  {
                    k: "Region Sjælland",
                    legend: "Region Sjælland",
                    c: "lch(68.24079414130722% 40 165.99901061253297)",
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
          elements: [
            {
              type: "hBar",
              d: {
                dataSet: "1",
                categories: "tid",
                subCategories: "område",
                stackSubCategories: true,
                portionSubCategories: false,
                value: "antal",
                labelWidth: 50,
                repeat: "gæstens nationalitet",
                scale: {
                  name: "x",
                  dataKey: "antal",
                  type: "linear",
                  dataRange: [0, 1],
                },
                colors: {
                  default: "#888888",
                  byKey: [
                    {
                      k: "Region Hovedstaden",
                      legend: "Region Hovedstaden",
                      c: "lch(38.24079414130722% 60 219.99901061253297)",
                    },
                    {
                      k: "Region Nordjylland",
                      legend: "Region Nordjylland",
                      c: "lch(68.24079414130722% 65 39.99901061253297)",
                    },
                    {
                      k: "Region Midtjylland",
                      legend: "Region Midtjylland",
                      c: "lch(78.24079414130722% 65 57.99901061253297)",
                    },
                    {
                      k: "Region Syddanmark",
                      legend: "Region Syddanmark",
                      c: "lch(88.24079414130722% 60 93.99901061253297)",
                    },
                    {
                      k: "Region Sjælland",
                      legend: "Region Sjælland",
                      c: "lch(68.24079414130722% 40 165.99901061253297)",
                    },
                  ],
                },
                rectLabels: false,
                totalLabels: "none",
                axis: {
                  location: "start",
                  labelSpace: 0,
                  orientation: "horizontal",
                  repeat: "first",
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
                      each: 10000000,
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
            {
              type: "line",
              d: {
                dataSet: "2",
                x: {
                  axis: {
                    location: "end",
                    labelSpace: 16,
                    orientation: "horizontal",
                    repeat: "all",
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
                        from: 2010,
                        each: 5,
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
                        from: 2010,
                        each: 1,
                        labels: false,
                      },
                      ticks: [],
                    },
                  },
                  key: "tid",
                  scale: "lineX",
                },
                y: {
                  axis: {
                    location: "end",
                    labelSpace: 16,
                    orientation: "vertical",
                    repeat: "all",
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
                      labelDivide: 1,
                      labelThousands: "",
                      afterLabel: " mio.",
                      auto: {
                        from: 0,
                        each: 1000000,
                        labels: false,
                      },
                      ticks: [],
                    },
                  },
                  key: "antal",
                  scale: "lineY",
                },
                categories: "område",
                fill: false,
                stack: false,
                heightRatio: 0.9,
                style: {
                  default: {
                    k: "",
                    color: "#000",
                    width: 3,
                    label: {
                      location: "right",
                      text: "",
                      color: "#000",
                    },
                    symbols: "none",
                    missingStyle: "dashed",
                  },
                  byKey: [
                    {
                      k: "Region Hovedstaden",
                      color: "#ff8888",
                      width: 4,
                      label: {
                        location: "float",
                        text: "Hovedstaden",
                        color: "#ff8888",
                        x: 2015,
                        y: 10443095,
                        rx: -24,
                        ry: -32,
                        line: "line",
                      },
                      symbols: "none",
                      missingStyle: "dashed",
                    },
                  ],
                },
              },
            },
          ],
          sourceTextLeft: "Kilde: statistikbanken.dk/turist",
          sourceTextLeftLink: "https://statistikbanken.dk/turist",
          sourceTextRight: "leonora.app",
          sourceTextRightLink: "https://leonora.app",
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
        /* data: {
          sets: {
            "Test": {
              series: [
                { name: "Country", type: "dimension" },
                { name: "Value", type: "measure" },
                { name: "Stock", type: "dimension" }
              ],
              records: [
                [ "Denmark", 10, "Cake", ],
                [ "Sweden", 11, "Cake", ],
                [ "Norway", 6, "Cake", ],
                [ "Finland", 12, "Cake", ],
                [ "Denmark", 21, "Cookies", ],
                [ "Sweden", 8, "Cookies", ],
                [ "Norway", 7, "Cookies", ],
                [ "Finland", 6, "Cookies", ]
              ]
            }
          }
        },
        specs: [
          {
            channels: {
              x: { set: ["Value", "Stock"] },
              y: { set: ["Country"] },
              color: { set: ["Stock"] },
              label: { set: ["Value"] },
              size: { set: [] },
            },
            title: "Value by country",
            geometry: "rectangle",
            coordSystem: "cartesian",
          }
        ] */
      };
      doc.create(defaultChart, json1.type.uri, callback);
      return;
    }
    callback();
  });
}

/**
 *
 * @param {import('http').Server} server
 */
export function startServer(server) {
  /* console.log("STARTSERVER",server) */
  // Create a web server to serve files and listen to WebSocket connections
  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocketServer({ server, path: "/sharedb" });
  wss.on("connection", function (ws, req) {
    var stream = new WebSocketJSONStream(ws);

    const cookies = req.headers.cookie
      ? req.headers.cookie.split(";").reduce((acc, part) => {
          const [key, value] = part.trim().split("=");
          acc[key] = value;
          return acc;
        }, {})
      : {};
    req.__sharevizAuthJSToken = cookies["authjs.session-token"];

    backend.listen(stream, req);
  });

  backend.use("connect", function (ctx, next) {
    console.log("connect");
    if (ctx.req.__sharevizAuthJSToken) {
      drizzledb
        .select()
        .from(sessions)
        .where(
          eq(sessions.sessionToken, ctx.req.__sharevizAuthJSToken),
          gt(sessions.expires, new Date().toISOString()),
        )
        .leftJoin(users, eq(sessions.userId, users.id))
        .then((result) => {
          if (typeof result != "undefined" && result.length == 1) {
            ctx.agent.custom.user = result[0].user;
            ctx.agent.custom.session = result[0].session;
            // TODO: respect session.expires and close user connection after this timestamp.
            return result[0];
          }
          throw new Error("session not found");
        })
        .then(() => {
          next();
        })
        .catch((e) => {
          console.error("error", e);
          next(e);
        });
    } else {
      next();
    }
  });
  backend.use("receive", function (ctx, next) {
    console.log(
      "receive",
      ctx.data.a,
      Object.keys(sharedb.MESSAGE_ACTIONS).find(
        (k) => sharedb.MESSAGE_ACTIONS[k] == ctx.data.a,
      ),
      /* JSON.stringify(ctx.data), */
    );

    if (
      ctx.data.a == sharedb.MESSAGE_ACTIONS.subscribe &&
      ctx.data.c == "examples"
    ) {
      // TODO: add authentication using `ctx.agent.custom.userId`
      // if (false) {
      //   console.log("unauthorized")
      //   return next("unauthorized");
      // }
      next();
    } else if (
      ctx.data.a == sharedb.MESSAGE_ACTIONS.op &&
      ctx.agent.custom.user
    ) {
      // Only allow access to "examples", no create through websockets
      if (ctx.data.c != "examples" || typeof ctx.data.create != "undefined") {
        next("unauthorized");
      } else {
        next();
      }
    } else if (ctx.data.a == sharedb.MESSAGE_ACTIONS.handshake) {
      next();
    } else if (ctx.data.a == sharedb.MESSAGE_ACTIONS.presenceSubscribe) {
      // TODO: only for allowed charts
      next();
    } else if (ctx.data.a == sharedb.MESSAGE_ACTIONS.fetch) {
      next();
    } else {
      console.log(`unauthorized receive on ${JSON.stringify(ctx.data)}`);
      next("unauthorized");
    }
  });
  backend.use("reply", function (ctx, next) {
    console.log("reply" /* JSON.stringify(ctx.reply) */);
    if (
      ctx.reply.a == sharedb.MESSAGE_ACTIONS.queryFetch &&
      ctx.reply?.data?.length
    ) {
      // When querying db, remove items user doesn't have access to
      // ctx.reply.data = ctx.reply?.data?.filter(
      //   e => e.data?.meta?.publicRead || e.data?.meta?.access.find(e => e.userId == ctx.agent.custom.userId && e.read)
      // );
      next("no queries");
    } else if (
      ctx.reply.a == sharedb.MESSAGE_ACTIONS.subscribe &&
      ctx.reply.c == "examples"
    ) {
      // When accessing chart, check if user is allowed to read
      db.getUserCharts(ctx.agent.custom.user.id, ctx.request.d)
        .then((charts) => {
          if (charts.length != 0) {
            next();
          } else {
            console.log(
              `unauthorized reply on ${ctx.request.c} ${ctx.request.d}`,
            );
            next("unauthorized");
          }
        })
        .catch((e) => next(e));
      // if (ctx.reply?.data?.data?.meta?.publicRead) {
      //   next();
      // } else {
      //   const entry = ctx.reply?.data?.data?.meta?.access?.find(e => e.userId === ctx.agent.custom.userId);
      //   if (entry?.read) {
      //     next();
      //   } else {
      //     console.log(`unauthorized reply on ${ctx.request.c} ${ctx.request.d}`);
      //     next("unauthorized");
      //   }
      // }
    } else {
      next();
    }
  });
  backend.use("receivePresence", function (ctx, next) {
    console.log("receivePresence");
    next();
  });
  backend.use("sendPresence", function (ctx, next) {
    console.log("sendPresence");
    next();
  });
  backend.use("query", function (ctx, next) {
    console.log("query");
    next();
  });
  backend.use("readSnapshots", function (ctx, next) {
    console.log("readSnapshots");
    next();
  });
  backend.use("op", function (ctx, next) {
    console.log("op");
    next();
  });

  backend.use("submit", function (ctx, next) {
    console.log("submit" /* ctx.snapshot */);
    if (ctx.snapshot === null) {
      next();
      return;
    }
    db.getUserCharts(ctx.agent.custom.user.id, ctx.id)
      .then((charts) => {
        // TODO: get rid of hard coded constant
        if (
          charts.length != 0 &&
          (charts[0].relationType === 1 || charts[0].teamId !== null)
        ) {
          next();
        } else {
          console.log(`unauthorized submit on ${ctx.collection} ${ctx.id}`);
          next("unauthorized");
        }
      })
      .catch((e) => next(e));
    // const entry = ctx.snapshot?.data?.meta?.access?.find(e => e.userId === ctx.agent.custom.userId);
    // if (entry?.write) {
    //   next();
    // } else {
    //   console.log(`unauthorized submit on ${ctx.collection} ${ctx.id}`);
    //   next("unauthorized");
    // }
  });
  backend.use("apply", function (ctx, next) {
    console.log("apply" /* ctx.agent.custom.userId, ctx */);
    ctx.extra.oldMeta = ctx.snapshot?.data?.meta;

    if (
      typeof ctx.op.create == "object" &&
      typeof ctx.snapshot?.data != "object"
    ) {
      // When creating a new chart, always add current user to access list
      ctx.op.create.data.meta = {
        publicRead: false,
        access: [{ userId: ctx.agent.custom.user.id, read: true, write: true }],
      };

      // db.addChart(ctx.id, "Chart name", ctx.agent.custom.user.id)
      //   .then(() => next())
      //   .catch((e) => next(e));
      next();
    } else if (typeof ctx.snapshot == "object") {
      // Only allow editing charts with write access
      db.getUserCharts(ctx.agent.custom.user.id, ctx.id)
        .then((charts) => {
          // TODO: get rid of hard coded constant
          if (
            charts.length !=
            0 /* && (charts[0].relationType === 1 || charts[0].teamId !== null) */
          ) {
            next();
          } else {
            console.log(`unauthorized apply on ${ctx.collection} ${ctx.id}`);
            next("unauthorized");
          }
        })
        .catch((e) => next(e));
      // const entry = ctx.snapshot?.data?.meta?.access?.find(e => e.userId === ctx.agent.custom.userId);
      // if (entry?.write) {
      //   next();
      // } else {
      //   console.log(`unauthorized apply on ${ctx.collection} ${ctx.id}`);
      //   next("unauthorized");
      // }
    } else {
      console.log(`unknown apply on ${ctx.collection} ${ctx.id}`);
      next("unauthorized");
    }
    // next();
  });
  backend.use("commit", function (ctx, next) {
    console.log("commit" /* ctx.snapshot */);
    if (typeof ctx.extra.oldMeta == "object" && ctx.snapshot?.data !== null) {
      // Ensure user can't edit meta object
      // TODO: add some sort of check to detect disallowed changes
      // TODO: make it possible for allowed users to change access settings
      ctx.snapshot.data.meta = ctx.extra.oldMeta;
    }
    next();
  });
  backend.use("afterWrite", function (ctx, next) {
    console.log("afterWrite");
    next();
  });
}
