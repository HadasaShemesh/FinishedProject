// // זה פונקציית המרחקים שעובדת
//זה לפונקציית חישוב מרחקים
const https = require('https');
//זה לפונקציית לקיחת מיקומים
const http = require('http');

// const { DOMParser } = require('xmldom');

// //פונקצייה המביאה את המיקום המדויק על המפה לפי מספר תחנה
async function getStationLocation(url) {
  return await new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const { latitude, longitude } = parseLocationData(data);

        if (latitude && longitude) {
          console.log("Longitude:", longitude);
          console.log("Latitude:", latitude);
          resolve({ latitude, longitude });
        } else {
          reject("Error: Failed to parse longitude and latitude");
          resolve({ latitude: null, longitude: null }); // return null values
        }
      });

    }).on('error', (err) => {
      reject(err);
    });
  });
}

function parseLocationData(data) {
  const regex = /<Longitude>([0-9.-]+)<\/Longitude>\s*<Latitude>([0-9.-]+)<\/Latitude>/;
  const match = data.match(regex);

  if (match) {
    const longitude = match[1];
    const latitude = match[2];
    return { latitude, longitude };
  } else {
    return { latitude: null, longitude: null };
  }
}

let latitudePoint1;
let longitudePoint1;
let latitudePoint2;
let longitudePoint2;



async function GetTimeOfTravelBetweenTwoStation(station1,station2) {
  console.log(station1 ,station2);
  const url1 = `http://moran.mot.gov.il:110/Channels/HTTPChannel/SmQuery/2.8/xml?Key=HS51871911&MonitoringRef=${station1}`;
  const url2 = `http://moran.mot.gov.il:110/Channels/HTTPChannel/SmQuery/2.8/xml?Key=HS51871911&MonitoringRef=${station2}`;

  const promise1 =await getStationLocation(url1).then((result) => {
    latitudePoint1 = result.latitude;
    longitudePoint1 = result.longitude;
  }).catch((error) => {
    console.error('An error occurred:', error);
  });

  const promise2 =await getStationLocation(url2).then((result) => {
    latitudePoint2 = result.latitude;
    longitudePoint2 = result.longitude;
  }).catch((error) => {
    console.error('An error occurred:', error);
  });
  
  return Promise.all([promise1, promise2]).then(() => {
    console.log(latitudePoint1,longitudePoint1,latitudePoint2,longitudePoint2)
    return DistanceInMinutes(`${latitudePoint1},${longitudePoint1}`, `${latitudePoint2},${longitudePoint2}`)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

//פונקצייה המחשבת זמן

const axios = require('axios');
const { parseString } = require('xml2js');

function DistanceInMinutes(PointA, PointB) {
const url = `https://maps.googleapis.com/maps/api/distancematrix/xml?origins=${PointA}&destinations=${PointB}&mode=driving&units=imperial&sensor=false&key=AIzaSyAqkCnTh4AgG6mda9gpd-2qi9HK-NEi-TU`;

  return axios.get(url)
    .then(response => {
      const xml = response.data;
      return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
          if (err) {
            reject(err);
          } else {
            // console.log(result); // More printing
            // const duration = result.DistanceMatrixResponse.row[0].element[0].duration[0].value[0];
            const duration = result?.DistanceMatrixResponse?.row?.[0]?.element?.[0]?.duration?.[0]?.value?.[0] ?? null;
            const num = parseInt(duration) / 60;
            resolve(num);
          }
        });
      });
    })
    .catch(error => {
      throw error;
    });
}

/****************************/
//פונקצייה המחשבת מרחקים
function getDistance(origin, dest) {
  console.log(origin,dest);
  const apiKey='AIzaSyAqkCnTh4AgG6mda9gpd-2qi9HK-NEi-TU';
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${dest}&key=${apiKey}`;
  
    https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const {rows} = JSON.parse(data);
      console.log(rows);
      console.log(rows[0].elements[0].distance);
    //   console.log(( result.rows.elements.Array))
      // עכשיו ניתן לעבד את התוצאה בהתאם לצרכי היישומון שלכם.
    });

  }).on('error', (err) => {
    console.log("Error: " + err.message);
  });
}
// ===================================
module.exports={GetTimeOfTravelBetweenTwoStation}



























// function GetTimeOfTravelBetweenTwoStation(station1, station2) {
//   console.log(station1 ,station2);
//   const url1 = `http://moran.mot.gov.il:110/Channels/HTTPChannel/SmQuery/2.8/xml?Key=HS51871911&MonitoringRef=${station1}`;
//   const url2 = `http://moran.mot.gov.il:110/Channels/HTTPChannel/SmQuery/2.8/xml?Key=HS51871911&MonitoringRef=${station2}`;

//   return getStationLocation(url1)
//     .then((result) => {
//       latitudePoint1 = result.latitude;
//       longitudePoint1 = result.longitude;
//       return getStationLocation(url2);
//     })
//     .then((result) => {
//       latitudePoint2 = result.latitude;
//       longitudePoint2 = result.longitude;
//       console.log(latitudePoint1, longitudePoint1, latitudePoint2, longitudePoint2);
//       return DistanceInMinutes(`${latitudePoint1},${longitudePoint1}`, `${latitudePoint2},${longitudePoint2}`);
//     })
//     .then((result) => {
//       console.log(result);
//       return result;
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }

// const axios = require('axios');

// function getStationLocation(url) {
//   return new Promise((resolve, reject) => {
//     axios.get(url)
//       .then((response) => {
//         const { latitude, longitude } = parseLocationData(response.data);

//         if (latitude && longitude) {
//           resolve({ latitude, longitude });
//         } else {
//           reject("Error: Failed to parse longitude and latitude");
//         }
//       })
//       .catch((error) => {
//         reject(error);
//       });
//   });
// }


// //***********************************/
// // //פונקצייה המביאה את המיקום המדויק על המפה לפי מספר תחנה
// function getStationLocation(url) {
//     //  console.log(url);
//     return new Promise((resolve, reject) => {
//         http.get(url, (res) => {
//         let data = '';
  
//         res.on('data', (chunk) => {
//           data += chunk;
//         });
  
//         res.on('end', () => {
//           const vehicleLocationStart = data.indexOf('<VehicleLocation>');
//           const vehicleLocationEnd = data.indexOf('</VehicleLocation>');
//           const vehicleLocationXml = data.substring(vehicleLocationStart, vehicleLocationEnd + 17);
  
//           const longitudeStart = vehicleLocationXml.indexOf('<Longitude>') + 11;
//           const longitudeEnd = vehicleLocationXml.indexOf('</Longitude>');
//           const longitude = vehicleLocationXml.substring(longitudeStart, longitudeEnd);
  
//           const latitudeStart = vehicleLocationXml.indexOf('<Latitude>') + 10;
//           const latitudeEnd = vehicleLocationXml.indexOf('</Latitude>');
//           const latitude = vehicleLocationXml.substring(latitudeStart, latitudeEnd);
//         //  console.log("hey:"+latitude,longitude);
//          if (longitude && latitude) {
//           console.log("Longitude:", longitude);
//           console.log("Latitude:", latitude);
//           resolve({ latitude, longitude });
//       } else {
//           reject("Error: Failed to parse longitude and latitude");
//       }
// })
  
//       }).on('error', (err) => {
//         reject(err);
//       });
//     });
// }









// ---------------------------------
// function DistanceInMinutes(PointA, PointB) {
//     console.log(PointA,PointB);
//     const parseString = require('xml2js').parseString;
//     //  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//     const url = `https://maps.googleapis.com/maps/api/distancematrix/xml?origins=${PointA}&destinations=${PointB}&mode=driving&units=imperial&sensor=false&key=AIzaSyAqkCnTh4AgG6mda9gpd-2qi9HK-NEi-TU`;
//     return new Promise((resolve, reject) => {
//         https.get(url, (res) => {
//             let data = '';
//             res.on('data', (chunk) => {
//                 data += chunk;
//             });
//             res.on('end', () => {
//                 parseString(data, (err, result) => {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         console.log(result); // הדפסה נוספת
//                         const duration = result.DistanceMatrixResponse.row[0].element[0].duration[0].value[0];
//                         const num = parseInt(duration) / 60;
//                         // return num;
//                         resolve(num);
//                         console.log(num);
//                     }
//                 });
//             });
//         }).on('error', (err) => {
//             reject(err);
//         });
//     });
// }
        

//////////////////////////////////////////////



//פונקציה המחשבת את זמן הנסיעה בין 2 תחנות
// function GetTimeOfTravelBetweenTwoStation(station1,station2){
// let latitudePoint1;
// let longitudePoint1;
// let latitudePoint2;
// let longitudePoint2;
// // קריאה לפונקציה עם ה-URL שלך
// const url1 = `http://moran.mot.gov.il:110/Channels/HTTPChannel/SmQuery/2.8/xml?Key=HS51871911&MonitoringRef=${station1}`;
// const url2 = `http://moran.mot.gov.il:110/Channels/HTTPChannel/SmQuery/2.8/xml?Key=HS51871911&MonitoringRef=${station2}`;

// getStationLocation(url1).then((result) => {
//   latitudePoint1 = result.latitude;
//   longitudePoint1 = result.longitude;
//   console.log('The result is:', result);
//   // console.log("---"+latitudePoint1,longitudePoint1);

// }).catch((error) => {
//   console.error('An error occurred:', error);
// });
// getStationLocation(url2).then((result) => {
//   console.log('The result is:', result);
//     latitudePoint2 = result.latitude;
//    longitudePoint2 = result.longitude;
//   //  console.log("---"+latitudePoint2,longitudePoint2);

// }).catch((error) => {
//   console.error('An error occurred:', error);
// });
// console.log("---"+latitudePoint1,longitudePoint1);
// console.log("---"+latitudePoint2,longitudePoint2);


// // return  DistanceInMinutes(`${latitudePoint1},${longitudePoint1}`,`${latitudePoint2},${longitudePoint2}`)


// // Promise.all([getStationLocation(url1), getStationLocation(url2)])
// //   .then(([result1, result2]) => {
// //     latitudePoint1 = result1.latitude;
// //     longitudePoint1 = result1.longitude;
// //     latitudePoint2 = result2.latitude;
// //     longitudePoint2 = result2.longitude;
// //     console.log(latitudePoint1,longitudePoint1,latitudePoint2,longitudePoint2);
// //     //  getDistance(`${latitudePoint1},${longitudePoint1}`,`${latitudePoint2},${longitudePoint2}`)
// //      return  DistanceInMinutes(`${latitudePoint1},${longitudePoint1}`,`${latitudePoint2},${longitudePoint2}`)
// //      .then((result) => {
// //       return result
// //         //  console.log(result);
// //      }).catch((err) => {
// //      console.error(err);
// //     });


// //   })
// //   .catch((error) => {
// //     console.log("Error: " + error.message);
// //   });

// }



































//פונקצייה המחשבת זמן
// const { parseString } = require('xml2js');

// function DistanceInMinutes(PointA, PointB) {
//   console.log(PointA,PointB);
//   return new Promise((resolve, reject) => {
//     const url = `https://maps.googleapis.com/maps/api/distancematrix/xml?origins=${PointA}&destinations=${PointB}&mode=driving&units=imperial&sensor=false&key=AIzaSyAqkCnTh4AgG6mda9gpd-2qi9HK-NEi-TU`;
    
//     https.get(url, (res) => {
//       let data = '';
      
//       res.on('data', (chunk) => {
//         data += chunk;
//       });
      
//       res.on('end', () => {
//         parseString(data, (err, result) => {
//           if (err) {
//             reject(err);
//           } else {
//             try {
//               const duration = result.DistanceMatrixResponse.row[0].element[0].duration[0].value[0];
//               const num = parseInt(duration) / 60;
//               resolve(num);
//             } catch (error) {
//               reject(new Error('Failed to extract duration from the API response.'));
//             }
//           }
//         });
//       });
//     }).on('error', (err) => {
//       reject(err);
//     });
//   });
// }







// .then(({ latitude, longitude }) => {
//     console.log('Latitude:', latitude);
//     console.log('Longitude:', longitude);
//     latitudePoint1=latitude
//     longitudePoint1=longitude
//     console.log(latitudePoint1);
//     console.log(longitudePoint1);
//   })
//   .catch((error) => {
//     console.log("Error: " + error.message);
//   });

// getStationLocation(url2)
// .then(({ latitude, longitude }) => {
//     console.log('Latitude:', latitude);
//     console.log('Longitude:', longitude);
//     latitudePoint2=latitude
//     longitudePoint2=longitude
//     console.log(latitudePoint2);
//     console.log(longitudePoint2);
//   })
//   .catch((error) => {
//     console.log("Error: " + error.message);
//   });

//   const concatenatedString = longitudePoint1 + ',' + latitudePoint1;
//   console.log(concatenatedString); // פלט: "34.649528,31.788841"

  

    {/* <Longitude>34.653903</Longitude>קו אורך
    <Latitude>31.789937</Latitude> */}//קו רוחב
    //להכניס קודם קו רוחב ואז קו אורך
    // קריאה לפונקציה עם פרמטרים של כתובת המקור, היעד ומפתח ה-API שלכם.
    // getDistance('31.789937,34.653903', '31.788841,34.649528', 'AIzaSyAqkCnTh4AgG6mda9gpd-2qi9HK-NEi-TU');
    // getDistance('31.789937,34.653903', '31.788841,34.649528');

//   קריאה לפונקצייה לאחר שקבלתי נקודות
//   getDistance(`${latitudePoint1},${longitudePoint1}`,`${latitudePoint2},${longitudePoint2}`)

//****************************************************/
// // / <summary>
// //         עובד חישוב זמן
// //         / פונקציה המחזירה את זמן הנסיעה בדקות בין מקום אחד למשנהו
// //         / <returns>זמן הנסיעה בדקות</returns>
//         const https = require('https');
//         const parseString = require('xml2js').parseString;

//         function DistanceInMinutes(PointA, PointB) {
//             const url = `https://maps.googleapis.com/maps/api/distancematrix/xml?origins=${PointA}&destinations=${PointB}&mode=driving&units=imperial&sensor=false&key=AIzaSyAqkCnTh4AgG6mda9gpd-2qi9HK-NEi-TU`;
//             return new Promise((resolve, reject) => {
//                 https.get(url, (res) => {
//                     let data = '';
//                     res.on('data', (chunk) => {
//                         data += chunk;
//                     });
//                     res.on('end', () => {
//                         parseString(data, (err, result) => {
//                             if (err) {
//                                 reject(err);
//                             } else {
//                                 const duration = result.DistanceMatrixResponse.row[0].element[0].duration[0].value[0];
//                                 const num = parseInt(duration) / 60;
//                                 resolve(num);
//                             }
//                         });
//                     });
//                 }).on('error', (err) => {
//                     reject(err);
//                 });
//             });
//         }
//         // Usage:
//         DistanceInMinutes('אשקלון', 'אשדוד').then((result) => {
//             console.log(result);
//         }).catch((err) => {
//             console.error(err);
//         });



        
//         // const https = require('https');
//         // const parseString = require('xml2js').parseString;
//         // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//         // const options = {
//         //   hostname: 'moran.mot.gov.il',
//         //   port: 110,
//         //   path: '/Channels/HTTPChannel/SmQuery/2.8/xml?Key=HS51871911&MonitoringRef=AllActiveTripsFilter&StopMonitoringDetailLevel=normal',
//         //   method: 'GET'
//         // };
        
//         // const req = https.request(options, (res) => {
//         //   let data = '';
          
//         //   res.on('data', (chunk) => {
//         //     data += chunk;
//         //   });
          
//         //   res.on('end', () => {
//         //     parseString(data, (err, result) => {
//         //       if (err) {
//         //         console.error(err);
//         //       } else {
//         //         console.log(result);
//         //       }
//         //     });
//         //   });
//         // });
        
//         // req.on('error', (error) => {
//         //   console.error(error);
//         // });
        
//         // req.end();
        





// const https = require('https');

//  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// // const options = {
// //   hostname: 'moran.mot.gov.il',
// //   port: 110,
// //   path: '/Channels/HTTPChannel/SmQuery/2.8/xml?Key=HS51871911&MonitoringRef=AllActiveTripsFilter&StopMonitoringDetailLevel=normal',
// //   method: 'GET',
// //   rejectUnauthorized: false
// // };

// const req = https.request(options, (res) => {
//   let data = '';
  
//   res.on('data', (chunk) => {
//     data += chunk;
//   });
  
//   res.on('end', () => {
//     console.log(data);
//   });

//   // res.on('end', () => {
//   //   const jsonData = JSON.parse(data);
//   //   console.log(jsonData);
//   // });

// });

// req.on('error', (error) => {
//   console.error(error);
// });

// req.end();


 






// // function distanceURL(origin, dest) {
// //     const API_KEY = 'AIzaSyAqkCnTh4AgG6mda9gpd-2qi9HK-NEi-TU';
// //     const URL = `http://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${dest}&units=imperial&mode=driving&key=${API_KEY}`;
// //     return URL;
// // }


// // // const axios = require('axios');

// // async function getDistance(l1, l2) {
// //   const strL1 = `${l1.PointLatitudeLoctionX}${l1.PointLatitudeLoctiony}`;
// //   const strL2 = `${l2.PointLatitudeLoctionX}${l2.PointLatitudeLoctiony}`;
// //   const responseDistance = await axios.get(DistanceURL(strL1, strL2));
// //   if (responseDistance.status === 200) {
// //     const myResult = responseDistance.data;
// //     const jsonResult = JSON.parse(myResult);
// //     return jsonResult.rows[0].elemnts[0].distance.text;
// //   }
// //   // If not successful
// //   return '';
// // }




// // const axios = require('axios');

// // const apiKey = 'AIzaSyAqkCnTh4AgG6mda9gpd-2qi9HK-NEi-TU';
// // const origin = 'New York, NY';
// // const destination = 'Los Angeles, CA';

// // const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

// // axios.get(url)
// //   .then(response => {
// //     const distance = response.data.rows[0].elements[0].distance.text;
// //     console.log(`The distance between ${origin} and ${destination} is ${distance}.`);
// //   })
// //   .catch(error => {
// //     console.log('Error:', error.message);
// //   });







// // const https = require('https');

// // function getDistance(origin, destination, apiKey) {
// //   return new Promise((resolve, reject) => {
// //     const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destination}&key=${apiKey}`;

// //     https.get(url, (res) => {
// //       let data = '';
// //       res.on('data', (chunk) => {
// //         data += chunk;
// //       });
// //       res.on('end', () => {
// //         const distance = JSON.parse(data).rows[0].elements[0].distance.value;
// //         resolve(distance);
// //       });
// //     }).on('error', (err) => {
// //       reject(err);
// //     });
// //   });
// // }

