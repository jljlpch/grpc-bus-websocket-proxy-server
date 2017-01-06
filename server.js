var util = require('util')

var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ port: 8081 });

var grpcBus = require('grpc-bus');
var protobuf = require("protobufjs");

gbBuilder = protobuf.loadProtoFile('grpc-bus.proto');
gbTree = gbBuilder.build().grpcbus;

wss.on('connection', function connection(ws) {
  console.log('connected');

  ws.once('message', function incoming(data, flags) {
    var message = JSON.parse(data);
    protoDefs = protobuf.loadProto(message.contents, null, message.filename);
    var gbServer = new grpcBus.Server(protoDefs, function(message) {
      console.log('sending (pre-stringify): %s')
      console.dir(message, { depth: null });
      console.log('sending (post-stringify): %s')
      console.dir(JSON.stringify(message));
      //ws.send(JSON.stringify(message));
      var pbMessage = new gbTree.GBServerMessage(message);
      ws.send(pbMessage.toBuffer());
    }, require('grpc'));

    ws.on('message', function incoming(data, flags) {
      console.log('received (raw):');
      console.dir(message);
      console.log('with flags:')
      console.dir(flags);
      //var message = JSON.parse(data);
      var message = gbTree.GBClientMessage.decode(data);
      console.log('received (parsed):');
      console.dir(message, { depth: null });
      gbServer.handleMessage(message);
    });
  });
});