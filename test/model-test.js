var should = require('should'),
  config = require('config'),
  kooplib = require('koop/lib');

var GeoJsonFile;

before(function (done) {
  GeoJsonFile = new require('../models/GeoJsonFile.js')(kooplib);
  done();
});

describe('GeoJsonFile Model', function (){

    describe('when getting data', function (){
      it('should find and return geojson', function (done){
        GeoJsonFile.find('test-name', {}, function (err, data){
          // there should not be any errors
          should.not.exist(err);
          // should always return the data as geojson
          should.exist(data);
          // data should be an array (support multi layer responses)
          data.length.should.equal(1);
          // make sure we have a feature collection
          data[0].type.should.equal('FeatureCollection');
          done();
        });
      });

    });

});

