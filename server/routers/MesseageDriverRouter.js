const express = require('express')

const router = express.Router();

const MessageDriverConroller = require('../controllers/MessageDriverConroller');

router.route('/:id').get(async (req, res) => {
    const result = await MessageDriverConroller.MessageD(req.params.id);
    res.json(result);
});

module.exports = router;