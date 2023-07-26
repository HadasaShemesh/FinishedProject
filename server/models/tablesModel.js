const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        idUser: { type: String, required: true },
        numOfLine: { type: String, required: true },
        DoInWait: { type: Boolean, required: true }
    },
    { versionKey: false }
);

function userModel(data) {
    this.idUser = data.idUser;
    this.numOfLine = data.numOfLine;
    this.DoInWait = data.DoInWait;
}
const managerSchema = mongoose.Schema(
    {
        passwordManager: { type: String, required: true }
    },
    { versionKey: false }
);

function managerModel(data) {
    this.passwordManager = data.passwordManager;
}

const driverSchema = new mongoose.Schema(
    {
        idDriver: { type: String, required: true },
        nameOfDriver: { type: String, required: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        idShift: { type: String, required: true },
    },
    { versionKey: false }
);

function driverModel(data) {
    this.idDriver = data.idDriver;
    this.nameOfDriver = data.nameOfDriver;
    this.password = data.password;
    this.phone = data.phone;
    this.idShift = data.idShift;

}

const shiftSchema = mongoose.Schema(
    {
        idShift: { type: String, required: true },
        idDriver: { type: String, required: true },
        beginOfshift: { type: String, required: true },
        endOfshift: { type: String, required: true },
        dateOfShift: { type: String, required: true },
    },
    { versionKey: false }
);

function shiftModel(data) {
    this.idShift = data.idShift;
    this.idDriver = data.idDriver;
    this.beginOfshift = data.beginOfshift;
    this.endOfshift = data.endOfshift;
    this.dateOfShift = data.dateOfShift;
}

const lineSchema = mongoose.Schema(
    {
        numOfLine: { type: String, required: true },
        addressOfStartingPoint: { type: String, required: true },
        numOfStartingStation: { type: String, required: true },
        addressOfDestinationStation: { type: String, required: true },
        numOfDestiantionStation: { type: String, required: true },
        EstimatedTravelTime: { type: String, required: true },
    },
    { versionKey: false }
);

function lineModel(data) {
    this.numOfLine = data.numOfLine;
    this.addressOfStartingPoint = data.addressOfStartingPoint;
    this.numOfStartingStation = data.numOfStartingStation;
    this.addressOfDestinationStation = data.addressOfDestinationStation;
    this.numOfDestiantionStation = data.numOfDestiantionStation;
    this.EstimatedTravelTime = data.EstimatedTravelTime;

}

const travelSchema = mongoose.Schema(
    {
        idTravel: { type: String, required: true },
        numOfLine: { type: String, required: true },
        idDriver: { type: String, required: true },
        timeOfExit: { type: String, required: true },
        amountOfTravels: { type: Number, required: true },
        dateOfTravels: { type: String, required: true },
        DoAddedNewTravel: { type: Boolean, required: true },
    },
    { versionKey: false }
);


function travelModel(data) {
    this.idTravel = data.idTravel;
    this.numOfLine = data.numOfLine;
    this.idDriver = data.idDriver;
    this.timeOfExit = data.timeOfExit;
    this.amountOfTravels = data.amountOfTravels;
    this.dateOfTravels = data.dateOfTravels;
    this.DoAddedNewTravel = data.DoAddedNewTravel;
}


const travelOnOldSchema = mongoose.Schema(
    {
        idTravelO: { type: String, required: true },
        numOfLineO: { type: String, required: true },
        timeOfExitO: { type: String, required: true },
        amountOfTravelsO: { type: Number, required: true },
        dateOfTravelsO: { type: String, required: true },
        DoAddedNewTravelO: { type: Boolean, required: true },
        searchedDriverO: { type: Boolean, required: true },
        idDriverFound: { type: String, required: true }
    },
    { versionKey: false }
);


function travelOnOldModel(data) {
    this.idTravelO = data.idTravelO;
    this.numOfLineO = data.numOfLineO;
    this.timeOfExitO = data.timeOfExitO;
    this.amountOfTravelsO = data.amountOfTravelsO;
    this.dateOfTravelsO = data.dateOfTravelsO;
    this.DoAddedNewTravelO = data.DoAddedNewTravelO;
    this.searchedDriverO = data.searchedDriverO;
    this.idDriverFound = data.idDriverFound;

}


const usersMessegeSchema = mongoose.Schema(
    {
        idUser: { type: String, required: true },
        MessegeTravel: { type: String, required: true },
    },
    { versionKey: false }
);

function usersMessegeModel(data) {
    this.idUser = data.idUser;
    this.MessegeTravel = data.MessegeTravel;
}

const driversMessegeSchema = mongoose.Schema(
    {
        idDriver: { type: String, required: true },
        MessegeDriver: { type: String, required: true },
        idTravelO: { type: String, required: true },
    },
    { versionKey: false }
);

function driversMessegeModel(data) {
    this.idDriver = data.idDriver;
    this.MessegeDriver = data.MessegeDriver;
    this.idTravelO=data.idTravelO;
}


const User = mongoose.model('user', userSchema, 'users');
const Manager = mongoose.model('manager', managerSchema, 'managers');
const Driver = mongoose.model('driver', driverSchema, 'drivers');
const Shift = mongoose.model('Shift', shiftSchema, 'shifts');
const Line = mongoose.model('line', lineSchema, 'lines');
const Travel = mongoose.model('travel', travelSchema, 'travels');
const TravelOnOld = mongoose.model('travelOnOld', travelOnOldSchema, 'travelsOnOld');
const MessegesTravels = mongoose.model('messegeT', usersMessegeSchema, 'messegesT');
const MessegesDrivers = mongoose.model('messegeD', driversMessegeSchema, 'messegesD');

module.exports = {
    User, userModel, Manager, managerModel,
    Driver, driverModel, Shift, shiftModel, Line, lineModel, Travel, travelModel, TravelOnOld, travelOnOldModel,
    MessegesTravels, usersMessegeModel, MessegesDrivers, driversMessegeModel
};


