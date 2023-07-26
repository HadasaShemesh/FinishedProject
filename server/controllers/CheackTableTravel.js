const { Travel, travelModel, TravelOnOld, travelOnOldModel, User, MessegesTravels, usersMessegeModel, driversMessegeModel, MessegesDrivers } = require('../models/tablesModel');
const search = require('./EnterToAvlTree')

const checkPassengerCount = async () => {
  try {
    const allTravels = await Travel.find({});
    const allTravelsOnOld = await TravelOnOld.find({});

    for (const result of allTravels) {
      //בדיקה האם נסיעה עוברת את סך כמות המקומות
      // אז היא פותחת נסיעה בהמתנה בטבלה של נסיעות בהמתנה
      //DoAddedNewTravel--זה אומר האם הוסף נסיעה בהמתנה
      if (result.amountOfTravels > 50 && result.DoAddedNewTravel == false) {
        try {
          console.log(result);
          const travelOData = new travelOnOldModel({
            idTravelO: result.idTravel,
            numOfLineO: result.numOfLine,
            timeOfExitO: result.timeOfExit,
            amountOfTravelsO: 0,
            dateOfTravelsO: result.dateOfTravels,
            DoAddedNewTravelO: result.DoAddedNewTravel,
            searchedDriverO: false,
            idDriverFound: "none"
          });
          const travelOnOld = new TravelOnOld(travelOData);
          const saveTravelOnOld = await travelOnOld.save();
          console.log(saveTravelOnOld);

          result.DoAddedNewTravel = true;
          // Update the document in the database
          const updatedTravel = await Travel.findOneAndUpdate(
            { _id: result._id },
            { DoAddedNewTravel: result.DoAddedNewTravel },
            { new: true }
          );
          console.log(updatedTravel);
        } catch (err) {
          console.log("error");
        }
      }
    }

    //אם בנסיעה בהמתנה יש מעל 10 אנשים אז 
    //נמחק את הנסיעה הזאת מטבלת הנסיעות בהמתנה ונעביר אותה לנסיעה חדשה בטבלת הנסיעות
    //-------------
    //את ה-10 יצטרכו לנהל מתוך מסך ניהול
    //מאחר שהחוק בעמידה........אין צורך לעשות במסך ניהול
    //בנוסע ה-11 הנסיעה עוברת נסיעה חדשה ולא בהמתנה
    //אך ורק אם ימצא לה נהג
    for (const toMoveNewTravel of allTravelsOnOld) {
      //DoAddedNewTravelO---זה אומר האם נמצא לה נהג
      if (toMoveNewTravel.amountOfTravelsO > 10 && toMoveNewTravel.DoAddedNewTravelO == true) {
        try {
          //delete
          const idDriverF = toMoveNewTravel.idDriverFound;
          const idTravelo = toMoveNewTravel.idTravelO;
          const result = await TravelOnOld.deleteOne({ idTravelO: idTravelo });
          console.log(`Deleted ${result.deletedCount} document(s).`);
          // const result1 = await TravelOnOld.deleteOne({});
          // console.log(result1);
          //add
          const travelData = new travelModel({
            idTravel: "special Travel",
            numOfLine: toMoveNewTravel.numOfLineO,
            idDriver: idDriverF,
            timeOfExit: toMoveNewTravel.timeOfExitO,
            amountOfTravels: toMoveNewTravel.amountOfTravelsO,
            dateOfTravels: toMoveNewTravel.dateOfTravelsO,
            DoAddedNewTravel: false,
          });
          console.log(travelData);
          const newTravel = new Travel(travelData);
          const saveNewTravel = await newTravel.save();
          console.log(saveNewTravel);
          //הודעה לנוסעים בהמתנה שתצא נסיעה חדשה
          await SendAnswersToTravels(saveNewTravel);
          //מעדכן שהנוסעים בהמתנה כבר לא בהמתנה
          const allTravelsInWait = await User.find({ numOfLine: saveNewTravel.numOfLine, DoInWait: true })
          for (const travelWait of allTravelsInWait) {
            travelWait.DoInWait = false;
            const updatedTravelWaitO = await User.findOneAndUpdate(
              { idUser: travelWait.idUser },
              { DoInWait: travelWait.DoInWait },
              { new: true }
            );
            console.log(updatedTravelWaitO);
          }
          //מחיקת ההודעות שנשלחו לנהגים 
          const messegesDELETE = await MessegesDrivers.deleteMany({ idTravelO: idTravelo });
          console.log(messegesDELETE);
        } catch (err) {
          console.log("error");
        }
      }
      //searchedDriverO---האם כבר פונקציית החיפוש הופעלה בעבורו
      else if (toMoveNewTravel.amountOfTravelsO > 10 && toMoveNewTravel.searchedDriverO == false) {
        // חיפוש נהג שמתאים לנסיעה עם מוצא ישלח הודעה
        // לנוסעים שהזמינו - ושכביכול בהמתנה -שיוצא אוטובוס נוסף
        toMoveNewTravel.searchedDriverO = true;
        // Update the document in the database
        const updatedTravelO = await TravelOnOld.findOneAndUpdate(
          { _id: toMoveNewTravel._id },
          { searchedDriverO: toMoveNewTravel.searchedDriverO },
          { new: true }
        );
        search.SearchDriverByShiftTime(updatedTravelO)
      }
    }
  } catch (error) {
    console.error('Error fetching travels:', error);
    throw error;
  }
};

//פונקצייה השולחת הודעות לכל הנוסעים בהמתנה שיוצאת נסיעה
async function SendAnswersToTravels(NewTravel) {
  const allTravelOfOnOldTravel = await User.find({ numOfLine: NewTravel.numOfLine, DoInWait: true })
  console.log(allTravelOfOnOldTravel);
  for (const travel of allTravelOfOnOldTravel) {
    const AddUserMessege = new usersMessegeModel({
      idUser: travel.idUser,
      MessegeTravel: `לנוחיותך יצא אוטובוס נוסף בקו: ${NewTravel.numOfLine} , בשעה: ${NewTravel.timeOfExit} ,בתאריך: ${NewTravel.dateOfTravels}, סליחה על ההמתנה  , נסיעה טובה ובטוחה!`,
    });
    const Messegetravel = new MessegesTravels(AddUserMessege);
    const saveMessegeTravel = await Messegetravel.save();
    console.log(saveMessegeTravel);
  }
}

module.exports = { checkPassengerCount }

















// const checkPassengerCount = async () => {
//   // כאן יש לבצע שאילתת מסד הנתונים ולבדוק את כמות הנוסעים
//   console.log("arrived");
//   const amountOfTravels=Travel.find({})
//   // const travels = db.collection('Travel')

  // travels.find().toArray((err, results) => {
  //   if (err) {
  //     console.error('שגיאה בשליפת טבלת הנסיעות:', err);
  //     return;
  //   }
  //   results.forEach(travel => {
  //     if (travel.amountOfTravels > 50 && travel.DoAddedNewTravel == false) {
  //       console.log(`נסיעה מספר ${travel.idTravel} עם כמות נוסעים מעל ל-50`);
  //       // כאן ניתן לבצע פעולות נוספות במידה הצורך
  //       enterToBinaryTree.addShiftsToBST(travel.idTravel)
  //     }
  //   });
  // });

// }


// setInterval(checkPassengerCount, 2 * 60 * 1000); // בדיקה כל 2 דקות (במילישניות)
