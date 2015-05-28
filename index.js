// the name of provider is used by koop to help build default routes for FeatureService and a preview
exports.name = 'geojson';

// the "pattern" is used to build routes
// this provider uses filenames (without the extension)
exports.pattern = '/:filename';

// attached the controller to the provider 
exports.controller = require('./controller');

// attaches the routes file to the provider 
exports.routes = require('./routes');

// attaches the model to the provider to be passed into the controller at start up time 
exports.model = require('./models/GeoJsonFile.js');
