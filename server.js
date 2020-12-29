var http = require('http');
var url = require('url');
var fs = require('fs');
var mysql = require('mysql');

var port = 5000;
var dbhost = "localhost";
var dbn = "license";
var dbpw = "license";
var dbuser = "license";

var con = mysql.createConnection({
    host: dbhost,
    database : dbn,
    user: dbuser,
    password: dbpw
  });
  
  con.connect(function(err) {
    if (err) throw err;

    con.query("CREATE TABLE IF NOT EXISTS LICENSE (id INT AUTO_INCREMENT PRIMARY KEY, license VARCHAR(40), name VARCHAR(40), ip VARCHAR(40))", function (err, result) {
        if(err) throw err;
    });

  });


var requestListener = function(req, res) {
    res.setHeader("Content-Type", "application/json");
    if(req.url.toString().startsWith("/license")) {
            var q = url.parse(req.url, true).query;
            if(q.license != null) {
                handleLicense(q.license, res);
            } else {
                res.writeHead(404)
                res.end(JSON.stringify({
                    "found": false,
                    "regip": "No IP",
                    "reguser": "No User",
                    "extra": "No License Paramater given!"
                }));
            }
          } else {
            fs.readFile("index.html", function(err, data) {
                if(err) throw err;
                
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.write(data);
                return res.end();
            });
          }
}

var handleLicense = function(license, res) {
    con.query("SELECT * FROM LICENSE WHERE license=\"" + license + "\"", function(err, result) {
        if(err) throw err;

        if(result.toString().length > 4) {
            sendEverythingJson(license, res);
        } else {
            res.writeHead(404)
            res.end(JSON.stringify({
                "found": false,
                "regip": "No IP",
                "reguser": "No User",
                "extra": "Couldnt find the requsted License!"
            }));
        }
    });
}

var sendEverythingJson = function(license, res) {

    con.query("SELECT * FROM LICENSE WHERE license=\"" + license + "\"", function(err, result, field) {
        res.writeHead(200);
        res.end(JSON.stringify({
            "found": true,
            "regip": (JSON.parse(JSON.stringify(result[0]))).ip.toString(),
            "reguser": (JSON.parse(JSON.stringify(result[0]))).name.toString(),
            "extra": "No Extra Informations!"
          }));
    });
}

var server = http.createServer(requestListener);
server.listen(port, "localhost", () => {
    console.log("Server running on Port " + port)
});
