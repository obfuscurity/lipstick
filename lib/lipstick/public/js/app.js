
// Namespace our application
App = Ember.Application.create();

// Map our routes
App.Router.map(function() {
  this.route('sites', { path: '/sites' }),
  this.route('sites.show', { path: '/sites/:site_id' })
});

// Enable URL history without hashchange
App.Router.reopen({
  location: 'history'
});

// Create our Sites route
App.SitesRoute = Ember.Route.extend({
  model: function() {
    var sitesArray = [];
    this.controllerFor('sites').fetchSiteData(function(sites) {
      sites.forEach(function(site) {
        sitesArray.pushObject(App.Site.create(site));
      });
    });
    return sitesArray;
  }
});

// Create our Sites/Show route
App.SitesShowRoute = Ember.Route.extend({
  model: function(params) {
    var parentData = this.modelFor('sites');
    return parentData.findBy('id', params.site_id);
  }
});

// Define our refresh settings
var enableSiteDataRefresh = true;
var siteDataRefreshInterval = 5000;

// Create our Sites controller
App.SitesController = Ember.ArrayController.extend({

  // Refresh our Sites data on interval
  updateSiteDataOnInterval: function() {
    Ember.run.later(this, this.updateSiteData, siteDataRefreshInterval)
  }.on('init'),

  // Retrieves our Sites data from the API
  fetchSiteData: function(cb) {
    var self = this;
    if (enableSiteDataRefresh) {
      $.ajax({
        accepts: {json: 'application/json'},
        cache: false,
        dataType: 'json',
        error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
        this: this,
        url: '/api/sites'
      }).done(function(d) {
        cb(d);
      });
    }
  },

  updateSiteData: function() {
    var self = this;
    this.fetchSiteData(function(sites) {
      self.set('model', []);
      sites.forEach(function(site) {
        self.get('model').pushObject(App.Site.create(site))
      });
      console.log(sites.length + ' sites reported');
      self.updateSiteDataOnInterval();
    });
  }
});

App.Site = Ember.Object.extend({
  status: function() {
    return (this.events.length > 0) ? 'critical' : 'ok';
  }.property('events.length')
});
