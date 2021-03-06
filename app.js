/**
 * CleverTech Stub Application
 */

// Get everything ready
var config = require('./config')
  , express = require('express')
  , webPort = process.env.NODE_WWW_PORT || config.webPort || 8080
  , env = process.env.NODE_ENV || config.environmentName || 'development'
  , initializeRoutes = require('./routes')
  , loader = require('./src/components/Loader.js')
  , Sequelize = require('sequelize')
  , app = express();

// Setup ORM
var sequelize = new Sequelize(
    config.db.database, 
    config.db.username, 
    config.db.password,
    config.db.options
);

// Get our models
var models = require('./src/model')(sequelize, config);

app.configure(function() {

    // application variables, part of a config block maybe?
    app.set('port', webPort);
    app.set('config', config);
    app.set('models', models);
    app.set('loader', loader);
    app.set('db', sequelize);

    // middleware stack
    app.use(express.bodyParser());

    // session management
    app.use(express.cookieParser());
    app.use(express.session({
        secret: config.secretKey
    }));

    app.use(express.logger('dev'));
    app.use(express.compress());
    app.use(express.favicon());
    app.use(express.methodOverride());
    app.use(app.router);

    // static file delivery
    app.use(express['static'](__dirname + '/public'));

    app.set('views', __dirname + '/src/views')
    app.set('view engine', 'ejs');
    app.set('view options', {
        layout: false
    });

    // error handler, outputs json since that's usually
    // what comes out of this thing
    app.use(function(err, req, res, next) {
        console.log('Express error catch', err);
        res.json(500, {
            error: err.toString()
        });
    });
});

//

// register application routes
initializeRoutes(app);

// start server
app.listen(webPort, function() {
    console.log("Starting server on port " + webPort + " in " + config.environmentName + " mode");
});