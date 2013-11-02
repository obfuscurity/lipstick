App = Ember.Application.create();

// Router - sites
App.Router.map(function() {
  this.resource('sites', { path: '/sites' }, function() {
    this.route('show', { path: '/:site_id' })
  })
});

App.Router.reopen({
  location: 'history'
});

App.SitesRoute = Ember.Route.extend({
  model: function() {
    return [];
  }
});

App.SitesShowRoute = Ember.Route.extend({
  model: function(params) {
    return Ember.Object.create({
      id: params.site_id
    });
  }
});

var enableSiteDataRefresh = true;
var siteDataRefreshInterval = 5000;

App.SitesController = Ember.ArrayController.extend({

  initializeSiteData: function() {
    this.updateSiteData();
  }.on('init'),

  updateOnInterval: function() {
    Ember.run.later(this, this.updateSiteData, siteDataRefreshInterval)
  }.on('init'),

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
