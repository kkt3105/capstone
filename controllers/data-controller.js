var mysql = require('mysql');
var connection = require('../db.js').getConnection();
require('date-utils');

var HeartRateTABLE = 'heartrate_log';
var SensorDataTABLE = 'activity_log';

exports.sendHeartrateLog = function (req, res){
    var flag = false;
    var condition = false;
    connection.query('SELECT * FROM user WHERE login_id='+"'"+req.body.login_id+"'", function(err, db, fields){
        if(err){
            console.log(err);
            throw err;
        }
        if(db.length == 0){
            condition = false;
            console.log('User does not exist!');
        }else if( req.body.heartrate <=0 || req.body.heartrate > 999 ){
                condition = false;
                console.log('HR is out of range!');

        }else {
            condition = true;
        }

        var dt = new Date();
        var d = dt.toFormat('YYYYMMDDHH24MISS');
        if (condition){
            var post = {
                login_id:req.body.login_id,
                date:d,
                heartrate:req.body.heartrate
            };

            connection.query('INSERT INTO ' + HeartRateTABLE + ' SET ?', post, function(err, db2){
              if(err){
                  flag = false;
                  console.log('ERROR! : '+ err);
                  throw err;
              }else{
                  flag = true;
                  console.log('Successfully inserted!');
              }
            });
        }

        var jsonData={};
        if(flag){
            jsonData.insert_status=true;
        }
        else{
            jsonData.insert_status=false;
        }
        //res.redirect('/');
        res.writeHead(200, {
            "Content-Type":"application/json"
        });
        res.end(JSON.stringify(jsonData));

    });
};

exports.sendActivityLog = function (req, res){

        var flag = false;
        var condition = false;
        connection.query('SELECT * FROM user WHERE login_id='+"'"+req.body.login_id+"'", function(err, db, fields){
            if(err){
                console.log(err);
                throw err;
            }
            if(db.length == 0){
                condition = false;
                console.log('User does not exist!');
            }else if( req.body.modified_data.length == 0 || req.body.modified_data.length > 10 ){
                    condition = false;
                    console.log('Modified_data is out of range!');

            }else if( req.body.type_of_sensor < 0 || req.body.type_of_sensor > 9 ){
                    condition = false;
                    console.log('Type_of_sensor is out of range!');

            }else {
                condition = true;
            }

            var dt = new Date();
            var d = dt.toFormat('YYYYMMDDHH24MISS');
            if (condition){
                var post = {
                    login_id:req.body.login_id,
                    type_of_sensor:req.body.type_of_sensor,
                    date:d,
                    modified_data:req.body.modified_data
                };

                connection.query('INSERT INTO ' + SensorDataTABLE + ' SET ?', post, function(err, db2){
                  if(err){
                      flag = false;
                      console.log('ERROR! : '+ err);
                      throw err;
                  }else{
                      flag = true;
                      console.log('Successfully inserted!');
                  }
                });
            }

            var jsonData={};
            if(flag){
                jsonData.insert_status=true;
            }
            else{
                jsonData.insert_status=false;
            }
            //res.redirect('/');
            res.writeHead(200, {
                "Content-Type":"application/json"
            });
            res.end(JSON.stringify(jsonData));

        });
};
exports.receiveHeartrateLog = function (req, res){
    // type 0 all
    // type 1 date
    // type 2 period

    if(req.body.type == 0){
        connection.query('SELECT * FROM '+ HeartRateTABLE +' WHERE login_id='+"'"+req.body.login_id+"'", function(err, db, fields){
            var jsonData = {};
            jsonData.data = db;
            res.writeHead(200, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        });
    }
};
exports.receiveActivityLog = function (req, res){
    // type 0x all
    // type 1x date
    // type 2x period
    // type xY Sensor type is 'Y'
};
