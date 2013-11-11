
// Namespace our application
App = Ember.Application.create();

// Define our refresh settings
App.enableSitesRefresh = true;
App.sitesRefreshInterval = 5000;

// Retrieves our Sites data from the API
var fetchSites = function() {
  if (App.enableSitesRefresh) {
    return $.ajax({
      accepts: {json: 'application/json'},
      cache: false,
      dataType: 'json',
      error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
      url: '/api/sites'
    });
  }
};

// Map our routes
App.Router.map(function() {
  this.resource('sites', { path: '/sites' }, function() {
    this.route('index', { path: '/' });
    this.route('show', { path: '/:site_id' });
  });
});

// Enable URL history without hashchange
App.Router.reopen({
  location: 'history'
});

// Create a Site object
App.Site = Ember.Object.extend({
  status: function() {
    return (this.events.length > 0) ? 'critical' : 'ok';
  }.property('events.length')
});

// Create our Sites route
App.SitesRoute = Ember.Route.extend({

  model: function() {
    return fetchSites().then(function(sites) {
      return sites.map(function(site) {
        return App.Site.create(site);
      });
    });
  },

  afterModel: function(model) {
    var poll = function() {
      fetchSites().then(function(sites) {
        var sitesMap = model.reduce(function(memo, site) {
          memo[site.get('id')] = site;
          return memo;
        }, {});
        sites.forEach(function(site) {
          var foundSite = sitesMap[site.id];
          if (foundSite) {
            foundSite.setProperties(site);
          } else {
            model.pushObject(App.Site.create(site));
          }
        });
        this.afterModel(model);
      }.bind(this));
    };
    Ember.run.later(this, poll, App.sitesRefreshInterval);
  }
});

// Create our Sites index route
App.SitesIndexRoute = Ember.Route.extend({
  model: function() {
    return this.modelFor('sites');
  }
});

// Create our Sites show route
App.SitesShowRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('sites').findBy('id', params.site_id);
  }
});
