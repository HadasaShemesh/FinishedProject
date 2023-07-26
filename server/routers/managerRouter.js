
const express= require('express')

const router=express.Router();

const managerController = require('../controllers/managerController');

router.route('/').post(async(req, res) => {
    const obj = req.body;
    const result = await managerController.checkManagerCredentials(obj);
    res.json(result);
});


router.route('/').get(async(req, res) => {
    const result = await managerController.DeleteAllDetails();
    res.json(result);
});

module.exports = router;