//app
const userRouter = require('./routers/usersRouter')
const treeRouter = require('./routers/treeRouter')
const ExcelRouter = require('./routers/ExcelRouter')
const cheackDriver = require('./routers/driversRouter')
const cheackManager = require('./routers/managerRouter')
const messegeTravel = require('./routers/messegeTravelRouter')
const MesseageDriverRouter = require('./routers/MesseageDriverRouter')
const MessegeT = require('./routers/MessegeTRouter')
const DeleteAllDetails = require('./routers/managerRouter')

const express = require('express');
const cors = require('cors')
const connectDB = require('./configs/db');
const axios=require('axios')
const port = 8000;

const app = express();

// db.connect();
app.use(cors());
//to get JSON in the request body
app.use(express.json());
connectDB();
app.use('/users', userRouter)
app.use('/tree', treeRouter)
app.use('/drivers', cheackDriver)
app.use('/manager', cheackManager)
app.use('/travels', userRouter)
app.use('/messegeTravel', messegeTravel)
app.use('/MessageD', MesseageDriverRouter)
app.use('/MessageT', MessegeT)
app.use('/DELETEDETAILS', DeleteAllDetails)




//*******************EXCEL***********************/
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

app.post('/upload-csv', upload.single('file'), (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        try {
            const result =axios.post(`http://localhost:8000/Excel/`, results);
            console.log(result);
        } catch (error) {
            console.error(error);
        }
      app.use('/Excel',ExcelRouter)
      res.json({ success: true });
    });

});

//****************************************************/
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});























//*************************************************/
//ReadFromExcelApp
// const express = require('express');
// const app = express();
// const multer = require('multer');
// const csv = require('csv-parser');
// const fs = require('fs');


// const upload = multer({ dest: 'uploads/' });

// app.post('/upload-csv', upload.single('file'), (req, res) => {
//   const results = [];

//     fs.createReadStream(req.file.path)
//     .pipe(csv())
//     .on('data', (data) => results.push(data))
//     .on('end', () => {
//       // Do something with the results (e.g. save to a database)
//       console.log(results);

//       // Send a response back to the client
//       res.json({ success: true });
//     });
// });

// app.listen(8000, () => {
//   console.log('Server is listening on port 8000');
// });
