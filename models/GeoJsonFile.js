var R = require('ramda');
var fs = require('fs');
var assert = require('assert');
var chokidar = require('chokidar');
var gjValidation = require('geojson-validation');
var gjNormalize = require('geojson-normalize');

var GeoJsonFile = function (koop) {

  var type = 'GeoJsonFile';
  var model = {};
  model.__proto__ = koop.BaseModel(koop);

  var geojsonFiles = koop.config.geojsonFiles;


  if (!geojsonFiles || !geojsonFiles.length) {
    throw new Error("geojsonFiles array must be specified in config");
  }

  var filePaths = R.pluck('name', geojsonFiles);
  var watcher = chokidar.watch(filePaths);
  watcher.on('change', function (filePath) {
    //on file change, just remove from cache so that the next call to find
    // will reload it
    var name = nameForPath(filePath);
    if (name) {
      koop.Cache.remove(type, name, {}, function (/* err, success */) {});
    }
  });

  function nameForPath(path) {
    var found = R.find(R.propEq('path', path), geojsonFiles) || {};
    return found.name;
  } 

  function pathForName(name) { 
    var found = R.find(R.propEq('name', name), geojsonFiles) || {};
    return found.path;
  }

  function getFeatureCollection(filePath, callback) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function (error, result) {
      if (error) {
        callback(error, null);
        return;
      }

      result = JSON.parse(result);
      
      if (!gjValidation.valid(result)) {
        throw new Error("Invalid GeoJson file");
      }

      //koop expects results to be an array of FeatureCollections
      var featureCollection = [gjNormalize(result)];

      callback(null, featureCollection);
    });
  }

  model.find = function (name, options, callback) {
    
    // check the cache for data with this type & name 
    koop.Cache.get(type, name, options, function (err, entry) {
      if (err) {
        // if we get an err then get the data and insert it 
        var filePath = pathForName(name);
        if (!filePath) {
          throw new Error("GeoJson file not found: " + name);
        }

        getFeatureCollection(filePath, function (error, featureCollection) {
          assert.ifError(error);

          koop.Cache.insert(type, name, featureCollection, 0, function (err, success) {
            assert.ifError(err);
            if (success) {
              callback(null, featureCollection);
            }
          });

        });
      }
      else {
        callback(null, entry);
      }
    });
  };

  return model;
};

module.exports = GeoJsonFile;
