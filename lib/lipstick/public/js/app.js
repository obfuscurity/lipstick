
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
    }).done(function(sites) {
      _.each(sites, function(site) {
        _.each(site.events, function(event) {
          d = event.duration.split(' ');
          day_seconds = parseInt(d[0].slice(0, -1)) * 86400;
          hour_seconds = parseInt(d[1].slice(0, -1)) * 3660;
          minute_seconds = parseInt(d[2].slice(0, -1)) * 60;
          seconds = parseInt(d[3].slice(0, -1));
          event.duration_seconds = day_seconds + hour_seconds + minute_seconds + seconds;
        });
      });
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

// Explicit Site controller so we can bind actions
App.SitesShowController = Ember.ObjectController.extend({
  actions: {
    sort: function(column) {
      console.log('sorting on ' + column);
      this.get('model').set('sortColumn', column);
    }
  }
})

// Create a Site object
App.Site = Ember.Object.extend({

  status: function() {
    return (this.events.length > 0) ? 'critical' : 'ok';
  }.property('events.length'),

  sortedEvents: function() {
    var sortColumn = this.get('sortColumn');
    if (sortColumn !== null) {
      if (sortColumn === 'duration') {
        return this.get('events').sort(function(e1, e2) {
          return e1.duration_seconds - e2.duration_seconds;
        });
      } else {
        return this.get('events').sort(function(e1, e2) {
          if (e1[sortColumn] > e2[sortColumn]) {
            return 1;
          } else if (e1[sortColumn] < e2[sortColumn]) {
            return -1;
          } else {
            return 0;
          }
        });
      }
    } else {
      console.log('no sortColumn');
      return this.get('events');
    }
  }.property('events')

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
