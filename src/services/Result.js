angular.module('searchApp')
  .factory('Result', function($http,md5) {

    /**
     * Constructor
     */
    function Result(url, title, contexts, type, score,vn) {
      this.id = url;
      this.url = url;
      this.title = title;
      this.vn = vn;
      if (angular.isArray(contexts)) {
        this.contexts = contexts;
      } else {
        this.contexts = [];
      }
      this.type = type;
      this.score = score;
    }

    Result.prototype.link = function () {
      if (typeof this.vn === 'undefined') {
        return this.url;
      } else {
        return this.vn
      }
    };

    /**
     * Create a Result instance from ElasticSearch data  
     * @param  {object} data
     * @return {Result}
     */
    Result.build = function (data) {

      var vns = data['_source']['suggest']['payload']['vn_pages'],
          vn = undefined;

      if (vns.length > 0) {
        vn = vns[0];
      }

      return new Result(
        data['_source']['url'],
        data['_source']['title'],
        data['_source']['context'],
        data['_type'],
        data['_score'],
        vn
      );
    };

    return Result;

  });