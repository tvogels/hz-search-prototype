var app = angular.module('searchApp', ['ui.router','angular-md5','ngAnimate']);




app.config(function($stateProvider, $urlRouterProvider) {
  
  $urlRouterProvider.otherwise("/search/water/ROOT");

  $stateProvider
    .state('search', {
      url: "/search/:query",
      controller: 'SearchCtrl',
      templateUrl: 'partials/main.html',
      resolve: {
        InitializeContexts: function (ContextService) {
          return ContextService.promise;
        },
        SearchResults: function (SearchService, $stateParams) {
          return SearchService.search($stateParams.query);
        }
      }
    })
    .state('search.details', {
      url: "/details",
      controller: 'DetailsCtrl',
      templateUrl: 'partials/details.html'
    })
    .state('search.results', {
      url: "/:base64url",
      controller: 'ResultsCtrl',
      templateUrl: 'partials/results.html',
      resolve: {
        url: function ($stateParams, Base64) {
          if ($stateParams.base64url === 'ROOT') return 'ROOT';
          return Base64.decode($stateParams.base64url);
        }
      }
    });

});


app.controller('SearchCtrl', function ($scope, ContextService, $stateParams, $state, $window, Base64) {
  $scope.form = {};
  $scope.form.searchQuery = $stateParams.query;
  $scope.search = function (query) {
    $state.go('search.results',{'query': query,'base64url': 'ROOT'});
  };
  $scope.query = $stateParams.query;
  $scope.goback = false;
  $scope.browse = function (to, from) {
    $window.scrollTo(0,0);
    if (to === 'details') {
      $scope.goback = true;
      $state.go('search.details');
      return;
    } else if (from === '') {
      $scope.goback = false;
    } else if (from === 'details') {
      $scope.goback = false;
    } else {
      var toDepth = ContextService
        .trace(to)
        .length;
      var fromDepth = ContextService
        .trace(from)
        .length;
      $scope.goback = fromDepth > toDepth;
    }
    var encoded = Base64.encode(to);
    $state.go('search.results',{'base64url':encoded});
  };

});

app.controller('DetailsCtrl', function (SearchService, $scope) {
  $scope.count = SearchService.contextCount;
  $scope.tree = [SearchService.contextTree('ROOT')];
});

app.controller('ResultsCtrl', function (ContextService, SearchService, $scope, url) {

  // get the current context
  var context = ContextService.get(url);
  $scope.context = context;

  // get the children
  var directChildContexts = ContextService.children(url).map(function (cntxt) {
    return cntxt.id;
  });

  // and the trace
  $scope.trace = ContextService.trace(url).map(function (node) {
    return ContextService.get(node);
  });

  var results = SearchService.contextResults(url);

  var activeContexts = [];
  var selection = results.slice(0,12);

  console.log(selection);
  var resultsPerContext = {'GENERAL': []};

  selection.forEach(function (result) {
    var myContexts = flatten(result.contexts.map(function (cntxt) {
      return ContextService.trace(cntxt);
    }));
    var intersection = array_intersection(myContexts.sort(), directChildContexts.sort());
    if (intersection.length > 0) {
      // intersection contains direct children of the current context
      // see if there are active ones
      var alreadyActive = array_intersection(intersection, activeContexts.sort());

      if (alreadyActive.length > 0) {
        // ok, take that one
        resultsPerContext[alreadyActive[0]].push(result);
      } else {
        activeContexts.push(intersection[0]);
        resultsPerContext[intersection[0]] = [result];
      }

    } else {
      resultsPerContext['GENERAL'].push(result);
    }
  });

  $scope.contextInfo = ContextService.get;
  $scope.count = SearchService.contextCount;
  $scope.activeContexts = activeContexts;
  $scope.resultsPerContext = resultsPerContext;
});
