Lipstick
========

![screenshot](https://github.com/obfuscurity/lipstick/raw/master/lib/lipstick/public/img/screenshot.png "Lipstick")

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
* `NAGIOS_VERSION` - Version of Nagios (e.g. `3` or `4`), needed by nagios-api.
* `NAGIOS_DATE_FORMAT` - Date format used by Nagios (e.g. `us`, `iso8601`, etc), needed by nagios-api.
* `FORCE_HTTPS` - If set, causes Rack to redirect all insecure HTTP connections to HTTPS.
* `SSL_VERSION` - String used to force a specific SSL version (e.g. `SSLv3`) for any backend HTTPS connections to Nagios.
* `SSL_VERIFY_NONE` - Used to override SSL peer verification. Do not use this unless you have a good reason. You have been warned.

### Local

```bash
$ bundle install
$ foreman start
$ open http://127.0.0.1:5000
```

### Heroku

It's suggested that you keep separate `.env` and `.env-production` files for development and production, respectively. The former will be loaded automatically by `foreman` when you run locally. The latter can be used to set your Heroku config vars (see below).

```bash
$ heroku create
$ for var in ``cat .env.production``; do heroku config:set $var; done
$ heroku addons:add mongohq
$ heroku config:set MONGODB_URI=`heroku config:get MONGOHQ_URL`
$ git push heroku master
$ heroku scale web=1
$ heroku open
```

## License 

Lipstick is distributed under the MIT license.

