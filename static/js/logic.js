// Store our API endpoint inside queryUrl
var pastHour = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson";
// var pastDay = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson";
// var past7Days = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Get 30Day Data
d3.json(earthquakeURL, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h2>Magnitude: " + feature.properties.mag +"</h2><h3>Location: "+ feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .8,
        color: "#000",
        stroke: true,
        weight: .3
    })
  }
  });

  // create map
  createMap(earthquakes);
}


function createMap(earthquakes) {

    // map types
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoia2VuZzg1IiwiYSI6ImNrYmR5ajhiMDBhaGEyeHFxZjd1NjZ0cDgifQ.UrvAKjvUV8fhJq4oIBSwaw." +
      "T6YbdDixkOBWH_k9GbS8JQ");

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoia2VuZzg1IiwiYSI6ImNrYmR5ajhiMDBhaGEyeHFxZjd1NjZ0cDgifQ.UrvAKjvUV8fhJq4oIBSwaw." +
      "T6YbdDixkOBWH_k9GbS8JQ");
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoia2VuZzg1IiwiYSI6ImNrYmR5ajhiMDBhaGEyeHFxZjd1NjZ0cDgifQ.UrvAKjvUV8fhJq4oIBSwaw." +
      "T6YbdDixkOBWH_k9GbS8JQ");
  
    // toggle buttons
    var baseMaps = {
      "Dark Map": darkmap, 
      "Outdoors": outdoors,
      "Satellite": satellite,
      
    };

    // Creat a layer for the toggle views
    var tectonicPlates = new L.LayerGroup();
    //var pastHour = new L.LayerGroup();
    // var pastDay = new L.LayerGroup();
    // var past7Days = new L.LayerGroup();
    // var earthquakes = new L.LayerGroup();

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      //"Within the hour": pastHour,
      "Tectonic Plates": tectonicPlates,
      
    };

    // map display
    var myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 4,
      layers: [darkmap, earthquakes, tectonicPlates]
    }); 

    //Fault lines data
    d3.json(tectonicPlatesURL, function(plateData) {
      // Adding our geoJSON data, along with style information, to the tectonicplates
      // layer.
      L.geoJson(plateData, {
        color: "red",
        weight: 1
      })
      .addTo(tectonicPlates);

    // //hourly data
    // d3.json(pastHour, function(hourData) {
    //     // Adding our geoJSON data, along with style information, to the tectonicplates
    //     // layer.
    //     L.geoJson(hourData, {
    //       color: "red",
    //       weight: 1
    //     })
    //     .addTo(pastHour);


  });

    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  //Create a legend on the bottom left
  var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}
   
  //Create color range for the circle diameter 
  function getColor(d){
    return d > 5 ? "red":
    d  > 4 ? "orange":
    d > 3 ? "yellow":
    d > 2 ? "green":
    d > 1 ? "blue":
            "gray";
  }

  //Change the maginutde of the earthquake by a factor of 25,000 for the radius of the circle. 
  function getRadius(value){
    return value*25000
  }