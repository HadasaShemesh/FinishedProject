// const users = [{ 'id': 1, 'name': 'Orit' }, { 'id': 2, 'name': 'Alel' }, { 'id': 3, 'name': 'Shira' }];
// const users1 = [{ 'id': 1, 'date': '22/5/23','city':'ashdod' ,'time':'19:00','line':'350' }, { 'id': 2, 'date': '22/5/23','city':'ashdod' ,'time':'19:00','line':'350' }];
// const User = require('../models/tablesModel');
const { User, userModel, TravelOnOld, travelOnOldModel ,MessegesTravels,usersMessegeModel, Line} = require('../models/tablesModel');
const { Travel } = require('../models/tablesModel');


const getUserById =async ( id ) => {
  const travel= await User.findOne({idUser:id});
    if (travel){
      return true;
  }
  else{
      return false;
  }
};

//בדיקה האם יכול להצטרף לנסיעה או שהוא מצטרף לנסיעה בהמתנה
//כל פעם יבדוק האם יש מקום בנסיעה שהזמין 
//אם יש מצוין ואם לא נפתחת נסיעה בהמתנה שם מצטרף---- בבדיקה של כל 2 דקות 
//נבדוק 2 דברים האם הנסיעות לא חורגות את סך ה-50 מקומות
//אם כן נפתח נסיעה בהמתנה
//והאם הנסיעה בהמתנה תעבור את סך 10 מקומות היא תמחק ותעבור לנסיעה רגילה
//שם כל פעם הנוסעים בהמתנה כשמגיע הכמות שלהם מעל 10 עוברים לנסיעה רגילה וכך 
//חוזר על עצמו ששוב הנסיעה שהיתה בהמתנה והפכה לרגילה מתמלאת שוב  אז שוב נוצר
//נסיעה בהמתנה חדשה עד שנהפכת לרגילה
const addUser = async (obj) => {
  try {
    console.log(obj);
    const userData = new userModel({
      idUser: obj.id,
      numOfLine: obj.line,
      DoInWait:false
    });
    const user = new User(userData);
    const saveUser = await user.save();
    console.log(saveUser);
    console.log("numOfLine"+ obj.line,"timeOfExit"+obj.time,"dateOfTravels"+obj.date );
    const findTravelByNumOfLine = await Travel.find({ numOfLine: obj.line,timeOfExit:obj.time,dateOfTravels:obj.date });
   console.log(findTravelByNumOfLine);
    if (!findTravelByNumOfLine[0]) {
      console.log('Line does not exist');
      return false;    
    }
    else {
      for(const travel of findTravelByNumOfLine)
          if (travel.amountOfTravels <= 50) {
            travel.amountOfTravels++;
            console.log(travel);
            // Update the document in the database
            const updatedTravel = await Travel.findOneAndUpdate(
              { _id: travel._id },
              { amountOfTravels: travel.amountOfTravels },
              { new: true }
            );
            console.log(updatedTravel);
            //שליחת הודעה לנוסע שהוזמנה עבורו מקום בנסיעה רגילה
            const AddUserMessege = new usersMessegeModel({
              idUser: obj.id,
              MessegeTravel: `הזמנת מקום בקו: ${obj.line} בשעה: ${obj.time} בתאריך: ${obj.date} , נסיעה טובה ובטוחה!`,
            });
            const Messegetravel = new MessegesTravels(AddUserMessege);
            const saveMessegeTravel = await Messegetravel.save();
            console.log(saveMessegeTravel);
          }
          else {
            const findTraveOnOldlByNumOfLine = await TravelOnOld.find({});
            console.log(findTraveOnOldlByNumOfLine);
            findTraveOnOldlByNumOfLine.forEach(async (travelO) => {
              if (travelO.timeOfExitO == obj.time&&travelO.numOfLineO==obj.line&&travelO.dateOfTravelsO==obj.date) {
                travelO.amountOfTravelsO++;
                console.log(travelO);
                // Update the document in the database
                const updatedOTravel = await TravelOnOld.findOneAndUpdate(
                  { _id: travelO._id },
                  { amountOfTravelsO: travelO.amountOfTravelsO },
                  { new: true }
                );
                console.log(updatedOTravel);
                //------update user in wait
                const updatedUserOnOld = await User.findOneAndUpdate(
                  { idUser:obj.id  },
                  { DoInWait: true },
                  { new: true }
                );
                console.log(updatedUserOnOld)
                 //שליחת הודעה לנוסע שהוזמנה עבורו מקום בנסיעה בהמתנה
                const AddUserMessege = new usersMessegeModel({
                  idUser: obj.id,
                  MessegeTravel: `אנו מצטערים כי אין מקום בנסיעה בקו: ${obj.line} בתאריך: ${obj.date} , בשעה:${obj.time}  כרגע אתה בנסיעת המתנה נודיע לך באם תצא נסיעה חדשה.`,
                });
                const Messegetravel = new MessegesTravels(AddUserMessege);
                const saveMessegeTravel = await Messegetravel.save();
                console.log(saveMessegeTravel);
              }
              else {
                console.log("dont exist a travelO");
              }
            })
          
          }
      return true;
    }
  }
  catch (err) {
     console.log("error");
  }  
    
}


module.exports = {addUser,getUserById};





























// const getAllUsers = async () => {
//   try {
//     const uses = await User.find();
//     return uses
//   }
//   catch (err) {
//     return err
//   }
// };

// const getUserById = (id) => {
//   return User.findById(id);
// };

// const addUser = async (obj) => {
//     try{
//       const us = new User(obj);
//       await (us.save())
//       return us;
//     }
//     catch(err){
//       return err;
//     }
// };







    // const updateUser = async (obj) => {
    //   console.log("obj", obj)
    //   try {
    //     await User.findByIdAndUpdate(obj._id.toJSON('new ObjectId'), obj);
    //     return "Updated!"
    //   }
    //   catch (err) {
    //     return err;
    //   }
    // };

    // const deleteUser = async (id) => {
    //   await User.findByIdAndDelete(id);
    //   return 'Deleted!';
    // }

    // module.exports = {
    //   getAllUsers,
    //   getUserById,
    //   addUser,
    //   updateUser,
    //   deleteUser,
    // };
  








// const lineData = new lineModel({
    //   numOfLine: result['מספר הקו'],
    //   addressOfStartingPoint: result['כתובת תחנת מוצא'],
    //   numOfStartingStation: result['מספר תחנת מוצא'],
    //   addressOfDestinationStation: result['כתובת תחנת יעד'],
    //   numOfDestiantionStation: result['מספר תחנת יעד'],
    //   EstimatedTravelTime: result['זמן נסיעה משוער'],
    // });

    // const travelData = new travelModel({
    //   idTravel: result['מספר נסיעה'],
    //   numOfLine: result['מספר הקו'],
    //   idDriver: result['ת.ז. נהג'],
    //   timeOfExit: result['שעת יציאה'],
    //   amountOfTravels: result['כמות נוסעים'],
    //   dateOfTravels: result['תאריך נסיעה'],
    //   DoAddedNewTravel: false,

    // });









// const getAll = () => {
//     return users;
// }

// const DeleteUser = (id) => {
//     const index = users.findIndex(u => u.id == id);
//     console.log(index)
//     users.splice(index, 1);
//     return users;
// }

// const getById = (id) => {
//     const user = users.find(u => u.id == id);
//     return user;
// }

// const addUser1 = (user) => {
//     users1.push(user);
//     return users1;
// }



// const addUser = (user) => {
//     users.push(user);
//     return users;
// }

