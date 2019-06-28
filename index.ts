var rp = require('request-promise');

const express = require('express');
const app = express();
var cors = require('cors');
const port = 3000;

class JSONobejct {
    busStops = {};
}

class Bus {
    ETA = 0;
    name = "";
    destination = "";

    constructor(ETA, name, destination) {
        this.ETA = ETA;
        this.name = name;
        this.destination = destination;
    }
}

class Main {
    static appID = 'app_id=c7323525&app_key=930bd58936c5facbf2aec3e5156022f2';

    static res;

    static outputObject = new JSONobejct();

    static stop = false;

    constructor() {
    }

    static async callURL(url: string): Promise<string> {
        try {
            var buffer = await rp(url);
            return buffer;
        }
        catch (error) {
            if (Main.res != undefined) {
                Main.res.send('[]');
            }
            console.log('something went wrong');

            Main.stop = true;
            return "";
        }
    }

    static getAndPrintStop(postCode: string) {
        Main.stop = false;
        Main.callURL(`https://api.postcodes.io/postcodes/${postCode}`)
            .then(data => Main.handlePostCode(data))
            .then(data => Main.handleLonLat(data));

    }

    static handlePostCode(rawData: string): Promise<string> {
        if (Main.stop) {
            return;
        }

        const dataObject = JSON.parse(rawData);
        const url = `https://api.tfl.gov.uk/StopPoint?radius=2000&stopTypes=NaptanPublicBusCoachTram&lat=${dataObject.result.latitude}&lon=${dataObject.result.longitude}&${Main.appID}`;
        return Main.callURL(url);
    }

    static async handleLonLat(rawData: string): Promise<void> {
        if (Main.stop) {
            return;
        }

        const dataObject = JSON.parse(rawData);

        // for (let i = 0; i < 2; i++) {
        //     if (dataObject.stopPoints[i] != undefined) {
        //         Main.outputObject.busStops[dataObject.stopPoints[i].commonName] = [];

        //         await Main.callURL(`https://api.tfl.gov.uk/StopPoint/${dataObject.stopPoints[i].naptanId}/Arrivals/?${Main.appID}`)
        //             .then(data => Main.handleBusTimes(data, dataObject.stopPoints[i].commonName));
        //     }
        // }


        let promises = dataObject.stopPoints.slice(0, 2).map(stopPoint => {
            Main.outputObject.busStops[stopPoint.commonName] = [];

            return Main.callURL(`https://api.tfl.gov.uk/StopPoint/${stopPoint.naptanId}/Arrivals/?${Main.appID}`)
                .then(data => Main.handleBusTimes(data, stopPoint.commonName));
        })

        await Promise.all(promises);


        // let stopRequests = [];

        // for (let i = 0; i < 2; i++) {
        //     if (dataObject.stopPoints[i] != undefined) {
        //         Main.outputObject.busStops[dataObject.stopPoints[i].commonName] = [];

        //         stopRequests.push(Main.callURL(`https://api.tfl.gov.uk/StopPoint/${dataObject.stopPoints[i].naptanId}/Arrivals/?${Main.appID}`)
        //             .then(data => Main.handleBusTimes(data, dataObject.stopPoints[i].commonName)));
        //     }
        // }

        // const stopResults = await Promise.all(stopRequests);

        // console.log(stopResults);

        if (Main.res != undefined) {
            Main.res.send(JSON.stringify(Main.outputObject));
        }
    }

    static handleBusTimes(rawData: string, busStop: string): void {
        const dataObject = JSON.parse(rawData);
        dataObject.sort((firstE1, secondE1) => {
            return firstE1.timeToStation > secondE1.timeToStation;
        });

        for (let i = 0; i < 5; i++) {
            let currentBus = dataObject[i];
            if (currentBus == undefined) {
                continue;
            }

            Main.output(currentBus, busStop);
        }
    }

    static output(currentBus, busStop: string): string {
        if (Main.res == undefined) {
            console.log(`Bus Stop: ${busStop}, Bus Name: ${currentBus.lineName}, ETA: ${Math.round(currentBus.timeToStation / 60)} minutes, Destination: ${currentBus.destinationName}`)
            return;
        }

        Main.outputObject.busStops[busStop].push(new Bus(Math.round(currentBus.timeToStation / 60), currentBus.lineName, currentBus.destinationName));
    }



}

app.use(cors())

app.use(express.static('frontend'));

app.get('/departureBoards', function (req, res) {
    console.log("Got called");

    Main.outputObject = new JSONobejct();
    Main.res = res;
    Main.getAndPrintStop(req.query.postcode);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))