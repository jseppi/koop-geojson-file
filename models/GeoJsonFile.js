var fs = require('fs');
var assert = require('assert');
var path = require('path');
var find = require('array-find');
var chokidar = require('chokidar');
var gjValidation = require('geojson-validation');
var gjNormalize = require('geojson-normalize');

var GeoJsonFile = function (koop) {

  var type = 'GeoJsonFile';
  var model = {};
  model.__proto__ = koop.BaseModel(koop);

  var registeredFilePaths = koop.config.geojsonFiles;
  if (!registeredFilePaths || !registeredFilePaths.length) {
    throw new Error("geojsonFiles array must be specified in config");
  }
  var watcher = chokidar.watch(registeredFilePaths);
  watcher.on('change', function (filePath) {
    //on file change, just remove from cache so that the next call to find
    // will reload it
    var fileName = getFileName(filePath);
    koop.Cache.remove(type, fileName, {}, function (/* err, success */) {});
  });

  function getFileName(filePath) {
    return path.basename(filePath, path.extname(filePath));
  }

  function getRegisteredFilePath(fileName) {
    var foundPath = find(registeredFilePaths, function (registeredFilePath) {
      return getFileName(registeredFilePath) === fileName;
    });
    return foundPath;
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

  //fileName should be the root fileName, with no path or extension
  model.find = function (fileName, options, callback) {
    
    // check the cache for data with this type & fileName 
    koop.Cache.get(type, fileName, options, function (err, entry) {
      if (err) {
        // if we get an err then get the data and insert it 
        var filePath = getRegisteredFilePath(fileName);
        if (!filePath) {
          throw new Error("GeoJson file not found: " + fileName);
        }

        getFeatureCollection(filePath, function (error, featureCollection) {
          assert.ifError(error);

          koop.Cache.insert(type, fileName, featureCollection, 0, function (err, success) {
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
