
const express= require('express')

const router=express.Router();

const messegeTravelController = require('../controllers/messegeTravelController');
 
 router.route('/:id').get(async(req, res) => {
     const result = await messegeTravelController.getUserById(req.params.id);
     res.json(result);
 });

module.exports = router;