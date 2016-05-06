var mysql = require('mysql');
var connection = require('../db.js').getConnection();
var TABLE = 'user';


exports.test = function (req, res){
        console.log(req.body.memberID);
        console.log(req.body.memberPassword);

        if(req.body.memberPassword==0){
            console.log("sucess");
        }
        res.end();

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
  connection.query('SELECT * FROM '+ TABLE + ' WHERE login_id='+"'"+req.body.memberID+"'", function(err, db, fields){
    var login;
    if(err) { // Error
      console.log('ERROR! : '+ err);
      throw err;
    }
    if(db.length == 0){    // User ID is not exist;
      login=false;
      console.log('ID:'+ req.body.memberID +' does not exist!');
    }else if(db[0].login_pw != req.body.memberPassword){ // Password is not correct
      login=false;
      console.log('Password is not correct!');
    }else{  // Login success
      login=true;
      //req.session.memberID = req.body.memberID;//
      console.log('Login Success!');
    }
    var jsonData={};
    if(login){
        jsonData.login_status=true;
    }else{
        jsonData.login_status=false;
    }
    //res.redirect('/');
    res.writeHead(200, {
        "Content-Type":"application/json"
    });
    res.end(JSON.stringify(jsonData));

  });
};


exports.signUp = function(req, res){
  connection.query('SELECT * FROM '+ TABLE + ' WHERE login_id='+"'"+req.body.memberID+"'", function(err, db, fields){
    if(err){
      console.log('ERROR! : '+ err);
      throw err;
    }
    var signUp=false;

    if(db.length != 0){
        signUp=false;
      console.log('ID:'+ req.body.memberID +' does already exist!');
    }
    else if(req.body.memberID.length > 15 ||
        req.body.memberPassword.length > 15 ||
        req.body.memberType.length > 15 ||
        req.body.memberName.length > 20 ||
        req.body.meberAge > 999 ||
        req.body.memberGender.length > 4 ||
        req.body.memberAddress.length > 100 ||
        req.body.memberTel.length > 13
    ){
      signUp=false;
      console.log('Input is too long!');
    }
    else if(req.body.memberID.length == 0 ||
        req.body.memberPassword.length == 0 ||
        req.body.memberType.length == 0 ||
        req.body.memberName.length == 0 ||
        req.body.meberAge <= 0 ||
        req.body.memberGender.length == 0 ||
        req.body.memberAddress.length == 0 ||
        req.body.memberTel.length == 0
    ){
      signUp=false;
      console.log('Input should not be empty!');
  }else {
      signUp = true;
  }


    if(signUp){
      var post = {
          login_id:req.body.memberID,
          login_pw:req.body.memberPassword,
          user_type:req.body.memberType,
          user_name:req.body.memberName,
          user_age:req.body.memberAge,
          user_gender:req.body.memberGender,
          user_address:req.body.memberAddress,
          user_tel:req.body.memberTel,
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
    //res.redirect('/');
    res.writeHead(200, {
        "Content-Type":"application/json"
    });
    res.end(JSON.stringify(jsonData));
  });
};
