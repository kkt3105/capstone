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


  // 심박수 정보 DB 저장
  app.post('/Send_Heartrate_Log', data.sendHeartrateLog);
  // 활동량 정보 DB 저장
  app.post('/Send_Activity_Log', data.sendActivityLog);

  // 심박수 정보 인출
  app.post('/Receive_Heartrate_Log', data.receiveHeartrateLog);
  // 활동량 정보 인출
  app.post('/Receive_Activity_Log', data.receiveActivityLog);

  // 담당정보 등록
  app.post('/Send_Management_Info', info.sendManagementInfo);

  // 담당정보 인출
  app.post('/Receive_Management_Info', info.receiveManagementInfo);
  // 봉사기록 인출
  app.post('/Receive_Volunteer_Info', info.receiveVolunteerInfo);
  // 노인 목록 인출
  app.post('/Senior_List', info.seniorList);


};
