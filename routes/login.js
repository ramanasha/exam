var express = require('express');
var router = express.Router();
var config = require('../config/config');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
const crypto = require("crypto");
const random = require("./../utils/random");
const Base64 = require("./../utils/base64");
var filebuffer = fs.readFileSync(config.db_path);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', {title: 'login'});
});
router.post('/userLogin', function (req, res, next) {
  var uname = req.body.username;//获取前台请求的参数
  var password = req.body.password;

  var db = new sqlite3.Database(config.db_path, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  var sql = 'SELECT * FROM users WHERE username="' + uname + '"';
  db.get(sql, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    if (!row) {
        result = {
            code: 300,
            msg: '该账号不存在'
          };
      res.json(result);
    } else {
        var sql = "select password from users where username=?";
        db.get(sql,[uname], (err, row) => {
        if (err) {
          result = {
            code: 400,
            msg: '查询失败'
          };
          res.json(result);
        } else {
            var temp = row.password; 
            let base64Random = temp.substring(0,12);
            let newPas = base64Random + password;
            let md5 = crypto.createHash("md5");
            let md5Pas = md5.update(newPas).digest("hex");
            let base64 = new Base64();
            let base64Md5 = base64.encode(md5Pas);
            let lastPassword = base64Random + base64Md5;
            req.session.username = uname;
            if (temp == lastPassword) {
              result = {
                code: 200,
                msg: '密码正确'
              };
            } else {
              result = {
                code: 400,
                msg: '密码错误'
              };
            }
          res.json(result);
        }

      });

    }

  });
  db.close((err) => {
    if (err) {
    }
    console.log('Close the database connection.');
  });
});
module.exports = router;