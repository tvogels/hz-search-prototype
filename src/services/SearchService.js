angular.module('searchApp')
  .factory('SearchService', function($http, Result, ContextService, $filter) {

    var results = [];

    var resultsPerContext = {};
    var directResultsPerContext = {};

    /**
     * This fills the resultsPerContext & directResultsPerContext objects
     */
    function populateContextResults () {
      resultsPerContext = {};
      directResultsPerContext = {};
      results.forEach(function (res) {
        res.contexts.forEach(function (url) {
          // add to the direct results
          if (typeof directResultsPerContext[url] !== 'undefined') {
            directResultsPerContext[url].push(res);
          } else {
            directResultsPerContext[url] = [res];
          }

          // add the whole t
          var trace = ContextService.trace(url);
          trace.forEach(function (node) {          
            if (typeof resultsPerContext[node] !== 'undefined') {
              resultsPerContext[node].push(res);
            } else {
              resultsPerContext[node] = [res];
            }
          });
        });
      });
      for (var key in resultsPerContext) {
        if (resultsPerContext.hasOwnProperty(key)) {
          resultsPerContext[key] = $filter('unique')(resultsPerContext[key],'id');
        }
      }
    }

    return {

      /**
       * Search: populate results variable and return it as a promise
       * @param  {string} query
       * @return {promise[array]}
       */
      search: function (string) {
        var query = {
          'query': {
            'multi_match': {
              'query': string,
              'fields': [
                "skos:prefLabel^3",
                "skos:definition",
                "title^3",
                "content",
                "concerns_readable^2",
                "context_readable^2"
              ]
            }
          }
        };
        return $http
          .post('http://127.0.0.1:9200/hzbwnature/_search?size=200',query)
          .then(function (res) {
            results = res.data.hits.hits.map(Result.build);
            populateContextResults();
            return results;
          });
      },

      contextTree: function (url) {
        var _this = this;
        var context = ContextService.get(url);
        if (this.contextCount(url) > 8) {
          var children = [];
          ContextService.children(url).forEach(function (child) {
            if (_this.contextCount(child.id) > 0) {
              children.push(child);
            } else {
            }
          });
          context.children = children.map(function (child) {
            return _this.contextTree(child.id);
          });
        } else {
          context.children = [];
        }
        return context;
      },

      directContextCount: function (url) {        
        if (typeof directResultsPerContext[url] === 'undefined') {
          return 0;
        } else {
          return directResultsPerContext[url].length;
        }
      },

      contextCount: function (url) {        
        if (typeof resultsPerContext[url] === 'undefined') {
          return 0;
        } else {
          return resultsPerContext[url].length;
        }
      },

      contextResults: function (url) {        
        if (typeof resultsPerContext[url] === 'undefined') {
          return [];
        } else {
          return resultsPerContext[url];
        }
      }


    };
  });