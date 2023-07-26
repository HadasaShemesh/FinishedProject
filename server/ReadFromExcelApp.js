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