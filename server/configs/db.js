const { default: mongoose } = require('mongoose');

const connectDB = () => {
    mongoose
      .connect('mongodb://0.0.0.0:27017/UserServer')
      .then(() => console.log('Connected to DB'))
      .catch((err) => console.log(err))
};

module.exports = connectDB;






















//******************************************************** */


// const sql = require('mssql');

// const config = {
//   user: '',
//   password: '',
//   server: 'DESKTOP-39M5QH5',
//   database: '',
// };
// 
// connection.connect(err => {
//     if (err) {
//         console.log('Error connecting to SQL Server:', err);
//         return;
//     }

//     console.log('Connected to SQL Server.');
// });

// 

// const request = connection.request();

// request.query('SELECT * FROM yourtablename', (err, result) => {
//     if (err) {
//         console.log('Error executing query:', err);
//         return;
//     }

//     console.log('Query results:', result.recordset);
// });
// connection.close();




//((((((((((())))))))))) async function connect() {
//   try {
//     await sql.connect(config);
//     console.log('Connected to SQL Server database');
//   } catch (error) {
//     console.error(error);
//   }
// })))))))






// var mysql = require('mysql');

// var con = mysql.createConnection({
//   host: "localhost",
//   user: "myusername",
//   password: "DESKTOP-39M5QH5",
//   database: "mydb"
// });

// con.connect(function(err) {
//     if (err) throw err;
//     /*Select all customers with the address "Park Lane 38":*/
//     con.query("SELECT * FROM customers WHERE address = 'Park Lane 38'", function (err, result) {
//       if (err) throw err;
//       console.log(result);
//     });
// });






// module.exports = {connect}


