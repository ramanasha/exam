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
  res.render('register', { title: 'register' });
});
router.post('/userRegister', function (req, res, next) {
  var uname = req.body.username;
  var password = req.body.password;
  var name = req.body.name;
  var email = req.body.email;

    let randomWord = random(false,8);
    let base64 = new Base64();
    let base64Random = base64.encode(randomWord);
    let newPas = base64Random + password;
    let md5 = crypto.createHash("md5");
    let md5Pas = md5.update(newPas).digest("hex");
    let base64Md5 = base64.encode(md5Pas);
    let lastPassword = base64Random + base64Md5;

  var db = new sqlite3.Database(config.db_path, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });

  var sql = 'SELECT * FROM users WHERE username="' + uname + '"';

  // first row only
  db.get(sql, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    if (row) {
      result = {
        code: 300,
        msg: '该账号已存在'
      };
      res.json(result);
    } else {
      db.run('INSERT INTO users (username, password,name,email) VALUES(?,?,?,?)', [uname, lastPassword, name, email], function (err) {
        if (err) {
          console.log(err.message);
          result = {
            code: 400,
            msg: '注册失败'
          };
          res.json(result);
        } else {
          // get the last insert id
          console.log(`A row has been inserted with rowid ${this.lastID}`);
          result = {
            code: 200,
            msg: '注册成功'
          };
          res.json(result);
        }

      });

    }

  });
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });

});
module.exports = router;