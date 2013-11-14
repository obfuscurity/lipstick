
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
    }).fail(function(xhr, textStatus, errorThrown) {
      console.log('Unable to fetch sites: ' + errorThrown);
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

// Explicit SitesIndex controller so we can bind create action
App.SitesIndexController = Ember.ArrayController.extend({
  actions: {
    createSite: function() {
      var name = this.get('inputName');
      var url = this.get('inputUrl');

      $.ajax({
        accepts: {json: 'application/json'},
        cache: false,
        data: {name: name, url: url},
        dataType: 'json',
        type: 'POST',
        url: '/api/sites'
      }).success(function() {
        $('#myModal').modal('hide')
      }).fail(function(xhr, textStatus, errorThrown) {
        console.log('Unable to fetch sites: ' + errorThrown);
      });
    }
  }
})

// Explicit Site controller so we can bind sort action
App.SitesShowController = Ember.ObjectController.extend({
  actions: {
    sortEvents: function(column) {
      console.log('sorting on ' + column);
      this.get('model').set('sortColumn', column);
    },
    destroySite: function() {
      console.log('destroying site id ' + this.get('id'));
      $.ajax({
        accepts: {json: 'application/json'},
        cache: false,
        dataType: 'json',
        type: 'DELETE',
        url: '/api/sites/' + this.get('id')
      }).success(function() {
        $('#myModal').modal('hide')
        console.log('XXX fix to show sites index instead');
      }).fail(function(xhr, textStatus, errorThrown) {
        console.log('Unable to destroy site: ' + errorThrown);
      });
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

//var attr = DS.attr();

App.Site = DS.Model.extend({
  id:         DS.attr('string'),
  name:       DS.attr('string'),
  url:        DS.attr('string'),
  created_at: DS.attr('date'),
  updated_at: DS.attr('date'),
  events:     DS.hasMany('event')
});

App.Event = DS.Model.extend({
  id:                  DS.attr('string'),
  host:                DS.attr('string'),
  host_extinfo_url:    DS.attr('string'),
  service:             DS.attr('string'),
  service_extinfo_url: DS.attr('string'),
  status:              DS.attr('string'),
  attempts:            DS.attr('string'),
  duration:            DS.attr('string'),
  extended_info:       DS.attr('string'),
  acknowledged:        DS.attr('boolean'),
  last_check:          DS.attr('date'),
  started_at:          DS.attr('date')
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api'
});

App.ApplicationAdapter.map('site', {
  events: { embedded: 'always' }
});

// Create our Sites route
App.SitesRoute = Ember.Route.extend({
  model: function(params) {
    console.log(this.get('store').find('site'));
    return this.get('store').findAll('site');
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
  },

  afterModel: function(model) {
    model.set('sortColumn', 'duration');
  }
});
