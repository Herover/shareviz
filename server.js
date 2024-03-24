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
          type: "tsv",
          raw: `periode	overnatningsform	område	1992	1993	1994	1995	1996	1997	1998	1999	2000	2001	2002	2003	2004	2005	2006	2007	2008	2009	2010	2011	2012	2013	2014	2015	2016	2017	2018	2019	2020	2021	2022	2023	
Hele året	Alle typer	Region Hovedstaden	5453584	5219781	5362875	5330292	5711782	5719313	5965307	6090876	6435513	6497909	6498141	6465366	6822007	7168923	7570127	7661918	7528245	7067184	7648237	8351552	8750366	9143667	9713230	10443095	10871724	11101173	11922254	12596150	5642906	7869017	13485341	14679105
Hele året	Alle typer	Region Sjælland	3382890	3275356	3249522	3322644	3115317	3153834	3099539	3053353	3078677	3119286	3261798	3393056	3326648	3371720	3558232	3533160	3484698	3131985	2979458	2901088	2797532	2839163	2976010	2956445	3093372	3077449	3081443	3117109	2637739	2985606	3488736	3452665
Hele året	Alle typer	Region Syddanmark	7313571	6725756	7116780	7544753	7460037	7473098	7540538	7733083	7581844	7469839	7607077	7999248	7639200	7511497	7972017	8085734	8358203	8323610	8573895	8594925	8302981	8347448	8639720	8895644	9154981	9209509	9550856	9681582	7967114	9167722	11148543	10927314
Hele året	Alle typer	Region Midtjylland	5075988	4746399	4820608	5037058	4863574	4877625	4713091	4683078	4601082	4619395	4746115	4827977	4630483	4512476	4672010	4692413	4745271	4418661	4443939	4559881	4487630	4603483	4700110	4805032	4935126	5081710	5112739	5121868	4404659	5102847	6156733	6036558
Hele året	Alle typer	Region Nordjylland	5078588	4844723	4991293	5039288	5018010	5247800	5210046	5168063	4947743	4965721	5059553	5152218	5108498	5107762	5153483	5128968	5014353	4574885	4502220	4738460	4632808	4479906	4439689	4455434	4584231	4555776	4640231	4814483	4035544	4514346	5336107	4989245
`,
          rows: [
            {
              key: "periode",
              type: "text",
            },
            {
              key: "overnatningsform",
              type: "text",
            },
            {
              key: "område",
              type: "text",
            },
            {
              key: "1992",
              type: "number",
            },
            {
              key: "1993",
              type: "number",
            },
            {
              key: "1994",
              type: "number",
            },
            {
              key: "1995",
              type: "number",
            },
            {
              key: "1996",
              type: "number",
            },
            {
              key: "1997",
              type: "number",
            },
            {
              key: "1998",
              type: "number",
            },
            {
              key: "1999",
              type: "number",
            },
            {
              key: "2000",
              type: "number",
            },
            {
              key: "2001",
              type: "number",
            },
            {
              key: "2002",
              type: "number",
            },
            {
              key: "2003",
              type: "number",
            },
            {
              key: "2004",
              type: "number",
            },
            {
              key: "2005",
              type: "number",
            },
            {
              key: "2006",
              type: "number",
            },
            {
              key: "2007",
              type: "number",
            },
            {
              key: "2008",
              type: "number",
            },
            {
              key: "2009",
              type: "number",
            },
            {
              key: "2010",
              type: "number",
            },
            {
              key: "2011",
              type: "number",
            },
            {
              key: "2012",
              type: "number",
            },
            {
              key: "2013",
              type: "number",
            },
            {
              key: "2014",
              type: "number",
            },
            {
              key: "2015",
              type: "number",
            },
            {
              key: "2016",
              type: "number",
            },
            {
              key: "2017",
              type: "number",
            },
            {
              key: "2018",
              type: "number",
            },
            {
              key: "2019",
              type: "number",
            },
            {
              key: "2020",
              type: "number",
            },
            {
              key: "2021",
              type: "number",
            },
            {
              key: "2022",
              type: "number",
            },
            {
              key: "2023",
              type: "number",
            },
          ],
        },
        chart: {
          title: "Fortsat stigning i overnatninger",
          subTitle: "Men kun i Region Hovedstaden",
          width: 390,
          height: 500,
          chartType: "hBar",
          hBar: {
            categories: "område",
            value: [/* "2020", "2021", */ "2022", "2023"],
            labelWidth: 170,
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
          marginTop: 10,
          marginBottom: 10,
          marginLeft: 10,
          marginRight: 10,
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
