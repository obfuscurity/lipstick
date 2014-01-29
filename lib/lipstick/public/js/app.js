
// Namespace our application
App = Ember.Application.create();

// Define our refresh interval
App.sitesRefreshInterval = 2000;

// Track our max event counts for bubble size
App.maxEventsLength = 0;

// Retrieves our Sites data from the API
var fetchSites = function() {
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    url: '/api/sites'
  }).done(function(sites) {
    _.each(sites, function(site) {
      if (site.events.length > App.maxEventsLength) {
        App.maxEventsLength = site.events.length;
      }
      var newEvents = Ember.A();
      _.each(site.events, function(event) {
        d = event.duration.split(' ');
        day_seconds = parseInt(d[0].slice(0, -1)) * 86400;
        hour_seconds = parseInt(d[1].slice(0, -1)) * 3660;
        minute_seconds = parseInt(d[2].slice(0, -1)) * 60;
        seconds = parseInt(d[3].slice(0, -1));
        event.duration_seconds = day_seconds + hour_seconds + minute_seconds + seconds;
        newEvents.pushObject(Ember.Object.create(event));
      });
      site.events = newEvents;
    });
  }).fail(function(xhr, textStatus, errorThrown) {
    console.log('Unable to fetch sites: ' + errorThrown);
  });
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

    toggleAcknowledgeEvent: function(event) {
      if (event.get('acknowledged') == true) {
        $.ajax({
          accepts: {json: 'application/json'},
          cache: false,
          dataType: 'json',
          type: 'DELETE',
          url: '/api/sites/' + this.get('id') + '/events/' + event.id + '/acknowledge'
        }).success(function() {
          console.log('removed acknowledgement for event ' + event.id + ' successfully')
          event.set('acknowledged', !event.get('acknowledged'));
        }).fail(function(xhr, textStatus, errorThrown) {
          console.log('failed to remove acknowledgement for event' + event.id + ': ' + errorThrown);
        });
      } else {
        $.ajax({
          accepts: {json: 'application/json'},
          cache: false,
          dataType: 'json',
          type: 'POST',
          url: '/api/sites/' + this.get('id') + '/events/' + event.id + '/acknowledge'
        }).success(function() {
          console.log('acknowledged event ' + event.id + ' successfully')
          event.set('acknowledged', !event.get('acknowledged'));
        }).fail(function(xhr, textStatus, errorThrown) {
          console.log('failed to acknowledge event' + event.id + ': ' + errorThrown);
        });
      }
    },

    toggleDowntimeEvent: function(event) {
      if (event.get('downtime') == true) {
        this.cancelDowntimeEvent(event);
      } else {
        $('div#addDowntimeModal').modal();
        event.set('downtimeDuration', 300);
        this.set('currentDowntimeEvent', event);
      }
    },

    downtimeEvent: function(event) {
      this.addDowntimeEvent(event);
    },

    checkEvent: function(event) {
      $.ajax({
        accepts: {json: 'application/json'},
        cache: false,
        dataType: 'json',
        type: 'POST',
        url: '/api/sites/' + this.get('id') + '/events/' + event.id + '/check'
      }).success(function() {
        console.log('scheduled forced check for event ' + event.id + ' successfully')
      }).fail(function(xhr, textStatus, errorThrown) {
        console.log('failed to schedule forced check for event' + event.id + ': ' + errorThrown);
      });
    },

    sortEvents: function(column) {
      console.log('sorting on ' + column);
      if (this.get('model').get('sortReverse') == true) {
        this.get('model').set('sortReverse', false);
      } else {
        this.get('model').set('sortReverse', true);
      }
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
  },

  addDowntimeEvent: function(event) {
    var self = this;
    $.ajax({
      accepts: {json: 'application/json'},
      cache: false,
      data: {downtime_duration: event.downtimeDuration, comment: event.comment},
      dataType: 'json',
      type: 'POST',
      url: '/api/sites/' + this.get('id') + '/events/' + event.id + '/downtime'
    }).success(function() {
      console.log('set downtime for event ' + event.id + ' successfully')
      event.set('downtime', !event.get('downtime'));
      $('div#addDowntimeModal').modal('hide');
    }).fail(function(xhr, textStatus, errorThrown) {
      console.log('failed to set downtime for event ' + event.id + ': ' + errorThrown);
    });
  },

  cancelDowntimeEvent: function(event) {
    $.ajax({
      accepts: {json: 'application/json'},
      cache: false,
      dataType: 'json',
      type: 'DELETE',
      url: '/api/sites/' + this.get('id') + '/events/' + event.id + '/downtime'
    }).success(function() {
      console.log('removed downtime for event ' + event.id + ' successfully')
      event.set('downtime', !event.get('downtime'));
    }).fail(function(xhr, textStatus, errorThrown) {
      console.log('failed to remove downtime for event ' + event.id + ': ' + errorThrown);
    });
  }
})

// Create a Site object
App.Site = Ember.Object.extend({

  status: function() {
    return (this.events.length > 0) ? 'critical' : 'ok';
  }.property('events.length'),

  hardEvents: function() {
    return this.events.filter(function(event) {
      attempts = event.attempts.split('/');
      return attempts[0] === attempts[1];
    });
  }.property('events'),

  hardEventsStatus: function() {
    if (App.maxEventsLength > 0) {
      var pct = this.get('hardEvents').length / App.maxEventsLength;
      switch (true) {
        case (pct > 0.75):
          return 'critical largest';
          break;
        case (pct > 0.50):
          return 'critical larger';
          break;
        case (pct > 0.25):
          return 'critical large';
          break;
        case (pct > 0.0):
          return 'critical';
          break;
      }
    } else {
      return 'ok';
    }
  }.property('hardEvents.length'),

  sortedEvents: function() {
    var sortColumn = this.get('sortColumn');
    if (sortColumn !== null) {
      mySortedEvents = this.get('events').sortBy(sortColumn)
      if (this.get('sortReverse') == true) {
        return mySortedEvents.reverseObjects();
      } else {
        return mySortedEvents;
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
  },

  afterModel: function(model) {
    model.set('sortColumn', 'duration');
    model.set('sortReverse', false);
  }
});
