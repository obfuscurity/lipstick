
// Namespace our application
App = Ember.Application.create();

// Map our routes
App.Router.map(function() {
  this.resource('sites', { path: '/sites' }, function() {
    this.route('show', { path: '/:site_id' })
  })
});

// Enable URL history without hashchange
App.Router.reopen({
  location: 'history'
});

// Create our Sites route
App.SitesRoute = Ember.Route.extend({
  model: function() {
    return [];
  }
});

// Create our Sites/Show route
App.SitesShowRoute = Ember.Route.extend({
  model: function(params) {
    return Ember.Object.create({
      id: params.site_id
    });
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
        self.set('model', d);
        console.log(d.length + ' sites reported');
        self.updateOnInterval();
      });
    }
  }
});
