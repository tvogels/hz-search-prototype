angular.module('searchApp')
  .factory('Context', function($http, Base64) {

    /**
     * Constructor
     * @param {string} url
     * @param {string} name
     * @param {string} vn
     * @param {string} supercontext
     */
    function Context(url, name, vn, supercontext) {
      this.id = url;
      this.url = url;
      this.encurl = Base64.encode(url);
      this.name = name;
      this.vn = vn || url;
      this.supercontext = supercontext || 'ROOT';
      this.superid = this.supercontext;
    }

    /**
     * Static method: is the context the root context
     * @return {Boolean}
     */
    Context.prototype.isRoot = function () {
      return this.url === 'ROOT';
    };

    /**
     * Create a context instance from ElasticSearch data  
     * @param  {object} data
     * @return {Context}
     */
    Context.build = function (data) {

      var vns = data['_source']['vn_pages'],
          vn = undefined;

      if (vns.length > 0) {
        vn = vns[0];
      }

      return new Context(
        data['_source']['url'],
        data['_source']['name'],
        vn,
        data['_source']['supercontext']
      )
    };

    Context.prototype.link = function () {
      if (typeof this.vn === 'undefined') {
        return this.url;
      } else {
        return this.vn
      }
    };

    Context.root = function () {
      return new Context('ROOT', 'DeltaExpertise', null, null);
    }

    return Context;

  });