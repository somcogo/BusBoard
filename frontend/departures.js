function createBusStopOutputString(busStops, name) {
    var output = `<div class="stop-results"><h3>${name}</h3><ul>`;
    for (let busStop of busStops) {
        output += `<li>${busStop.ETA} minutes: ${busStop.name} to ${busStop.destination}</li>\n`;
    }

    output += "</ul></div>";

    return output;
}

function getPostCodeUpdate() {

    var postcode = document.forms["postCodeForm"]["postcode"].value;

    if (5 > postcode.replace(' ', '').length || postcode.replace(' ', '').length > 7) {
        document.getElementById("results").innerHTML = '<h3>Invalid input<h3>';
        return;
    }

    var xhttp = new XMLHttpRequest();

    xhttp.onload = function () {
        const dataObject = JSON.parse(xhttp.responseText);

        if (dataObject.length == 0) {
            document.getElementById("results").innerHTML = '<h3>Invalid input<h3>';
            return;
        }

        var output = ` <h2>Results</h2>`;
        console.log('Added results');
        for (var key in dataObject.busStops) {
            // check if the property/key is defined in the object itself, not in parent
            if (dataObject.busStops[key] != undefined) {
                output += createBusStopOutputString(dataObject.busStops[key], key);
            }
        }
        console.log(output);
        document.getElementById("results").innerHTML = output;
    }

    xhttp.open('GET', `http://localhost:3000/departureBoards?postcode=${postcode}`, true);

    xhttp.send();

}