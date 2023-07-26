const express = require('express')

const router = express.Router();

const MessageTConroller = require('../controllers/MessegeTController');

router.route('/:id').get(async (req, res) => {
    const result = await MessageTConroller.MessageT(req.params.id);
    res.json(result);
});

module.exports = router;