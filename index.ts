var request = require('request');
var rp = require('request-promise');

class Main {
    static appID = 'app_id=c7323525&app_key=930bd58936c5facbf2aec3e5156022f2';

    constructor() {
    }

    static async callURL(url: string): Promise<string> {
        let body = await rp(url)

        return body;
    }

    getAndPrintStop(postCode: string) {
        Main.callURL(`https://api.postcodes.io/postcodes/${postCode}`, Main.handlePostCode)
        .then( data  => Main.handlePostCode(data))
        .then();
    }

    static handlePostCode(rawData: string) {
        const dataObject = JSON.parse(rawData);
        const url = `https://api.tfl.gov.uk/StopPoint?radius=2000&stopTypes=NaptanPublicBusCoachTram&lat=${dataObject.result.latitude}&lon=${dataObject.result.longitude}&${Main.appID}`;
        Main.callURL(url, Main.handleLonLat);
    }

    static handleLonLat(rawData: string) {
        const dataObject = JSON.parse(rawData);
        console.log(dataObject);
        for (let i = 0; i < 200; i++) {
            if (dataObject.stopPoints[i] != undefined) {
                Main.printStop(dataObject.stopPoints[i].naptanId);
            }
        }
    }

    static printStop(stopPoint: string) {
        if (stopPoint == "") {
            return;
        }

        console.log(stopPoint);
        Main.callURL(`https://api.tfl.gov.uk/StopPoint/${stopPoint}/Arrivals/?${Main.appID}`, Main.handleBusTimes);
    }

    static handleBusTimes(rawData: string) {
        const dataObject = JSON.parse(rawData);
        dataObject.sort((firstE1, secondE1) => {
            return firstE1.timeToStation > secondE1.timeToStation;
        });
        console.log(dataObject);

        for (let i = 0; i < 5; i++) {
            let currentBus = dataObject[i];
            if (currentBus == undefined) {
                continue;
            }    
            console.log(`Bus Name: ${currentBus.lineName}, ETA: ${Math.round(currentBus.timeToStation / 60)} minutes, Destination: ${currentBus.destinationName}`)
        }
    }



}

let main = new Main();
main.getAndPrintStop('NW5 1TL');
