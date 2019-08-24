const mysql = require('mysql');
const moment = require('moment');
require('dotenv').config();

// To connect to mysql
//https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server
// run in mysql
//ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'smooth';
const db_config = {
  host     : process.env.host,
  user     : process.env.user,
  password : process.env.password,
  database : process.env.database,
  dateStrings: 'date'
};

var connection;

// https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('Error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }else{
      console.log('MySQL connected ...');
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      console.log("throw error");
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();


function insertLink (input, callback) {

  input['createdDate'] = moment(Date.now()).format('YYYY-MM-DD');
  input['star'] = false;
  input['completed'] = false;
  
  connection.query('INSERT INTO links SET ?', input,  (err, result) => {
      if (err) {
        callback({"status":"error"});
        throw err;
      }
      callback({"status":"success"});
  });
  
}

function updateLink (input, callback) {

  connection.query('UPDATE links SET url = ?, title = ?, detail = ? WHERE linkId = ?', [input.url, input.title, input.detail, input.linkId],  (err, result) => {
      if (err) {
        callback({"status":"error"});
        throw err;
      }
      callback({"status":"success"});
  });
}

function deleteLink (input, callback) {

  connection.query('DELETE FROM links WHERE linkId = ?;', [input.linkId],  (err, result) => {
      if (err) {
        callback({"status":"error"});
        throw err;
      }
      callback({"status":"success"});
  });
}

function displayLinks(input, callback){

  var q = "SELECT * FROM links";
  
  if (input.sortby != null){
    
    if (input.sortby === "star" || input.sortby === "completed"){
      input.order = !input.order;
    }

    var order = input.order? "ASC" : "DESC";

    q += " ORDER BY " + input.sortby + " " + order;
  }

  q += ";";



  var query = connection.query(q, (err, result) => {
      if (err) throw err;
      callback(result);
  });
  
  //console.log(query.sql);
}


function search(input, callback){
  
  var q = "SELECT * FROM links WHERE ( title LIKE ? OR detail LIKE ?)";
  
  if (input.sortby != null){
    
    if (input.sortby === "star" || input.sortby === "completed"){
      input.order = !input.order;
    }

    var order = input.order? "ASC" : "DESC";

    q += " ORDER BY " + input.sortby + " " + order;
  }


  q += ";";

  var query = connection.query(q, ['%'+ input.query + '%', '%' + input.query + '%'], (err, result) => {
    if (err) throw err;
    callback(result);
  });

}

function getLinksCount(callback){
  
  connection.query('SELECT COUNT(*) as count FROM links;',  (err, result) => {
      if (err) throw err;
      callback(result);
  });
  
}

function checkExist(input, callback){

  var query = connection.query('SELECT COUNT(*) as count FROM links WHERE url=?', [input], (err, result) => {
      if (err) throw err;
      callback(result[0]);
  });

}


// both star and read are checkbox and use this function
function checkbox(input){

  connection.query('UPDATE links SET ?? = ? WHERE linkId = ?;', [input.field, input.status, input.linkId], (err, result) => {
      if (err) throw err;
  });
}

module.exports.checkExist = checkExist;
module.exports.deleteLink = deleteLink;
module.exports.insertLink = insertLink;
module.exports.displayLinks = displayLinks;
module.exports.getLinksCount = getLinksCount;
module.exports.checkbox = checkbox;
module.exports.updateLink = updateLink;
module.exports.search = search;

