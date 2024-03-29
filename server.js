import ShareDB from 'sharedb';
import { WebSocketServer } from 'ws';
import WebSocketJSONStream from '@teamwork/websocket-json-stream';
import json1 from 'ot-json1';

ShareDB.types.register(json1.type);
var backend = new ShareDB({ presence: true });
createDoc(startServer);

// Create initial document then fire callback
function createDoc(callback) {
  var connection = backend.connect();
  var doc = connection.get('examples', '1');
  doc.fetch(function(err) {
    if (err) throw err;
    if (doc.type === null) {
      doc.create({
        data: {
          sets: [
            {
              id: "1",
              type: "tsv",
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
              values: ["#ff8888", "#aa2222"],
            },
          ],
          hBar: {
            dataSet: "1",
            categories: "område",
            subCategories: "tid",
            value: "antal",
            labelWidth: 170,
            repeat: "gæstens nationalitet",
          },
          line: {
            x: {},
          },
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
          titleSize: 24,
          titleBold: true,
          subTitleSize: 16,
          subTitleBold: true,
          sourceMargin: 8,
          bgColor: "#ffffff",
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
        
      }, json1.type.uri, callback);
      return;
    }
    console.log(doc.data);
    callback();
  });
}

function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocketServer({ port: 8080 });
  wss.on('connection', function(ws) {
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });

  backend.use('connect', function(ctx, next) {
    console.log('connect');
    next();
  });
  backend.use('receive', function(ctx, next) {
    console.log('receive');
    next();
  });
  backend.use('reply', function(ctx, next) {
    console.log('reply');
    next();
  });
  backend.use('receivePresence', function(ctx, next) {
    console.log('receivePresence');
    next();
  });
  backend.use('sendPresence', function(ctx, next) {
    console.log('sendPresence');
    next();
  });
  backend.use('query', function(ctx, next) {
    console.log('query');
    next();
  });
  backend.use('readSnapshots', function(ctx, next) {
    console.log('readSnapshots');
    next();
  });
  backend.use('op', function(ctx, next) {
    console.log('op');
    next();
  });

  backend.use('submit', function(ctx, next) {
    console.log('submit', /* ctx, */ JSON.stringify(ctx.op.op));
    setTimeout(next, 100);
  });
  backend.use('apply', function(ctx, next) {
    console.log('apply');
    next();
  });
  backend.use('commit', function(ctx, next) {
    console.log('commit'/* , ctx.snapshot */);
    next();
  });
  backend.use('afterWrite', function(ctx, next) {
    console.log('afterWrite');
    next();
  });

  console.log('Listening on ws://localhost:8080');
}
