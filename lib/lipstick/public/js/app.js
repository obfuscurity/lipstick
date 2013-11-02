
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
    return [];
  },
  setupController: function(controller, model) {
    controller.set('model', model);
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

  // Load our Sites data on init
  initializeSiteData: function() {
    this.updateSiteData();
  }.on('init'),

  // Refresh our Sites data on interval
  updateOnInterval: function() {
    Ember.run.later(this, this.updateSiteData, siteDataRefreshInterval)
  }.on('init'),

  // Retrieves our Sites data from the API
  updateSiteData: function() {
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
        self.set('model', []);
        d.forEach(function(site) {
          self.get('model').pushObject(App.Site.create(site))
        })
        console.log(d.length + ' sites reported');
        self.updateOnInterval();
      });
    }
  }
});

App.Site = Ember.Object.extend({
  status: function() {
    return (this.events.length > 0) ? 'critical' : 'ok';
  }.property('events.length')
});
