
const { MessegesDrivers } = require('../models/tablesModel'); // ייבוא המודל של הנהגים

// מחיקת הודעה נהג
const MessageD = async (_id) => {
    const message = MessegesDrivers.deleteOne({ _id: _id }).exec()
    console.log(message);
}
module.exports = { MessageD };
