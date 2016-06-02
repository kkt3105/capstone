var mysql = require('mysql');
var crypto = require('crypto');
var db=require('../db.js');
var connection = db.getConnection();
var gcm = require('node-gcm');//

var TABLE = 'user';
var authTABLE = 'authentication';

exports.test = function (req, res){
    connection.query("SELECT token FROM authentication where login_id ='" + req.body.senior_id + "'", function(err, db){
        if(err){
            throw err;
        }else {
            var message = new gcm.Message();
            var message = new gcm.Message({
                collapseKey: 'Gcm Test',
                delayWhileIdle: true,
                timeToLive: 3,
                data: {
                    data: 'Gcm Receive Success'
                }
            });

            var server_api_key ='AIzaSyBdvyTF-YfPkjmGS1bwmFriYopBW3IlSGQ';
            var sender = new gcm.Sender(server_api_key);
            var registrationIds = [];

            for(i=0; i<db.length; i++){
                console.log(i + " 해당 노인 토큰 " + db[i].token);
                registrationIds.push(db[i].token);
            }
            if(db.length != 0){
                sender.send(message, registrationIds, 4, function (err, result) {
                    console.log(result);
                });
            }
        }
    });
    jsonData={};
    res.writeHead(200, {"Content-Type":"application/json"});
    res.end(JSON.stringify(jsonData));

};

function randomValueBase64 (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
}

exports.signOut = function(req, res){

    var jsonData={};
    db.isAuthenticated(req, res, function(flag, login_id){
        if(flag){
            connection.query('DELETE FROM '+ authTABLE +' WHERE login_id = '+"'" + login_id + "'", function(err, db, fields){
                if(err){
                    throw err;
                }else{
                    jsonData.logout_status=true;
                    res.writeHead(200, {"Content-Type":"application/json"});
                    res.end(JSON.stringify(jsonData));
                }
            });
        }else {
            jsonData.logout_status=false;
            res.writeHead(404, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });

};

exports.signIn = function(req, res){
    console.log(req.body);
  connection.query('SELECT * FROM '+ TABLE + ' WHERE login_id='+"'"+req.body.login_id+"'", function(err, db, fields){
    var login;
    if(err) { // Error
      console.log('ERROR! : '+ err);
      throw err;
    }
    if(db.length == 0){    // User ID is not exist;
      login=false;
      console.log('ID:'+ req.body.login_id +' does not exist!');
    }else if(db[0].login_pw != req.body.login_pw){ // Password is not correct
      login=false;
      console.log('Password is not correct!');
    }else{  // Login success
      login=true;
      console.log('Login Success!');
    }
    var jsonData={};
    if(login){
        //var login_token = randomValueBase64(13).toString();
        //jsonData.token = req.body.token;
        jsonData.login_status=true;
        //jsonData.token=login_token;
        jsonData.user_type=db[0].user_type;

        var post = {
            login_id:req.body.login_id,
            token:req.body.token
        };

        connection.query('SELECT * FROM '+ authTABLE + ' WHERE login_id='+"'"+req.body.login_id+"'", function(err, db2, fields){
            if(db2.length == 0){
                connection.query('INSERT INTO '+ authTABLE + ' SET ?', post, function(err, db3){
                  if(err){
                      console.log('ERROR! : '+ err);
                      throw err;
                  }
                  console.log('token inserted!');
                });
            }else {
                connection.query('UPDATE '+ authTABLE + ' SET token='+"'"+req.body.token+"'"+ ' WHERE login_id='+"'"+req.body.login_id+"'", function(err, db3){
                  if(err){
                      console.log('ERROR! : '+ err);
                      throw err;
                  }
                  console.log('token updated!');
                });
            }
        });
        res.writeHead(200, {
            "Content-Type":"application/json"
        });
        res.end(JSON.stringify(jsonData));

    }else{
        jsonData.login_status=false;
        res.writeHead(404, {
            "Content-Type":"application/json"
        });
        res.end(JSON.stringify(jsonData));
    }


  });
};


exports.signUp = function(req, res){
  connection.query('SELECT * FROM '+ TABLE + ' WHERE login_id='+"'"+req.body.login_id+"'", function(err, db, fields){
    if(err){
      console.log('ERROR! : '+ err);
      throw err;
    }
    var info = "";
    var signUp=false;

    if(db.length != 0){
        signUp=false;
        info = "이미 가입되어 있는 계정";
      console.log('ID:'+ req.body.login_id +' does already exist!');
    }
    else if(req.body.login_id.length > 15){
        signUp=false;
        info = "아이디가 너무 깁니다.";
    }
  else if(req.body.login_pw.length > 15){
      signUp=false;
      info = "비밀번호가 너무 깁니다.";
  }
  else if(req.body.user_type.length > 15){
      signUp=false;
      info = "유저 타입 오류";
  }
  else if(req.body.user_name.length > 20){
      signUp=false;
      info = "이름이 너무 깁니다.";
  }
  else if(req.body.user_gender.length > 4){
      signUp=false;
      info = "성별 오류";
  }
  else if(req.body.user_address.length > 250){
      signUp=false;
      info = "주소가 너무 깁니다.";
  }
  else if(req.body.user_tel.length > 11){
      signUp=false;
      info = "전화번호가 너무 깁니다.";
  }
  else if(req.body.login_id.length == 0){
      signUp=false;
      info = "아이디가 빈칸입니다.";
  }
else if(req.body.login_pw.length ==0){
    signUp=false;
    info = "비밀번호가 빈칸입니다.";
}
else if(req.body.user_type.length ==0){
    signUp=false;
    info = "유저 타입 오류";
}
else if(req.body.user_name.length ==0){
    signUp=false;
    info = "이름이 빈칸입니다.";
}
else if(req.body.user_gender.length ==0){
    signUp=false;
    info = "성별 오류";
}
else if(req.body.user_address.length ==0){
    signUp=false;
    info = "주소가 빈칸입니다.";
}
else if(req.body.user_tel.length ==0){
    signUp=false;
    info = "전화번호가 빈칸입니다.";

  }else {
      signUp = true;
  }


    if(signUp){
      var post = {
          login_id:req.body.login_id,
          login_pw:req.body.login_pw,
          user_type:req.body.user_type,
          user_name:req.body.user_name,
          user_gender:req.body.user_gender,
          user_address:req.body.user_address,
          user_tel:req.body.user_tel,
          latitude:req.body.latitude,
          longitude:req.body.longitude,
          user_birthdate:req.body.user_birthdate

      };
      connection.query('INSERT INTO user SET ?', post, function(err, db2){
        if(err){
            signUp = false;
            info = "DB오류";
            console.log('ERROR! : '+ err);
            throw err;
        }else{
            var post2 = {
                login_id : req.body.login_id,
                high_zone_2 : parseInt( (220 - (2017 - req.body.user_birthdate/10000))*0.85 ),
                high_zone_1 : parseInt( (220 - (2017 - req.body.user_birthdate/10000))*0.5 ),
                low_zone_1 : 40
            }
            if(req.body.user_type == 'senior'){
                connection.query('INSERT INTO senior_list SET ?', post2, function(err, db3){
                    if(err){
                        signUp = false;
                        info = "DB오류";
                        console.log('ERROR! : '+ err);
                        throw err;
                    }
                        signUp=true;
                        console.log('Successfully signed up!');
                });
            }else{
                signUp=true;
                console.log('Successfully signed up!');
            }
            //console.log();

        }
      });
    }

    var jsonData={};
    if(signUp){
        jsonData.status=true;
        res.writeHead(200, {
            "Content-Type":"application/json"
        });
        res.end(JSON.stringify(jsonData));
    }
    else{
        jsonData.status=false;
        jsonData.info = info;
        res.writeHead(404, {
            "Content-Type":"application/json"
        });
        res.end(JSON.stringify(jsonData));
    }

  });
};
