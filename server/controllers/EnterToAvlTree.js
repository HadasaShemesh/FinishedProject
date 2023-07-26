
const { Shift, Line, Travel, MessegesDrivers, driversMessegeModel } = require('../models/tablesModel');
const FunctionsOfCalculations = require('../calculations')


class Node {
    constructor(idDriver, time) {
        this.idDriver = idDriver;
        this.time = time;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

class AVLTree {
    constructor(compareFn) {
        this.root = null;
        this.compare = compareFn;
    }

    getHeight(node) {
        if (node === null) {
            return 0;
        }
        return node.height;
    }

    updateHeight(node) {
        node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
    }

    leftRotate(node) {
        const newRoot = node.right;
        node.right = newRoot.left;
        newRoot.left = node;

        this.updateHeight(node);
        this.updateHeight(newRoot);

        return newRoot;
    }

    rightRotate(node) {
        const newRoot = node.left;
        node.left = newRoot.right;
        newRoot.right = node;

        this.updateHeight(node);
        this.updateHeight(newRoot);

        return newRoot;
    }


    balance(node) {
        const balanceFactor = this.getHeight(node.left) - this.getHeight(node.right);

        if (balanceFactor > 1) {
            if (this.compare(node.left, node.left.right) > 0) {
                node.left = this.leftRotate(node.left);
            }
            return this.rightRotate(node);
        } else if (balanceFactor < -1) {
            if (this.compare(node.right, node.right.left) < 0) {
                node.right = this.rightRotate(node.right);
            }
            return this.leftRotate(node);
        }

        return node;
    }

    insertNode(node, newNode) {
        if (node === null) {
            return newNode;
        }

        if (this.compare(newNode, node) < 0) {
            node.left = this.insertNode(node.left, newNode);
        } else {
            node.right = this.insertNode(node.right, newNode);
        }

        this.updateHeight(node);
        return this.balance(node);
    }

    insert(idDriver, time) {
        const newNode = new Node(idDriver, time);
        this.root = this.insertNode(this.root, newNode);
    }
}

function printTree(node) {
    if (node !== null) {
        printTree(node.left);
        console.log(`idDriver: ${node.idDriver}, time: ${node.time}`);
        printTree(node.right);
    }
}

global.avlTree1 = new AVLTree((a, b) => {
    if (a === null || b === null) {
        return 0;
    }
    if (a.time < b.time) {
        return -1;
    } else if (a.time > b.time) {
        return 1;
    } else {
        return 0;
    }
});

global.avlTree2 = new AVLTree((a, b) => {
    if (a === null || b === null) {
        return 0;
    }
    if (a.time < b.time) {
        return -1;
    } else if (a.time > b.time) {
        return 1;
    } else {
        return 0;
    }
});


// פונקציה הבונה 2 עצי AVL
// ומכניסה את זמני המשמרות לתוכם
async function addShiftsToBST() {
    const shifts = await Shift.find({});
    for (const shift of shifts) {
        avlTree1.insert(shift.idDriver, shift.beginOfshift);
        avlTree2.insert(shift.idDriver, shift.endOfshift);
    }
    printTree(avlTree1.root)
    console.log("--------------------");
    printTree(avlTree2.root)

}

//פונקציית חיפוש בעצי AVL
async function SearchDriverByShiftTime(result) {
    await findEarlyShifts(avlTree1.root, result);
    await findLateShifts(avlTree2.root, result);
}
//פונקצייה העוברת על עץ עם זמני תחילת המשמרות
//ובודקת אם זמן הנסיעה המבוקש קטן מזמן תחילת המשמרת אם כן
//בודקת האם זמן תחילת הנסיעה החדשה + זמן נסיעה משוער + חישוב של זמן נסיעה
// בין 2 התחנות: תחנת יעד של הנסיעה המבוקשת לבין תחנת מוצא של הנסיעה בתחילת המשמרת
//האם כל החישוב הזה קטן מ-תחילת זמן המשמרת
//אם כן ישלח הודעה לנהגים הללו
async function findEarlyShifts(node, result) {
    if (node !== null) {
        if (result.timeOfExitO < node.time) {
            const FindShift = await Shift.findOne({ dateOfShift: result.dateOfTravelsO, idDriver: node.idDriver })
            const FindTravel = await Travel.findOne({ idDriver: FindShift.idDriver, timeOfExit: FindShift.beginOfshift })
            const FindLineOfBeginShifts = await Line.findOne({ numOfLine: FindTravel.numOfLine })
            const FindLine = await Line.findOne({ numOfLine: result.numOfLineO });
            const TimeBetweenTwoStationPromise = FunctionsOfCalculations.GetTimeOfTravelBetweenTwoStation
                (FindLine.numOfDestiantionStation, FindLineOfBeginShifts.numOfStartingStation);
            let TimeBetweenTwoStation;
            try {
                TimeBetweenTwoStation = await TimeBetweenTwoStationPromise;
            } catch (error) {
                console.error(error);
            }
            calculateforEarlyFunction(result.timeOfExitO, FindLine.EstimatedTravelTime, TimeBetweenTwoStation).then((res) => {
                if (res < node.time) {
                    cul(res, node.time).then((diff) => {
                        if (diff < "02:00" && diff > "00:00")
                            SendMessageToDriveForEarly(result, res, node.time, node.idDriver);
                    });
                }
            })
            findEarlyShifts(node.right, result);
            findEarlyShifts(node.left, result);
        }
        else {
            findEarlyShifts(node.right, result);
        }
    }
}
//פונקציית עזר לפונקציית findEarlyShifts
//להחסיר את הזמן הכולל של נסיעה כולל כל אילוציה פחות זמן תחילת משמרת
//ובדיקה האם זה בתוך 4 שעות
async function cul(res, nodeT) {
    const [hours1, minutes1] = res.split(':').map(Number);
    const [hours2, minutes2] = nodeT.split(':').map(Number);

    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;

    const diffMinutes = totalMinutes2 - totalMinutes1;

    const diffHours = Math.floor(diffMinutes / 60);
    const diffMins = diffMinutes % 60;

    const diffTime = `${diffHours.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}`;

    return diffTime;
}
//פונקצייה העוברת על סיומי זמני המשמרות
//ובודקת האם זמן הנסיעה המבוקש גדולה=אחרי סיום זמני המשמרות
//אם כן בודקת האם סיום זמן המשמרת + חישוב מרחק בין 2 התחנות: תחנת יעד של 
//הנסיעה האחרונה במשמרת של הנהג לבין תחנת מוצא של הנסיעה המבוקשת
//האם כל החישוב הזה יהיה קטן מ-זמן היציאה של הנסיעה המבוקשת
//אם כן ישלח הודעה לנהגים הללו
async function findLateShifts(node, result) {
    if (node !== null) {
        if (result.timeOfExitO >= node.time) {
            const lastTravel = await Travel.findOne({ idDriver: node.idDriver }).sort({ timeOfExit: -1 });
            const findLineByTravel = await Line.findOne({ numOfLine: lastTravel.numOfLine })
            const FindLine = await Line.findOne({ numOfLine: result.numOfLineO });
            const TimeBetweenTwoStation = await FunctionsOfCalculations.GetTimeOfTravelBetweenTwoStation
                (findLineByTravel.numOfDestiantionStation, FindLine.numOfStartingStation)
            calculateforLaterFunction(node.time, TimeBetweenTwoStation, result.timeOfExitO).then((res) => {
                if (res.result1 < result.timeOfExitO && res.resultT < "02:00")
                    SendMessageToDriveForlater(result, res.result1, node.time, node.idDriver);
            }).catch((error) => {
                console.error(error);
            });
            findLateShifts(node.left, result);
            findLateShifts(node.right, result);
        } else {
            findLateShifts(node.left, result);
        }
    }
}

//פונקצייה השולחת הודעות לנהגים היכולים להוציא נסיעה לפני משמרת
async function SendMessageToDriveForEarly(result, result1, nodeTime, nodeIdDriver) {
    //שליחת הודעה לנהג בבקשה להוספת נסיעה
    const SendDriverMessege = new driversMessegeModel({
        idDriver: nodeIdDriver,
        MessegeDriver: `נהג: ${nodeIdDriver} , מתבקש להוסיף נסיעה בקו: ${result.numOfLineO} , בשעה: ${result.timeOfExitO} , בתאריך: ${result.dateOfTravelsO} , נסיעה זו אמורה להגמר כולל נסיעה עד תחנת מוצא של הנסיעה המיועדת, בשעה: ${result1} , טרם תחילת המשמרת שלך שאמורה להתחיל בשעה: ${nodeTime} , קוד נסיעה זו: ${result.idTravelO} ,אם תוכל לבצע נסיעה זו אנא אשר זאת.`,
        idTravelO: result.idTravelO
    });
    const MessegeDriver = new MessegesDrivers(SendDriverMessege);
    const saveMessegeDriver = await MessegeDriver.save();
    console.log(saveMessegeDriver);
}

//פונקצייה השולחת הודעות לנהגים היכולים להוציא נסיעה אחרי משמרת
async function SendMessageToDriveForlater(result, result1, nodeTime, nodeIdDriver) {
    //שליחת הודעה לנהג בבקשה להוספת נסיעה
    const SendDriverMessege = new driversMessegeModel({
        idDriver: nodeIdDriver,
        MessegeDriver: `נהג: ${nodeIdDriver} , מתבקש להוסיף נסיעה בקו: ${result.numOfLineO} , בשעה: ${result.timeOfExitO} , בתאריך: ${result.dateOfTravelsO} , לנסיעה זו אתה אמור להספיק להגיע אחר סיום המשמרת בזמן משוער: ${result1} , סיום המשמרת שלך שאמורה להסתיים בשעה: ${nodeTime} , קוד נסיעה זו: ${result.idTravelO} , אם תוכל לבצע נסיעה זו אנא אשר זאת.`,
        idTravelO: result.idTravelO
    });
    const MessegeDriver = new MessegesDrivers(SendDriverMessege);
    const saveMessegeDriver = await MessegeDriver.save();
    console.log(saveMessegeDriver);
}
//פונקציות עזר לחישובי זמנים לפונקציית חיפוש  בעץ משמרות קודם המשמרת
//תוצאה של זמן נסיעה + משך נסיעה + זמן בין 2 התחנות
async function calculateforEarlyFunction(time1, time2, duration) {
    console.log("time1" + time1, "time2" + time2, "duration" + duration);
    // Split time1 into hours and minutes
    const [hours1, minutes1] = time1.split(":").map(Number);
    // Split time2 into hours, minutes, and seconds
    const [hours2, minutes2] = time2.split(":").map(Number);
    // Convert times to seconds and add them together
    const totalSeconds = hours1 * 3600 + minutes1 * 60 + hours2 * 3600 + minutes2 * 60 + duration.toFixed(1) * 60;
    // Convert total seconds to hours, minutes, and seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    // Format the result as HH:MM:SS
    const result1 = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    console.log("res" + result1);
    return result1;
}
//פונקצית עזר לחישובי זמן לפונקציית חיפוש בעץ משמרות לאחר משמרת 
//זמן סיום משמרת + זמן נסיעה בין 2 התחנות result1
// וכן בדיקה של זמן יציאה של האוטובוס הרצוי פחות כל החישובים של גמירת המשמרת ועוד הנסיעה בין 2 - התחנות   resultT
async function calculateforLaterFunction(nodeTime, TimeBetweenTwoStation, timeOfExitO) {
    const [hours1, minutes1] = (nodeTime).split(":").map(Number);
    const totalSeconds = hours1 * 3600 + minutes1 * 60 + TimeBetweenTwoStation.toFixed(1) * 60;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const result1 = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    console.log(result1);
    const minutesH = parseInt(result1.substr(0, 2)) * 60 + parseInt(result1.substr(3, 2));
    const minutesS = parseInt(timeOfExitO.substr(0, 2)) * 60 + parseInt(timeOfExitO.substr(3, 2));
    const minutesDiff = Math.abs(minutesS - minutesH);
    const hour = Math.floor(minutesDiff / 60);
    const minute = minutesDiff % 60;
    const resultT = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    return { resultT, result1 };
}


module.exports = { SearchDriverByShiftTime, addShiftsToBST }
//=========================================================



















































































// async function calculateforEarlyFunction(time1, time2, duration) {
//     console.log("time1"+time1,"time2"+time2,"duration"+duration);
//     // Split time1 into hours and minutes
//     const [hours1, minutes1] = time1.split(":").map(Number);
//     // Split time2 into hours, minutes, and seconds
//     const [hours2, minutes2, seconds2] = time2.split(":").map(Number);
//     // Convert times to seconds and add them together
//     const totalSeconds = hours1 * 3600 + minutes1 * 60 + hours2 * 3600 + minutes2 * 60 + seconds2 + duration.toFixed(1) * 60;
//     // Convert total seconds to hours, minutes, and seconds
//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     const seconds = totalSeconds % 60;
//     // Format the result as HH:MM:SS
//     const result1 = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
//     console.log("res"+result1);
//     return result1;
// }



// function findEarlyShifts(node, targetTime) {
//     if (node !== null) {
//         console.log(targetTime, node.time)
//         if (targetTime < node.time) {
//             const FindLine = Line.find({ numOfLine: result.numOfLineO });
//             if()
//             beforeShifts.push({ idDriver: node.idDriver, time: node.time });
//             findEarlyShifts(node.right, targetTime);
//             findEarlyShifts(node.left, targetTime);
//         } else {
//             findEarlyShifts(node.right, targetTime);
//         }
//     }
//     // console.log(lateShifts);
// }


// console.log(avlTree1.root);
    // printTree(avlTree1.root);
    // console.log("---------------------------------");
    // console.log("after:");
    // printTree(avlTree2.root);

    // const time = result.timeOfExitO;
    // console.log(time);
    // findEarlyShifts(avlTree1.root, time,)
    //  findEarlyShifts(avlTree1.root, result);
    //  SendMessageToDrive();

    // console.log(beforeShifts);
    // console.log("----------------------------------------");
    // findLateShifts(avlTree2.root, result);
    // console.log(afterShifts);
//-------------------------------------------------------------
// function findEarlyShifts(node, targetTime) {
//     if (node !== null) {
//         console.log(targetTime,node.time)
//         if (targetTime < node.time) {
//             beforeShifts.push({ idDriver: node.idDriver, time: node.time });
//             findEarlyShifts(node.right, targetTime);
//             findEarlyShifts(node.left, targetTime);
//         } else {
//             findEarlyShifts(node.right, targetTime);
//         }
//     }
//     // console.log(lateShifts);
// }


// function findLateShifts(node, targetTime) {
//     if (node !== null) {
//         if (node.time <= targetTime) {
//             afterShifts.push({ idDriver: node.idDriver, time: node.time });
//             findLateShifts(node.left, targetTime);
//             findLateShifts(node.right, targetTime);
//         } else {
//             findLateShifts(node.left, targetTime);
//         }
//     }
//     // console.log(earlyShifts);
// }





// leftRotate(node) {
//     const newRoot = node.right;
//     node.right = newRoot.left;
//     if (newRoot.left !== null) {
//         newRoot.left.parent = node; // עדכון האבא של הצומת הימני
//     }
//     newRoot.left = node;

//     this.updateHeight(node);
//     this.updateHeight(newRoot);

//     if (node.parent !== null) {
//         if (node.parent.left === node) {
//             node.parent.left = newRoot; // עדכון האבא של הצומת השמאלי
//         } else {
//             node.parent.right = newRoot; // עדכון האבא של הצומת הימני
//         }
//     }
//     newRoot.parent = node.parent; // עדכון האבא של הצומת החדש

//     node.parent = newRoot; // עדכון האבא של הצומת המקורי

//     return newRoot;
// }

// rightRotate(node) {
//     const newRoot = node.left;
//     node.left = newRoot.right;
//     if (newRoot.right !== null) {
//         newRoot.right.parent = node; // עדכון האבא של הצומת השמאלי
//     }
//     newRoot.right = node;

//     this.updateHeight(node);
//     this.updateHeight(newRoot);

//     if (node.parent !== null) {
//         if (node.parent.left === node) {
//             node.parent.left = newRoot; // עדכון האבא של הצומת השמאלי
//         } else {
//             node.parent.right = newRoot; // עדכון האבא של הצומת הימני
//         }
//     }
//     newRoot.parent = node.parent; // עדכון האבא של הצומת החדש

//     node.parent = newRoot; // עדכון האבא של הצומת המקורי

//     return newRoot;
// }


//------------------------------------------------
// const { Shift } = require('../models/tablesModel');

// class Node {
//     constructor(idDriver, time) {
//         this.idDriver = idDriver;
//         this.time = time;
//         this.left = null;
//         this.right = null;
//         this.height = 1;
//         this.parent = null;
//     }
// }

// class AVLTree {
//     constructor(compareFn) {
//         this.root = null;
//         this.compare = compareFn;
//     }

//     getHeight(node) {
//         if (node === null) {
//             return 0;
//         }
//         return node.height;
//     }

//     updateHeight(node) {
//         node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
//     }

//     leftRotate(node) {
//         const newRoot = node.right;
//         node.right = newRoot.left;
//         newRoot.left = node;

//         this.updateHeight(node);
//         this.updateHeight(newRoot);

//         return newRoot;
//     }

//     rightRotate(node) {
//         const newRoot = node.left;
//         node.left = newRoot.right;
//         newRoot.right = node;

//         this.updateHeight(node);
//         this.updateHeight(newRoot);

//         return newRoot;
//     }

//     balance(node) {
//         const balanceFactor = this.getHeight(node.left) - this.getHeight(node.right);

//         if (balanceFactor > 1) {
//             if (this.compare(node.left, node.left.right) > 0) {
//                 node.left = this.leftRotate(node.left);
//             }
//             return this.rightRotate(node);
//         } else if (balanceFactor < -1) {
//             if (this.compare(node.right, node.right.left) < 0) {
//                 node.right = this.rightRotate(node.right);
//             }
//             return this.leftRotate(node);
//         }

//         return node;
//     }

//     insertNode(node, newNode) {
//         if (node === null) {
//             return newNode;
//         }

//         if (this.compare(newNode, node) < 0) {
//             node.left = this.insertNode(node.left, newNode);
//         } else {
//             node.right = this.insertNode(node.right, newNode);
//         }

//         this.updateHeight(node);
//         return this.balance(node);
//     }

//     insert(idDriver, time) {
//         const newNode = new Node(idDriver, time);
//         this.root = this.insertNode(this.root, newNode);
//     }
// }

// function printTree(node) {
//     if (node !== null) {
//         printTree(node.left);
//         console.log(`idDriver: ${node.idDriver}, time: ${node.time}`);
//         printTree(node.right);
//     }
// }

// async function addShiftsToBST(result) {
//     const shifts = await Shift.find({});

//     const avlTree1 = new AVLTree((a, b) => {
//         if (a === null || b === null) {
//             return 0;
//         }
//         if (a.time < b.time) {
//             return -1;
//         } else if (a.time > b.time) {
//             return 1;
//         } else {
//             return 0;
//         }
//     });

//     const avlTree2 = new AVLTree((a, b) => {
//         if (a === null || b === null) {
//             return 0;
//         }
//         if (a.time < b.time) {
//             return -1;
//         } else if (a.time > b.time) {
//             return 1;
//         } else {
//             return 0;
//         }
//     });

//     for (const shift of shifts) {
//         avlTree1.insert(shift.idDriver, shift.beginOfshift);
//         avlTree2.insert(shift.idDriver, shift.endOfshift);
//     }

//     console.log("before:");
//     printTree(avlTree1.root);
//     console.log("---------------------------------");
//     console.log("after:");
//     printTree(avlTree2.root);

//     searchDriverByShiftTime(avlTree1, avlTree2, result);
// }



// function searchDriverByShiftTime(avlTree1, avlTree2, result) {
//     const time = result.timeOfExit;
//     console.log(time);
//     const afterShifts = [];
//     const beforeShifts = [];

//     findLateShifts(avlTree2.root, time, afterShifts);
//     console.log("----------------------------------------");
//     findEarlyShifts(avlTree1.root, time, beforeShifts);
// }


// function findEarlyShifts(node, targetTime, earlyShifts) {
//     if (node !== null) {
//         if (node.time >= targetTime) {
//             earlyShifts.push({ idDriver: node.idDriver, time: node.time });
//             findEarlyShifts(node.left, targetTime, earlyShifts);
//             findEarlyShifts(node.right, targetTime, earlyShifts);
//             node.parent = node; // עדכון האבא
//         } else {
//             findEarlyShifts(node.right, targetTime, earlyShifts);
//         }
//     }
//     console.log(earlyShifts);
// }

// function findLateShifts(node, targetTime, lateShifts) {
//     if (node !== null) {
//         if (node.time < targetTime) {
//             lateShifts.push({ idDriver: node.idDriver, time: node.time });
//             findLateShifts(node.right, targetTime, lateShifts);
//             findLateShifts(node.left, targetTime, lateShifts);
//             node.parent = node; // עדכון האבא
//         } else {
//             findLateShifts(node.left, targetTime, lateShifts);
//         }
//     }
//   console.log(lateShifts);

// }


//************************************** */

// function findEarlyShifts(node, targetTime, earlyShifts) {
//     if (node !== null) {
//         if (node.time >= targetTime) {
//             earlyShifts.push({ idDriver: node.idDriver, time: node.time });
//             node.parent = node; // עדכון האבא
//             findEarlyShifts(node.right, targetTime, earlyShifts);
//         }
//         if (node.time < targetTime) {
//             node.parent = node; // עדכון האבא
//             findEarlyShifts(node.right, targetTime, earlyShifts);
//         }
//     }

//     console.log(earlyShifts);
// }


// function findLateShifts(node, targetTime, lateShifts) {
//     if (node !== null) {
//         if (node.time > targetTime) {
//             node.parent = node; // עדכון האבא
//             findLateShifts(node.left, targetTime, lateShifts);
//         }
//         if (node.time <= targetTime) {
//             lateShifts.push({ idDriver: node.idDriver, time: node.time });
//             node.parent = node; // עדכון האבא
//             findLateShifts(node.left, targetTime, lateShifts);
//         }
//     }
//     console.log(lateShifts);
// }













// function findEarlyShifts(node, targetTime, earlyShifts) {
//     if (node !== null) {
//       if (node.time >= targetTime) {
//         earlyShifts.push({ idDriver: node.idDriver, time: node.time });
//         findEarlyShifts(node.right, targetTime, earlyShifts);
//         node.parent = newNode; // עדכון האבא
//       }
//       if (node.time < targetTime) {
//         findEarlyShifts(node.right, targetTime, earlyShifts);
//         node.parent = newNode; // עדכון האבא
//       }
//     }
//   }



// function findLateShifts(node, targetTime, lateShifts) {
//     // console.log("'******************************'");
//     printTree(node)
//     printTree(targetTime)
//     printTree(lateShifts)
//     // printTree(node)
//     // console.log(node);
//     if (node !== null) {
//         console.log(node.idDriver, node.time);
//         if (node.time <= targetTime) {
//             console.log( node.idDriver, node.time);
//             lateShifts.push({ idDriver: node.idDriver, time: node.time });
//             findLateShifts(node.left, targetTime, lateShifts);
//         }
//         if (node.time > targetTime) {
//             findLateShifts(node.left, targetTime, lateShifts);
//         }
//     }
//     // console.log("lateShifts-" + lateShifts.root);

// }

// function findEarlyShifts(node, targetTime, earlyShifts) {
//     if (node !== null) {
//         if (node.time >= targetTime) {
//             earlyShifts.push({ idDriver: node.idDriver, time: node.time });
//             findEarlyShifts(node.right, targetTime, earlyShifts);
//         }
//         if (node.time < targetTime) {
//             findEarlyShifts(node.right, targetTime, earlyShifts);
//         }
//     }
//     // console.log("earlyShifts-" + earlyShifts.root);
// }

// module.exports = { addShiftsToBST };


//------------------------------------------------

// const { Shift } = require('../models/tablesModel')
// // const AVLTree = require('avl-tree');

// // Define the Node class
// class Node {
//     constructor(idDriver, time) {
//         this.idDriver = idDriver;
//         this.time = time;
//         this.left = null;
//         this.right = null;
//         this.height = 1; // Optional AVL tree height property
//         this.parent=null;
//     }
// }

// // Define the AVLTree class
// class AVLTree {
//     constructor(compareFn) {
//         this.root = null;
//         this.compare = compareFn;
//     }

//     // Helper function to get the height of a node
//     getHeight(node) {
//         if (node === null) {
//             return 0;
//         }
//         return node.height;
//     }

//     // Helper function to update the height of a node
//     updateHeight(node) {
//         node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
//     }

//     // Helper function to perform left rotation
//     leftRotate(node) {
//         const newRoot = node.right;
//         node.right = newRoot.left;
//         newRoot.left = node;

//         this.updateHeight(node);
//         this.updateHeight(newRoot);

//         return newRoot;
//     }

//     // Helper function to perform right rotation
//     rightRotate(node) {
//         const newRoot = node.left;
//         node.left = newRoot.right;
//         newRoot.right = node;

//         this.updateHeight(node);
//         this.updateHeight(newRoot);

//         return newRoot;
//     }

//     // Helper function to balance the AVL tree
//     balance(node) {
//         const balanceFactor = this.getHeight(node.left) - this.getHeight(node.right);

//         if (balanceFactor > 1) {
//             // Left subtree is heavier
//             if (this.compare(node.left, node.left.right) > 0) {
//                 node.left = this.leftRotate(node.left);
//             }
//             return this.rightRotate(node);
//         } else if (balanceFactor < -1) {
//             // Right subtree is heavier
//             if (this.compare(node.right, node.right.left) < 0) {
//                 node.right = this.rightRotate(node.right);
//             }
//             return this.leftRotate(node);
//         }

//         return node; // No rotation needed
//     }

//     // Insert a node into the AVL tree
//     insertNode(node, newNode) {
//         if (node === null) {
//             return newNode;
//         }

//         if (this.compare(newNode, node) < 0) {
//             node.left = this.insertNode(node.left, newNode);
//         } else {
//             node.right = this.insertNode(node.right, newNode);
//         }

//         this.updateHeight(node);
//         return this.balance(node);
//     }

//     // Public method to insert a node into the AVL tree
//     insert(idDriver, time) {
//         const newNode = new Node(idDriver, time);
//         // console.log(newNode);
//         this.root = this.insertNode(this.root, newNode);
//     }
// }

// function printTree(node) {
//     if (node !== null) {
//         printTree(node.left);
//         console.log(`idDriver: ${node.idDriver}, time: ${node.time}`);
//         printTree(node.right);
//     }
// }


// //מכניס את זמני כל המשמרות ל-2 עצים לפי התחלה וסיום
// const addShiftsToBST = async (result) => {

//     const shifts = await Shift.find({}); // מציאת כל המשמרות במסד הנתונים
//     // console.log(shifts);


//     const avlTree1 = new AVLTree((a, b) => {
//         if (a === null || b === null) {
//             // Handle the case where either a or b is null
//             return 0; // or return a default value based on your requirements
//         }
//         if (a.time < b.time) {
//             return -1;
//         } else if (a.time > b.time) {
//             return 1;
//         } else {
//             return 0;
//         }
//     });

//     const avlTree2 = new AVLTree((a, b) => {
//         if (a === null || b === null) {
//             // Handle the case where either a or b is null
//             return 0; // or return a default value based on your requirements
//         }
//         if (a.time < b.time) {
//             return -1;
//         } else if (a.time > b.time) {
//             return 1;
//         } else {
//             return 0;
//         }
//     });



//     for (const shift of shifts) {
//         // console.log(shift.beginOfshift,shift.idDriver,shift.endOfshift);
//         avlTree1.insert(shift.idDriver, shift.beginOfshift);
//         avlTree2.insert(shift.idDriver, shift.endOfshift);
//     }

//     // console.log(avlTree1);
//     // Assuming you have an AVL tree instance named avlTree
//     // printTree(avlTree1.root);
//     // console.log("*****************");
//     printTree(avlTree2.root);

//     searchDriverByShiftTime(avlTree1, avlTree2, result);
// }

// //חיפוש נהג לפי זמן משמרת מתאימה או להוסיף נסיעה לפני משמשרת
// //או נסיעה אחרי משמרת לפי הזמן של הנסיעה
// function searchDriverByShiftTime(avlTree1, avlTree2, result) {
//     const time = result.timeOfExit;
//     console.log(time);
//     const afterShifts = []
//     const beforeShifts = []
//     console.log(result, afterShifts, beforeShifts);
//     // findEarlyShifts(avlTree1.root, time, beforeShifts)
//     findLateShifts(avlTree2.root, time, afterShifts)

// }

// //מציאת נהגים שיוכלו להוסיף נסיעה אחרי משמרת
// function findLateShifts(node, targetTime, lateShifts) {
//     if (node !== null) {
//         // console.log("aaaa" + node.time);
//         //  debugger;
//         if (node.time <= targetTime) {
//             // הוסף את הנסיעה המאוחרת לרשימה
//             lateShifts.push({ idDriver: node.idDriver, time: node.time });
//             findLateShifts(node.left, targetTime, lateShifts);
//         }
//         if (node.time > targetTime) {
//             // עבור על תת העץ הימני
//             findLateShifts(node.left, targetTime, lateShifts);
//         }
//         // if (node.time > targetTime) {
//         //     // עבור על תת העץ השמאלי
//         //     findLateShifts(node.left, targetTime, lateShifts);
//         // }
//     }
//     console.log(lateShifts.length);
//     lateShifts.forEach((result) => {
//         console.log(result)});
// }

// //מציאת נהגים שיוכלו להוסיף נסיעה לפני משמרת
// function findEarlyShifts(node, targetTime, earlyShifts) {
//     // console.log();
//     if (node !== null) {
//         if (node.time > targetTime) {
//             // Add the early shift to the list
//             earlyShifts.push({ idDriver: node.idDriver, time: node.time });
//         }
//         // if (node.time >= targetTime) {
//         //     // Traverse the right subtree
//         //     findEarlyShifts(node.left, targetTime, earlyShifts);
//         // }
//         if (node.time < targetTime) {
//             // Traverse the left subtree
//             findEarlyShifts(node.right, targetTime, earlyShifts);
//         }
//     }
//     earlyShifts.forEach((result) => {
//         console.log(result)
//     });
//     // console.log("ccccc"+earlyShifts);
// }

// module.exports = { addShiftsToBST }


























// function printTree(node) {
//     console.log(node.time);
//    printSubtree(node.left.left, "├──", "│  ");
//    printSubtree(node.right, "└──", "   ");
// }


// function printSubtree(node, prefix, childPrefix) {
    //     if (node === null) {
    //         return;
    //     }
    //     console.log(prefix, node.time);
    //     printSubtree(node.left, childPrefix + "├──", childPrefix + "│  ");
    //     printSubtree(node.right, childPrefix + "└──", childPrefix + "   ");
    // }



   // Create a new AVL tree with a custom compare function
    // const avlTree1 = new AVLTree((a, b) => {
    //     if (a === null || b === null) {
    //         // Handle the case where either a or b is null
    //         return 0; // or return a default value based on your requirements
    //     }
    //     return a.time - b.time;
    // });

      // const avlTree2 = new AVLTree((a, b) => {
    //     if (a === null || b === null) {
    //         // Handle the case where either a or b is null
    //         return 0; // or return a default value based on your requirements
    //     }
    //     return a.time - b.time;
    // });
    // const avlTree = new AVLTree((a, b) => a.time - b.time);


// const {BinarySearchTree} = require('binary-search-tree');
// const { insertNode, searchNode } = require('binary-search-tree');
// const { Shift } = require('../models/tablesModel')
// const { Travel } = require('../models/tablesModel');
// const AVLTree = require('avl');

// const AVLTree = require('avl-tree');

// Define the Node class
// class Node {
//   constructor(idDriver, time) {
//     this.idDriver = idDriver;
//     this.time = time;
//     this.left = null;
//     this.right = null;
//     this.height = 1; // Optional AVL tree height property
//   }
// }


// Define a function to insert nodes into the AVL tree
// function insertNode(tree, idDriver, time) {
//     const node = new Node(idDriver, time);
//     tree.insert(node);
// }


// const addShiftsToBST = async (result) => {
//     const time = result.timeOfExit;
//     const driver = result.idDriver;
//     console.log(time, driver);

//     const shifts = await Shift.find({}); // מציאת כל המשמרות במסד הנתונים
//     console.log(shifts);

//     // Create a new AVL tree with a custom compare function
//     const avlTree = new AVLTree((a, b) => a.time - b.time);
//     for (const shift of shifts) {
//         insertNode(avlTree, shift.idDriver, shift.beginOfshift);
//         insertNode(avlTree, shift.idDriver, shift.endOfshift);
//     }

// }
















// / const resultsBeginOfShifts = search(bstStart, time)
    // const resultsEndOfShifts = search(bstStart, time)
    // const allTimesOfFitShifts = []
    // push.allTimesOfFitShifts(resultsBeginOfShifts)
    // push.allTimesOfFitShifts(resultsEndOfShifts)
    // console.log(allTimesOfFitShifts);
    // return { bstStart, bstEnd };

// function search(node, time) {
//     const foundShifts = [];

//     if (!node) {
//         return foundShifts;
//     }

//     if (node.value === time) {
//         foundShifts.push(node.beginOfshift, node.idDriver);
//         search(node.left, time); // חיפוש בצורה רקורסיבית בצומת שמאלית
//         search(node.right, time); // חיפוש בצורה רקורסיבית בצומת ימנית
//     } else if (node.beginOfshift > time) {
//         search(node.left, time);
//     } else {
//         search(node.right, time);
//     }
// }


// const travel = Travel.find(travel => travel.idTravel==IdTravel);