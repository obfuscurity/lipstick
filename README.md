Radial
======

## Overview

Radial is a unified dashboard for collecting and presenting Nagios activity across multiple sites.

## Usage

## Deployment

### Local

```bash
$ bundle install
$ export GRAPHITE_URL=...
$ foreman start
$ open http://127.0.0.1:5000
```

### Heroku

```bash
$ heroku create
$ heroku config:add GRAPHITE_URL=...
$ git push heroku master
$ heroku scale web=1
$ heroku open
```

## License 

Radial is distributed under the MIT license.

