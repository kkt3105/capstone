var mysql = require('mysql');
var connection = require('../db.js').getConnection();
require('date-utils');

var TABLE = 'heartrate_log';


exports.test = function (req, res){
    var dt = new Date();
    var d = dt.toFormat('YYYYMMDDHH24MISS');

    var post = {
        login_id:req.body.memberID,
        date:d,
        heartrate:req.body.heartrate
    };
    console.log(post);

    res.end();

}
