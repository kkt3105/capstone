var mysql = require('mysql');
var crypto = require('crypto');
var connection = require('../db.js').getConnection();
var TABLE = 'user';
var authTABLE = 'authentication';

exports.test = function (req, res){

        console.log(req.body.id);

        var jsonData = {};
        jsonData.data = req.body.id;
        res.writeHead(200, {"Content-Type":"application/json"});
        res.end(JSON.stringify(jsonData));
}

function randomValueBase64 (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
}

exports.signOut = function(req, res){

    var jsonData={};
    jsonData.logout_status=true;
    res.writeHead(200, {
        "Content-Type":"application/json"
    });
    res.end(JSON.stringify(jsonData));

};

exports.signIn = function(req, res){
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
        var login_token = randomValueBase64(13).toString();
        jsonData.login_status=true;
        jsonData.token=login_token;
        jsonData.user_type=db[0].user_type;

        var post = {
            login_id:req.body.login_id,
            token:login_token
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
                connection.query('UPDATE '+ authTABLE + ' SET token='+"'"+login_token+"'"+ ' WHERE login_id='+"'"+req.body.login_id+"'", function(err, db3){
                  if(err){
                      console.log('ERROR! : '+ err);
                      throw err;
                  }
                  console.log('token updated!');
                });
            }
        });


    }else{
        jsonData.login_status=false;
    }
    res.writeHead(200, {
        "Content-Type":"application/json"
    });
    res.end(JSON.stringify(jsonData));

  });
};


exports.signUp = function(req, res){
  connection.query('SELECT * FROM '+ TABLE + ' WHERE login_id='+"'"+req.body.login_id+"'", function(err, db, fields){
    if(err){
      console.log('ERROR! : '+ err);
      throw err;
    }
    var signUp=false;

    if(db.length != 0){
        signUp=false;
      console.log('ID:'+ req.body.login_id +' does already exist!');
    }
    else if(req.body.login_id.length > 15 ||
        req.body.login_pw.length > 15 ||
        req.body.user_type.length > 15 ||
        req.body.user_name.length > 20 ||
        req.body.user_age > 999 ||
        req.body.user_gender.length > 4 ||
        req.body.user_address.length > 100 ||
        req.body.user_tel.length > 11
    ){
      signUp=false;
      console.log('Input is too long!');
    }
    else if(req.body.login_id.length == 0 ||
        req.body.login_pw.length == 0 ||
        req.body.user_type.length == 0 ||
        req.body.user_name.length == 0 ||
        req.body.user_age <= 0 ||
        req.body.user_gender.length == 0 ||
        req.body.user_address.length == 0 ||
        req.body.user_tel.length == 0
    ){
      signUp=false;
      console.log('Input should not be empty!');
  }else {
      signUp = true;
  }


    if(signUp){
      var post = {
          login_id:req.body.login_id,
          login_pw:req.body.login_pw,
          user_type:req.body.user_type,
          user_name:req.body.user_name,
          user_age:req.body.user_age,
          user_gender:req.body.user_gender,
          user_address:req.body.user_address,
          user_tel:req.body.user_tel,
          latitude:req.body.latitude,
          longitude:req.body.longitude
      };

      connection.query('INSERT INTO user SET ?', post, function(err, db2){
        if(err){
            signUp = false;
            console.log('ERROR! : '+ err);
            throw err;
        }else{
            signUp=true;
            console.log('Successfully signed up!');
        }
      });
    }

    var jsonData={};
    if(signUp){
        jsonData.signup_status=true;
    }
    else{
        jsonData.signup_status=false;
    }
    res.writeHead(200, {
        "Content-Type":"application/json"
    });
    res.end(JSON.stringify(jsonData));
  });
};
