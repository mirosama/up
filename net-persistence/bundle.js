define([
    "openmct",
    "./src/NetPersistenceProvider"
], function(openmct, NetPersistenceProvider) {
  openmct.legacyRegistry.register("net-persistence", {
    "extensions": {
      "components": [
        {
          "provides":         "persistenceService",
          "type":                       "provider",
          "implementation": NetPersistenceProvider,
          "depends": [
            "$http",
            "$q",
            "baseUrl"
          ]
        }
      ],

      "constants": [
        {
          "key": "baseUrl",
          "priorirty": "preferred",
          "value": "http://" + window.location.hostname + ":46872"
        }
      ]
    }
  });
})
