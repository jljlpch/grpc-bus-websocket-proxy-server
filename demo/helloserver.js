//
// Hello World GRPC Server
//

/*
 *
 * Copyright 2015, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */


var PROTO_PATH = __dirname + '/helloworld.proto';

console.log('\n\nPROTO_PATH: ', PROTO_PATH);
var grpc = require('grpc');
var hello_proto = grpc.load(PROTO_PATH).helloworld;

/**
 * Implements the SayHello RPC method.
 */
function sayHello(call, callback) {
  callback(null, {message: 'Hello ' + call.request.name});
}

/**
 * Implements the StreamOutHello RPC method.
 */
function streamOutHello(call) {
  for (var i=0; i<call.request.iterations; i++){
    call.write({message: 'Hello ' + call.request.name});
  }
  call.end();
}

function concat(call, callback) {
  var msgs = [];
  call.on('data', function(msg) {
    msgs.push(msg.content);
    console.log('concat got data', msg, msg.content);
  });
  call.on('end', function() {
    callback(null, {content: msgs.join('\n')});
  });
}

function echo(call) {
  call.on('data', function(msg) {
    console.log('echo got data', msg, msg.content);
    call.write(msg);
  });
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */

function main() {
  var server = new grpc.Server();
  server.addProtoService(hello_proto.Greeter.service, {sayHello: sayHello, streamOutHello: streamOutHello, echo: echo, concat: concat});
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();


// vim: tabstop=8 expandtab shiftwidth=2 softtabstop=2
