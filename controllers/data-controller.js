var mysql = require('mysql');
var connection = require('../db.js').getConnection();
require('date-utils');

var HeartRateTABLE = 'heartrate_log';
var SensorDataTABLE = 'activity_log';

function isAuthenticated(req, res, callback){
    connection.query('SELECT login_id FROM authentication WHERE token='+"'"+req.body.token+"'", function(err, db, fields){
        var flag;
        if(err){
            console.log('error: '+err);
            throw err;
        }

        if(db.length != 0){
            flag= true;
        }else {
            flag= false;
        }
        callback (flag, db[0].login_id);
    });
}

exports.sendHeartrateLog = function (req, res){
    var flag = false;
    var condition = false;
    isAuthenticated(req, res, function(flag){
        if(flag){
            if( req.body.heartrate <=0 || req.body.heartrate > 999 ){
                    condition = false;
                    console.log('HR is out of range!');

            }else {
                condition = true;
            }

            var dt = new Date();
            var d = dt.toFormat('YYYYMMDDHH24MISS');
            if (condition){
                var post = {
                    login_id:login_id,
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

    }});


        var jsonData={};
        if(flag){
            jsonData.status=true;
        }
        else{
            jsonData.status=false;
        }
        //res.redirect('/');
        res.writeHead(200, {
            "Content-Type":"application/json"
        });
        res.end(JSON.stringify(jsonData));

};

exports.sendActivityLog = function (req, res){


    var flag = false;
    var condition = false;
    isAuthenticated(req, res, function(flag, login_id){
        if(flag){
                if( req.body.modified_data.length == 0 || req.body.modified_data.length > 10 ){
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
                        login_id:login_id,
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

        }});

            var jsonData={};
            if(flag){
                jsonData.status=true;
            }
            else{
                jsonData.status=false;
            }
            //res.redirect('/');
            res.writeHead(200, {
                "Content-Type":"application/json"
            });
            res.end(JSON.stringify(jsonData));

};
exports.receiveHeartrateLog = function (req, res){
    /* login_id, type, period*/
    // type 0 all
    // type 1 date
    // type 2 period\

    isAuthenticated(req, res, function(flag, login_id){
        if(flag){
                    if(req.body.type == 0){
                        connection.query('SELECT * FROM '+ HeartRateTABLE +' WHERE login_id='+"'"+login_id+"'", function(err, db, fields){
                            var jsonData = {};
                            jsonData.status = flag;
                            jsonData.data = db;
                            res.writeHead(200, {"Content-Type":"application/json"});
                            res.end(JSON.stringify(jsonData));
                        });
                    }else if(req.body.type == 1){

                    }else if(req.body.type == 2){

                    }
        }else {
            var jsonData = {};
            jsonData.status = flag;
            res.writeHead(200, {"Content-Type":"application/json"});
            res.end(JSON.stringify(jsonData));
        }
    });




    // else {
    //     console.log(456456);
    //
    //     var jsonData={};
    //     jsonData.status=false;
    //     res.writeHead(200, {
    //         "Content-Type":"application/json"
    //     });
    //     res.end(JSON.stringify(jsonData));
    // }
};
exports.receiveActivityLog = function (req, res){
    isAuthenticated(req,res);

    // type 0x all
    // type 1x date
    // type 2x period
    // type xY Sensor type is 'Y'
};
