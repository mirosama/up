"use strict";

var express = require("express"),
    bodyParser = require('body-parser'), 
    objectStoreJs = require("./objectStore.js");

var listenPort = 46872;

var app = express();

var objectStoreCache = new objectStoreJs.ObjectStoreCache;

// Parse JSON request payloads so they are better accessible inside request
// handlers.
app.use(bodyParser.json({
  "limit": 4096
}));

// Only for testing purposes
console.log("WARNING: CORS headers allows all origins. This is not secure. Only for test purposes.");
app.use(function(request, response, next) {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/list-spaces", function(request, response) {
  objectStoreCache.getObjectStore().then(function(objectStore) {
    response.set("Content-Type", "application/json");
    response.send(JSON.stringify(objectStore.listSpaces()));
  });
});

app.post("/list-objects", function(request, response) {
  if (!(request.body instanceof Object) ||
      !("space" in request.body)        ||
      typeof request.body.space !== "string") {
    response.status(400);
    response.send();
    return;
  }

  objectStoreCache.getObjectStore().then(function(objectStore) {
    response.set("Content-Type", "application/json");
    response.send(JSON.stringify(objectStore.listObjects(request.body.space)));
  });
});

app.post("/create-object", function(request, response) {
  if (!(request.body instanceof Object) ||
      !("space" in request.body)    ||
      !("key" in request.body)      ||
      !("content" in request.body)  ||
      typeof request.body.space !== "string" ||
      typeof request.body.key   !== "string" ||
      request.body.content === null          ||
      request.body.content === undefined) {
    response.status(400);
    response.send();
    return;
  }

  objectStoreCache.getObjectStore().then(function(objectStore) {
    response.set("Content-Type", "application/json");
    response.send(JSON.stringify(objectStore.createObject(request.body.space, request.body.key, request.body.content)));
    objectStore.save();
  });
});

app.post("/read-object", function(request, response) {
  if (!(request.body instanceof Object) ||
      !("space" in request.body)    ||
      !("key" in request.body)      ||
      typeof request.body.space !== "string" ||
      typeof request.body.key   !== "string") {
    response.status(400);
    response.send();
    return;
  }

  objectStoreCache.getObjectStore().then(function(objectStore) {
    response.set("Content-Type", "application/json");
    response.send(JSON.stringify(objectStore.readObject(request.body.space, request.body.key)));
  });
});


app.post("/update-object", function(request, response) {
  if (!(request.body instanceof Object) ||
      !("space" in request.body)    ||
      !("key" in request.body)      ||
      !("content" in request.body)  ||
      typeof request.body.space !== "string" ||
      typeof request.body.key   !== "string" ||
      request.body.content === null          ||
      request.body.content === undefined) {
    response.status(400);
    response.send();
    return;
  }

  objectStoreCache.getObjectStore().then(function(objectStore) {
    response.set("Content-Type", "application/json");
    response.send(JSON.stringify(objectStore.updateObject(request.body.space, request.body.key, request.body.content)));
    objectStore.save();
  });
});


app.post("/delete-object", function(request, response) {
  if (!(request.body instanceof Object) ||
      !("space" in request.body)    ||
      !("key" in request.body)      ||
      typeof request.body.space !== "string" ||
      typeof request.body.key   !== "string") {
    response.status(400);
    response.send();
    return;
  }

  objectStoreCache.getObjectStore().then(function(objectStore) {
    response.set("Content-Type", "application/json");
    response.send(JSON.stringify(objectStore.deleteObject(request.body.space, request.body.key)));
    objectStore.save();
  });
});

app.listen(listenPort);

console.log("Listening on port " + listenPort);
