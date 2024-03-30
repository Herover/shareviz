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
            {
              id: "2",
              type: "tsv",
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
              values: ["#ff8888", "#aa2222"],
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
          hBar: {
            dataSet: "1",
            categories: "område",
            subCategories: "tid",
            value: "antal",
            labelWidth: 170,
            repeat: "gæstens nationalitet",
          },
          line: {
            dataSet: "2",
            x: {
              key: "tid",
              scale: "lineX",
            },
            y: {
              key: "antal",
              scale: "lineY",
            },
            categories: "område"
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
