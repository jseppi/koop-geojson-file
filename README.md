# koop-geojson-file

![](https://img.shields.io/npm/v/koop-geojson-file.svg)

GeoJSON file provider for Koop 

Based on code from [koop-sample-provider](https://github.com/koopjs/koop-sample-provider)

### Usage

For information on using Koop, see https://github.com/esri/koop 

Install dependencies:

```sh
npm install koop koop-geojson-file express ejs
```

Make sure your `config` contains a `geojsonFiles` key that holds an array of objects with `name` and `path` properties for each GeoJSON file you'd like to serve as a FeatureService. See example code below:

```javascript
var config = {
  "server": {"port": 1337},
  "geojsonFiles": [
    {"name": "test-name", "path": "/data/test-file.geojson"},
    {"name": "other-name", "path": "/data/other-file.geojson"}
  ]
};

var koop = require('koop')(config);
var koopGeoJson = require('koop-geojson-file');

koop.register(koopGeoJson);

var express = require('express');
var app = express();

app.use(koop);

app.listen(process.env.PORT || config.server.port,  function() {
  console.log("Listening at http://%s:%d/", this.address().address, this.address().port);
});
```

koop-geojson-file uses the `name` property of the objects in `geojsonFiles` to route. For example, with the `geojsonFiles` as defined in the above example, routes to FeatureServices would be:

- http://localhost:1337/geojson/test-name/FeatureServer
- http://localhost:1337/geojson/test-name/FeatureServer/0
- http://localhost:1337/geojson/other-name/FeatureServer
- http://localhost:1337/geojson/other-name/FeatureServer/0

### Developing

```sh
git clone https://github.com/jseppi/koop-geojson-file.git
cd koop-geojson-file
npm install
npm test
```
