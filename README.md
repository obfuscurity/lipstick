Lipstick
========

## Overview

Lipstick is a unified dashboard for collecting and presenting Nagios activity across multiple sites. It uses a MongoDB database for storing Nagios site configuration and event data.

## Usage

## Deployment

Lipstick supports a number of _optional_ environment variables. These can be set explicitly in the environment or in an `.env` file, supported by [Foreman](http://ddollar.github.io/foreman/#ENVIRONMENT).

* `MONGODB_URI` - MongoDB connection string URI and database name. Defaults to `mongodb://127.0.0.1:27017/development`.
* `EVENTS_UPDATE_ON_BOOT` - If set to `false`, disables the default behavior of loading all Nagios events into cache at startup.
* `EVENTS_UPDATE_INTERVAL` - How frequently to update all Nagios events into the cache. Defaults to `60` (seconds).
* `NAGIOS_USER` - Username for authenticating to the Nagios backend(s).
* `NAGIOS_PASS` - Password for authenticating to the Nagios backend(s).
* `FORCE_HTTPS` - If set, causes Rack to redirect all insecure HTTP connections to HTTPS.
* `SSL_VERSION` - String used to force a specific SSL version (e.g. `SSLv3`) for any backend HTTPS connections to Nagios.

### Local

```bash
$ bundle install
$ foreman start
$ open http://127.0.0.1:5000
```

### Heroku

```bash
$ heroku create
$ heroku addons:add mongohq
$ heroku config:set MONGODB_URI=`heroku config:get MONGOHQ_URL`
$ git push heroku master
$ heroku scale web=1
$ heroku open
```

## License 

Lipstick is distributed under the MIT license.

