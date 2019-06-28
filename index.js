var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var rp = require('request-promise');
var express = require('express');
var app = express();
var cors = require('cors');
var port = 3000;
var JSONobejct = /** @class */ (function () {
    function JSONobejct() {
        this.busStops = {};
    }
    return JSONobejct;
}());
var Bus = /** @class */ (function () {
    function Bus(ETA, name, destination) {
        this.ETA = 0;
        this.name = "";
        this.destination = "";
        this.ETA = ETA;
        this.name = name;
        this.destination = destination;
    }
    return Bus;
}());
var Main = /** @class */ (function () {
    function Main() {
    }
    Main.callURL = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, rp(url)];
                    case 1:
                        buffer = _a.sent();
                        return [2 /*return*/, buffer];
                    case 2:
                        error_1 = _a.sent();
                        if (Main.res != undefined) {
                            Main.res.send('[]');
                        }
                        console.log('something went wrong');
                        Main.stop = true;
                        return [2 /*return*/, ""];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Main.getAndPrintStop = function (postCode) {
        Main.stop = false;
        Main.callURL("https://api.postcodes.io/postcodes/" + postCode)
            .then(function (data) { return Main.handlePostCode(data); })
            .then(function (data) { return Main.handleLonLat(data); });
    };
    Main.handlePostCode = function (rawData) {
        if (Main.stop) {
            return;
        }
        var dataObject = JSON.parse(rawData);
        var url = "https://api.tfl.gov.uk/StopPoint?radius=2000&stopTypes=NaptanPublicBusCoachTram&lat=" + dataObject.result.latitude + "&lon=" + dataObject.result.longitude + "&" + Main.appID;
        return Main.callURL(url);
    };
    Main.handleLonLat = function (rawData) {
        return __awaiter(this, void 0, void 0, function () {
            var dataObject, promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (Main.stop) {
                            return [2 /*return*/];
                        }
                        dataObject = JSON.parse(rawData);
                        promises = dataObject.stopPoints.slice(0, 20).map(function (stopPoint) {
                            Main.outputObject.busStops[stopPoint.commonName] = [];
                            console.log(stopPoint.commonName);
                            return Main.callURL("https://api.tfl.gov.uk/StopPoint/" + stopPoint.naptanId + "/Arrivals/?" + Main.appID)
                                .then(function (data) { return Main.handleBusTimes(data, stopPoint.commonName); });
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
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
                        return [2 /*return*/];
                }
            });
        });
    };
    Main.handleBusTimes = function (rawData, busStop) {
        var dataObject = JSON.parse(rawData);
        dataObject.sort(function (firstE1, secondE1) {
            return firstE1.timeToStation > secondE1.timeToStation;
        });
        for (var i = 0; i < 5; i++) {
            var currentBus = dataObject[i];
            if (currentBus == undefined) {
                continue;
            }
            Main.output(currentBus, busStop);
        }
    };
    Main.output = function (currentBus, busStop) {
        if (Main.res == undefined) {
            console.log("Bus Stop: " + busStop + ", Bus Name: " + currentBus.lineName + ", ETA: " + Math.round(currentBus.timeToStation / 60) + " minutes, Destination: " + currentBus.destinationName);
            return;
        }
        Main.outputObject.busStops[busStop].push(new Bus(Math.round(currentBus.timeToStation / 60), currentBus.lineName, currentBus.destinationName));
    };
    Main.appID = 'app_id=c7323525&app_key=930bd58936c5facbf2aec3e5156022f2';
    Main.outputObject = new JSONobejct();
    Main.stop = false;
    return Main;
}());
app.use(cors());
app.use(express.static('frontend'));
app.get('/departureBoards', function (req, res) {
    console.log("Got called");
    Main.outputObject = new JSONobejct();
    Main.res = res;
    Main.getAndPrintStop(req.query.postcode);
});
app.listen(port, function () { return console.log("Example app listening on port " + port + "!"); });
