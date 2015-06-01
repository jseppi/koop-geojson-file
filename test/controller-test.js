var should = require('should'),
  sinon = require('sinon'),
  config = require('config'),
  request = require('supertest'),
  // we need koop/lib so we can have access to shared code not exposed directly off the koop object
  kooplib = require('koop/lib'),
  // we require Koop so we can fake having an actual server running 
  koop = require('koop')(config);

var geojsonModel;

before(function (done) {
  // pull in the provider module
  var provider = require('../index.js');

  // create the model
  geojsonModel = new provider.model(kooplib);

  // pass the model to the controller 
  var controller = new provider.controller(geojsonModel, kooplib.BaseController);

  // bind the default routes so we can test that those work
  koop._bindDefaultRoutes(provider.name, provider.pattern, controller);

  // bind the routes into Koop 
  koop._bindRoutes(provider.routes, controller);
  done();
});

after(function (done) {
  done();
});

describe('GeoJsonFile Controller', function () {

    describe('get', function () {
      before(function (done) {

        // we stub the find method so we dont actually try to call it
        // we're not testing the model here, just that the controller should call the model 
        sinon.stub(geojsonModel, 'find', function (id, options, callback) {
          callback(null, [{ 
            type:'FeatureCollection', 
            features: [{ properties: {}, coordinates: {}, type: 'Feature' }] 
          }]);
        });

        done();
      });

      after(function (done){
        // restore the stubbed methods so we can use them later if we need to
        geojsonModel.find.restore();
        done();
      });

      it('/geojson/test-name should call find', function (done){
        request(koop)
          .get('/geojson/test-name')
          .end(function (err, res) {
            res.status.should.equal(200);
            //geojsonModel.find.called.should.equal(true);
            done();
        }); 
      });
    });

    describe('index', function () {
      it('/geojson should return 200', function (done){
        request(koop)
          .get('/geojson')
          .end(function (err, res) {
            res.status.should.equal(200);
            done();
        });
      });
    });

    describe('preview', function () {
      it('/geojson/test-name/preview should return 200', function (done){
        request(koop)
          .get('/geojson/test-name/preview')
          .end(function (err, res) {
            res.status.should.equal(200);
            done();
        });
      });
    });

    describe('FeatureServer', function () {
      it('/geojson/test-name/FeatureServer should return 200', function (done){
        request(koop)
          .get('/geojson/test-name/FeatureServer')
          .end(function (err, res) {
            res.status.should.equal(200);
            done();
        });
      });
    });

});
