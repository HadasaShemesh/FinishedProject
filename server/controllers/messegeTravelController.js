const { MessegesTravels} = require('../models/tablesModel');


const getUserById =async ( id ) => {
    return await MessegesTravels.find({ idUser: id});
};

module.exports = {getUserById};
