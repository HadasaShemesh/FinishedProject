const { Driver, MessegesDrivers, TravelOnOld } = require('../models/tablesModel'); // ייבוא המודל של הנהגים

const checkDriverCredentials = async (obj) => {
    console.log(obj);
    const id = obj.id;
    const password = obj.password;
    const driver = await Driver.findOne({ idDriver: id, password: password })
    if (driver) {
        return true;
    }
    else {
        return false;
    }
}

const getMessegesDriverById = async (id) => {
    return await MessegesDrivers.find({ idDriver: id })
}

const GetAnswerFromDriver = async (object) => {
    const travel = await TravelOnOld.findOne({ idTravelO: object.idTravelO });
    travel.DoAddedNewTravelO = true;
    travel.idDriverFound=object.idDriver;
    const updatedTravelO = await TravelOnOld.findOneAndUpdate(
        { idTravelO: object.idTravelO },
        { $set: { DoAddedNewTravelO: travel.DoAddedNewTravelO, idDriverFound: travel.idDriverFound } },
        { new: true }
    );
}
module.exports = { checkDriverCredentials, getMessegesDriverById, GetAnswerFromDriver }
