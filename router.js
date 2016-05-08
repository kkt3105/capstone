// binding member controller
var member = require('./controllers/member-controller.js');
var data = require('./controllers/data-controller.js');
var info = require('./controllers/info-controller.js');

exports.route = function(app) {
  app.get('/', function(req, res) {
    var string = 'pages/';
    string+='index';

    res.render(string);
  });
  app.post('/test', member.test);

  app.post('/Sign_Out', member.signOut);
  app.post('/Sign_In', member.signIn);
  app.post('/Sign_Up', member.signUp);

  app.post('/Send_Heartrate_Log', data.sendHeartrateLog);
  app.post('/Send_Activity_Log', data.sendActivityLog);

  app.post('/Receive_Heartrate_Log', data.receiveHeartrateLog);
  app.post('/Receive_Activity_Log', data.receiveActivityLog);

  app.post('/Receive_Management_Info', info.receiveManagementInfo);
  app.post('/Receive_Volunteer_Info', info.receiveVolunteerInfo);

};
