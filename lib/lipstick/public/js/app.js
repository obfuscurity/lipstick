App = Ember.Application.create();

// Router - sites
App.Router.map(function() {
  this.resource('sites', function() {
    this.route('show', { path: '/:site_id' })
  })
});

App.SitesRoute = Ember.Router.extend();

App.SitesShowRoute = Ember.Router.extend({
  model: function(params) {
    Ember.Object.create({
      id: params.site_id
    })
  }
});

