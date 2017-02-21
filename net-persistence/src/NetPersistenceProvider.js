"use strict";

define(function() {
  var $http   = null,
      $q      = null,
      baseUrl =   "";

  function NetPersistenceProviderImpl() {
    this.lastRequestPromise = null;
  }

  NetPersistenceProviderImpl.prototype.parseResponse = function(response) {
    return response.data;
  };

  // waitRequest ensures operations are serialized.
  // This is a security in case the persistence user expects some model of
  // coherency. It won't help for concurrent operations on the store, but it
  // will avoid that a single user triggers concurrent operations on the store.
  //
  // It returns a promise that fulfills 
  NetPersistenceProviderImpl.prototype.waitRequest = function() {
    var previousLastRequestPromise = this.lastRequestPromise;

    if (previousLastRequestPromise === null) {
      return $q(function(resolve, reject) {
        resolve(null);
      });

    } else {
      return $q(function(resolve, reject) {
        previousLastRequestPromise.finally(function() {
          resolve(null);
        });
      });
    }
  };

  NetPersistenceProviderImpl.prototype.listSpaces = function() {
    var requestPromise = this.waitRequest().then(function() {
      return $http.get(baseUrl + "/list-spaces");
    }).then(
      this.parseResponse
    ).then(function(spaceList) {
      var hasMctSpace = false;
      
      for (var i = 0; i < spaceList.length; i++) {
        if (spaceList[i] === "mct") {
          hasMctSpace = true;
        }
      }

      if (hasMctSpace === false) {
        spaceList.push("mct");
      }

      return spaceList;
    });

    this.lastRequestPromise = requestPromise;
    return requestPromise;
  }

  NetPersistenceProviderImpl.prototype.listObjects = function(spaceName) {
    var requestPromise = this.waitRequest().then(function() {
      return $http.post(
        baseUrl + "/list-objects",
        {
          "space": spaceName
        }
      );
    }).then(this.parseResponse);

    this.lastRequestPromise = requestPromise;
    return requestPromise;
  };

  NetPersistenceProviderImpl.prototype.createObject = function(spaceName, key, content) {
    var requestPromise = this.waitRequest().then(function() {
      return $http.post(
        baseUrl + "/create-object",
        {
          "space":   spaceName,
          "key":     key,
          "content": content
        }
      );
    }).then(this.parseResponse);

    this.lastRequestPromise = requestPromise;
    return requestPromise;
  };

  NetPersistenceProviderImpl.prototype.readObject = function(spaceName, key) {
    var requestPromise = this.waitRequest().then(function() {
      return $http.post(
        baseUrl + "/read-object",
        {
          "space": spaceName,
          "key":   key
        }
      );
    }).then(
      this.parseResponse
    ).then(function(response) {
      // OpenMCT considers differently null & undefined. It considers null as a
      // real value, and undefined as "this object is not defined yet".
      //
      // However, JSON does not make such differences and it is impossible to
      // transmit undefined in a valid JSON way. Given the server & client
      // exchanges always in JSON, there's no real way to tell that an object
      // values undefined.
      //
      // To make it behave correctly still, it assumes that undefined === null
      // and so clamp null from the server to undefined here.
      if (response === null) {
        return undefined;

      } else {
        return response;
      }
    });

    this.lastRequestPromise = requestPromise;
    return requestPromise;
  };

  NetPersistenceProviderImpl.prototype.updateObject = function(spaceName, key, content) {
    var requestPromise = this.waitRequest().then(function() {
      return $http.post(
        baseUrl + "/update-object",
        {
          "space": spaceName,
          "key": key,
          "content": content
        }
      );
    }).then(this.parseResponse);

    this.lastRequestPromise = requestPromise;
    return requestPromise;
  };

  NetPersistenceProviderImpl.prototype.deleteObject = function(spaceName, key) {
    var requestPromise = this.waitRequest().then(function() {

    });

    this.lastRequestPromise = requestPromise;
    return requestPromise;
  };

  function NetPersistenceProvider($httpArg, $qArg, baseUrlArg) {
    $http   = $httpArg;
    $q      = $qArg;
    baseUrl = baseUrlArg;

    return new NetPersistenceProviderImpl();
  }

  return NetPersistenceProvider;
});
