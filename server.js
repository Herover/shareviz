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
            },
            title: "Value by country",
            geometry: "rectangle",
            coordSystem: "cartesian",
          }
        ]
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
    console.log('submit', ctx, ctx.op.op);
    setTimeout(next, 100);
  });
  backend.use('apply', function(ctx, next) {
    console.log('apply');
    next();
  });
  backend.use('commit', function(ctx, next) {
    console.log('commit', ctx.snapshot);
    next();
  });
  backend.use('afterWrite', function(ctx, next) {
    console.log('afterWrite');
    next();
  });

  console.log('Listening on ws://localhost:8080');
}
