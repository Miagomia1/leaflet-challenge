// Create the map and set its view to be centered on the United States
var map = L.map('map').setView([37.0902, -95.7129], 4);

// Add OpenStreetMap tiles to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// URL for the USGS GeoJSON feed for the past 7 days of all earthquakes
var geojsonUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to determine the color of the marker based on the depth of the earthquake
function getColor(depth) {
    return depth > 70 ? 'darkred' :
           depth > 50 ? 'red' :
           depth > 30 ? 'orange' :
           depth > 10 ? 'yellow' :
                        'green';
}

// Function to determine the radius of the marker based on the magnitude of the earthquake
function getRadius(magnitude) {
    return magnitude * 4;  // Size of the marker increases with magnitude
}

// Fetch the GeoJSON data and create markers
d3.json(geojsonUrl).then(function(data) {
    L.geoJSON(data, {
        // Create circle markers for each earthquake
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getRadius(feature.properties.mag),  // Set radius based on magnitude
                fillColor: getColor(feature.geometry.coordinates[2]), // Color based on depth
                color: "#000",  // Border color
                weight: 1,      // Border width
                fillOpacity: 0.7 // Transparency
            });
        },
        // Add popups to display additional information when each marker is clicked
        onEachFeature: function(feature, layer) {
            layer.bindPopup(
                `<b>Location:</b> ${feature.properties.place}<br>
                 <b>Magnitude:</b> ${feature.properties.mag}<br>
                 <b>Depth:</b> ${feature.geometry.coordinates[2]} km`
            );
        }
    }).addTo(map);
});

// Custom legend for earthquake depth
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'legend');
    var grades = [0, 10, 30, 50, 70];
    var labels = ['<strong>Earthquake Depth (km)</strong>'];

    // Loop through depth intervals to create a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '; width: 18px; height: 18px; display: inline-block;"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' km<br>' : '+ km');
    }

    return div;
};

// Add the legend to the map
legend.addTo(map);
