"use strict";

var when = require("when"),
    whenNode = require("when/node");

var nodeFs = require("fs");

var fs = {
  "readFile": whenNode.lift(nodeFs.readFile),
  "writeFile": whenNode.lift(nodeFs.writeFile)
};

// "Constants"
var objectStorePath = "./objectStore.json";


function ObjectStore() {
  this.megaStore = new Object;
  this.filename  = null;
}

ObjectStore.prototype.createStore = function(spaceName) {
  var newStore = new Object;

  this.megaStore[spaceName] = newStore;

  return newStore;
};

ObjectStore.prototype.deleteStore = function(spaceName) {
  if (spaceName in this.megaStore) {
    this.megaStore[spaceName] = null;
  }

  return true;
};

ObjectStore.prototype.hasSpace = function(spaceName) {
  return spaceName in this.megaStore && this.megaStore[spaceName] instanceof Object;
};

ObjectStore.prototype.readOrCreateStore = function(spaceName) {
  if (!(this.hasSpace(spaceName))) {
    return this.createStore(spaceName);

  } else {
    return this.megaStore[spaceName];
  }
};

ObjectStore.prototype.hasObject = function(spaceName, storeKey) {
  if (!(this.hasSpace(spaceName))) {
    return false;
  }

  var space = this.megaStore[spaceName];

  return storeKey in space        &&
         space[storeKey] !== null &&
         space[storeKey] !== undefined;
};

ObjectStore.prototype.createObject = function(spaceName, storeKey, storeObject) {
  var space = this.readOrCreateStore(spaceName);

  if (this.hasObject(spaceName, storeKey)) {
    return false;
  }

  space[storeKey] = storeObject;
  return true;
};

ObjectStore.prototype.readObject = function(spaceName, storeKey) {
  var space = this.megaStore[spaceName];

  if (!(this.hasObject(spaceName, storeKey))) {
    return null;
  }

  return space[storeKey];
};

ObjectStore.prototype.updateObject = function(spaceName, storeKey, newStoreObject) {
  var space = this.readOrCreateStore(spaceName);

  if (!(this.hasObject(spaceName, storeKey))) {
    return null;
  }

  space[storeKey] = newStoreObject;

  return true;
};

ObjectStore.prototype.deleteObject = function(spaceName, storeKey) {
  if (this.hasSpace(spaceName)) {
    var space = this.megaStore[spaceName];
    
    if (storeKey in space) {
      space[storeKey] = null;
    }
  }

  return true;
};

ObjectStore.prototype.listSpaces = function() {
  var spaceList = new Array;

  for (var spaceName in this.megaStore) {
    if (this.megaStore[spaceName] !== null) {
      spaceList.push(spaceName);
    }
  }

  return spaceList;
};

ObjectStore.prototype.listObjects = function(spaceName) {
  var objectList = new Array,
      space = null;

  if (!(this.hasSpace(spaceName))) {
    return null;
  }

  space = this.megaStore[spaceName];

  for (var objectKey in space) {
    if (space[objectKey] !== null) {
      objectList.push(objectKey);
    }
  }

  return objectList;
};

ObjectStore.prototype.save = function() {
  return when.try(function() {
    var megaStoreJSON = JSON.stringify(this.megaStore);

    return fs.writeFile(this.filename, megaStoreJSON, {"encoding": "utf8"});
  }.bind(this));
};

function ObjectStoreLoadFile() {
  var newObjectStore = new ObjectStore();
  newObjectStore.filename = objectStorePath;

  return fs.readFile(newObjectStore.filename, "utf8").then(function(data) {
    newObjectStore.megaStore = JSON.parse(data);

    return newObjectStore;

  }).catch(function(err) {
    // If the file does not exists, just skip: it will be created upon
    // objectStore.save(); (if the caller ever calls it)
    if (err.code === "ENOENT") {
      return newObjectStore;
    }

    throw err;
  });
}

function ObjectStoreCache() {
  this.objectStorePromise = null;
}

ObjectStoreCache.prototype.getObjectStore = function() {
  if (this.objectStorePromise === null) {
    this.objectStorePromise = ObjectStoreLoadFile();
  }
  
  return this.objectStorePromise;
};

exports.ObjectStoreCache = ObjectStoreCache;
