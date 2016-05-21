var member = require('./controllers/member-controller.js');
var data = require('./controllers/data-controller.js');
var info = require('./controllers/info-controller.js');
var request = require('./controllers/req-controller.js');

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

  // 담당정보 등록 - 관리사
  app.post('/Send_Management_Info', info.sendManagementInfo);
  // 담당노인 HR 설정
  app.post('/Set_HR', info.setHR);
  // 봉사기록 인출 - 봉사자
  app.post('/Receive_Volunteer_Info', info.receiveVolunteerInfo);
  // 노인 목록 인출 - 봉사자(3Km 이내), 노인(3Km 이내), 관리사/id,이름(담당하고 있는)
  app.post('/Senior_List', info.seniorList);
  // 노인 정보 인출(senior_id) - 관리사/모든정보, 봉사자/이름,위치,전화번호 , 노인/이름,위치,전화번호
  app.post('/Senior', info.senior);

  // 요청 기록 인출 - 봉사자, 노인
  app.post('/Request_List', request.list);
  // 요청 승인 - 봉사자, 노인
  app.post('/Accept_Request', request.accept);
  // 요청 - 봉사자(노인id, 언제, 얼마나), 노인(언제, 얼마나, 내용)
  app.post('/Request', request.request);


};
