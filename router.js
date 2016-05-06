// binding member controller
var member = require('./controllers/member-controller.js');
var data = require('./controllers/data-controller.js');

exports.route = function(app) {
  app.get('/', function(req, res) {
    var string = 'pages/';
    string+='index';

    res.render(string);
  });
  
  app.post('/Sign_Out', member.signOut);
  app.post('/Sign_In', member.signIn);
  app.post('/Sign_Up', member.signUp);
  app.post('/test', member.test);
  app.post('/test2', data.test);
};
