
var Controller = function(GeoJsonFile, BaseController) {

  // inherit from the base controller to share some logic 
  var controller = {};
  controller.__proto__ = BaseController();

  // respond to the root route
  controller.index = function (req, res) {
    res.send('This is a GeoJsonFile provider');
  };

  // get a resource from the providers model 
  controller.get = function (req, res) {
    GeoJsonFile.find(req.params.name, req.query, function (err, data) {
      if (err){
        res.send(err, 500);
      } else {
        res.json(data);
      }
    });
  };
  
  // use the shared code in the BaseController to create a feature service
  controller.featureserver = function (req, res) {
    var callback = req.query.callback;
    delete req.query.callback;

    GeoJsonFile.find(req.params.name, req.query, function (err, data) {
      if (err) {
        res.send(err, 500);
      } else {
        // we remove the geometry if the "find" method already handles geo selection in the cache
        delete req.query.geometry;
        // inherited logic for processing feature service requests 
        controller.processFeatureServer(req, res, err, data, callback);
      }
    });
  };

  // render templates and views 
  controller.preview = function (req, res) {
    res.render(__dirname + '/../views/demo',
      {name: req.params.name}
    );
  };
  
  // return the controller so it can be used by koop
  return controller;

};

module.exports = Controller;

