angular.module('searchApp')
  .factory('ContextService', function($http, Context) {

    var data = {};
    var children = {};

    /**
     * Initialize the data. We create a promise that is added to the service
     * and should be resolved before we can continue.
     */
    var query = {'query': {'match_all': {}}};
    var promise = $http
      .post('http://127.0.0.1:9200/hzbwnature/context/_search?size=1000', query)
      .success(function (res) {
        var contexts = res.hits.hits.map(Context.build)

        // dictionary url > Context
        data = contexts.reduce(function (o, v, i) {
            o[v.id] = v;
            return o;
          }, {});
        data['ROOT'] = Context.root();

        // dictionary url > array[Context]
        children = contexts.reduce(function (o, v, i) {
          if (typeof o[v.supercontext] === 'undefined') {
            o[v.supercontext] = [v];
          } else {
            o[v.supercontext].push(v);
          }
          return o;
        }, {});
      });

    // Actual return object
    return {

      /**
       * This promise should be resolved in the search initialization,
       * and makes sure all information is available
       * @type {promise}
       */
      promise: promise,

      /**
       * Get all contexts
       * @return {dictionary hash > Context}
       */
      all: function () {
        return data;
      },

      /**
       * Get one context by URL
       * @param  {string} hash
       * @return {Context}
       */
      get: function (hash) {
        return data[hash];
      },

      /**
       * Get the children of a certain context
       * @param  {string} url
       * @return {array[Context]}
       */
      children: function (hash) {
        if (typeof children[hash] === 'undefined') {
          return [];
        } else {
          return children[hash];
        }
      },

      /**
       * Trace 
       * @param  {[type]} url
       * @param  {[type]} list
       * @return {[type]}
       */
      trace: function (hash, list) {
        list = typeof list !== 'undefined' ? list : [];
        list.unshift(hash);
        if (hash === 'ROOT') {
          return list
        } else {
          var me = this.get(hash);
          if (typeof me === 'undefined') {
            return list;
          }
          var parent = me.superid;
          return this.trace(parent, list);
        }
      }
    };
  });