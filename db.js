const sqlite3 = require("sqlite3").verbose();

let connect = new sqlite3.Database(
  "./database.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  err => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the database.");
  }
);

module.exports = {
  deleteTable:()=>{
    const sql = `DROP TABLE IF EXISTS doc;`
    connect.run(sql, err => {
      if (err) {
        reject(err);
      }
      resolve();
    })
  }, 
  createTable: () => {
    return new Promise((resolve, reject) => {
      const sql = `CREATE TABLE IF NOT EXISTS doc (id INTEGER PRIMARY KEY AUTOINCREMENT,
      stt INTEGER, nname TEXT, sex TEXT, dob TEXT, phone TEXT, status BOOLEAN, check_in_kimma BOOLEAN, check_in_bv BOOLEAN, note TEXT)`;
      connect.run(sql, err => {
        if (err) {
          reject(err);
        }
        resolve();
      })
    })
  },

  create: (input, res) => {
    const sql = "INSERT INTO doc (stt, name, sex, dob, phone, status, check_in_kimma, check_in_bv, note) VALUES (?,?,?,?,?,?,?,?,?)";
    const data = [input.stt, input.name, input.sex, input.dob, input.phone, input.status, input.check_in_kimma, input.check_in_bv, input.note];

    return new Promise(function (resolve, reject) {
      connect.run(sql, data, err => {
        if (err) {
          reject(err);
        }
        console.log('Create success');
        resolve({ message: "Create Success" });
      });
    });
  },

  //Lấy ds dữ liệu
  getall: request => {
    const length = "SELECT COUNT(*) AS length FROM doc;";

    //const request = [req.body.limit, req.body.offset];
    const sql = "SELECT * FROM doc ORDER BY Id DESC LIMIT ? OFFSET ? ;";
    return new Promise(function (resolve, reject) {
      connect.all(sql, request, (err, data) => {
        if (err) {
          reject(err);
        }
        connect.all(length, (err, results) => {
          if (err) {
            reject(err);
          }
          //console.log(results);
          resolve({ data, length: results[0].length });
        });
      });
    });
  },

  update: (input) => {
    let sql = `UPDATE doc
            SET check_in_kimma = ?,
            check_in_bv = ?,
            note=?
            WHERE id = ?`;
    return new Promise(function (resolve, reject) {
      connect.run(sql, input, (err, data) => {
        if (err) {
          reject(err);
        }
        console.log("success");
        resolve({ message: "Success" });
      });
    });
  },

  //xoá dữ liệu
  delete: id => {
    //const request = [req.body.limit, req.body.offset];
    const sql = "DELETE FROM db WHERE Id = ?;";
    return new Promise(function (resolve, reject) {
      connect.run(sql, id, (err, data) => {
        if (err) {
          reject(err);
        }
        console.log(id);
        console.log("delete success");
        resolve({ message: "Delete Success" });
      });
    });
  }
};