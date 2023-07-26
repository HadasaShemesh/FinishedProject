const express = require('express')

const router = express.Router();

const treeController = require('../controllers/CheackTableTravel');

router.route('/').get(async(req, res) => {
    const result = await treeController.checkPassengerCount();
    res.json(result);
 });

module.exports = router;