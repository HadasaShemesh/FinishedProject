
const express = require('express')

const router = express.Router();

const driversController = require('../controllers/driversController');

router.route('/').post(async (req, res) => {
    const obj = req.body;
    const result = await driversController.checkDriverCredentials(obj);
    res.json(result);
});


router.route('/:id').get(async (req, res) => {
    const result = await driversController.getMessegesDriverById(req.params.id);
    res.json(result);
});

router.route('/').get(async (req, res) => {
    const obj = req.query;
    console.log(obj);
    const result = await driversController.GetAnswerFromDriver(obj);
    res.json(result);
});

module.exports = router;