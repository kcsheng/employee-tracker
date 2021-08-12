const mysql = require("mysql2");
const mysqlConnect = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "test",
});
