const express= require('express')

const router=express.Router();

const ExcelController = require('../controllers/ExcelController');

router.route('/').post(async(req, res) => {
    const obj = req.body;
    const result = await ExcelController.AddDetailsFromExcel(obj);
    console.log(result)
    res.json(result);
});

module.exports = router;










 // const firstResult = results.shift();
  // console.log(firstResult);
  // const firstVariable = firstResult['מספר נסיעה']; // Using bracket notation
  // console.log(firstVariable);
 //   console.log(results);
   


//עובד
// const firstResult = results[0];
//   const firstKey = Object.keys(firstResult)[1];
//   const firstValue = firstResult[firstKey];
//   console.log(firstValue);