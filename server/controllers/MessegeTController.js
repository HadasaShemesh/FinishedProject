
const { MessegesTravels } = require('../models/tablesModel'); // ייבוא המודל של הנהגים

// מחיקת הודעה נוסע
const MessageT = async (_id) => {
    const message = MessegesTravels.deleteOne({ _id: _id }).exec()
    console.log(message);
}
module.exports = { MessageT };
