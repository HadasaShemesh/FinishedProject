const { Manager, User,
    Driver, Shift, Line, Travel, TravelOnOld,
    MessegesTravels, MessegesDrivers } = require('../models/tablesModel'); // ייבוא המודל של הנהגים


const checkManagerCredentials = async (obj) => {
    const password = obj.password;
    const manager = await Manager.findOne({ passwordManager: password })
    if (manager) {
        return true;
    }
    else {
        return false;
    }
}

const DeleteAllDetails = async () => {
    const travels = await Travel.deleteMany({});
    const lines = await Line.deleteMany({});
    const travelsOnOld = await TravelOnOld.deleteMany({});
    const shifts = await Shift.deleteMany({});
    const drivers = await Driver.deleteMany({});
    console.log(travels, lines, travelsOnOld, shifts, drivers);
  }

module.exports = { checkManagerCredentials, DeleteAllDetails }
