/* =====================
  Imports Required in HTML FIle
===================== */

// <script src="js/underscore.js"></script>
// <script src="js/jquery-2.2.0.js"></script>
// <script src="js/final_project - Diwen Shen.js"></script>
// <script src="jquery-csv.js"></script>

/* =====================
  Set Up Initial Map
===================== */

// Initially zoom to University City
var map = L.map('map', {
  center: [39.952380, -75.163635],
  zoom: 12
});

var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(map);


/* =====================
  Scrape Bus Schedule Data from SEPTA's Website Using Python and the Beautiful Soup 4 API
===================== */

// This step is performed using Python, see Python code
// Beautiful Soup 4 is a popular API that can read and extract html elements similar to in JQuery
// I have spent significant effort writing the Python program and hope it can be considered a significant part of my project

// What the Python code does:
// 1. Download all SEPTA bus schedules (one html file per bus line) from http://www.septa.org/schedules/bus/
// 2. Read html files and extract the html elements that include the departure times for each bus route
// 3. Clean the data and put into a readable, list format
// 4. For each bus route, calculate the service frequency for each hour of the day, taking into account many different scenarios and edge cases
// 5. Export the 24-hour frequency data for all bus routes into one csv, to be imported in JavaScript

// The Python code automatically downloads all URLs and performs data cleaning and calculations on them,
// taking into account different bus schedule scenarios and edge cases so it can function universally without manual adjustment


/* =====================
  Import and Clean Bus Schedule Data
===================== */

var headways_link = "https://raw.githubusercontent.com/stevendshen/Datasets---Diwen-Shen/master/output.csv";
var headways;
var headways_dictionary = [];

// Using Jquery.CSV library, read CSV file for bus schedules
// Make sure to use the ready function, so that all the other ready functions in this script run in sequence AFTER this
$(document).ready(function() {
  $.ajax({
      url: headways_link,
      async: true,
      success: function (csvd) {
          headways = $.csv.toArrays(csvd);
      },
      dataType: "text",
      complete: function () { // call a function on complete

          // save headway info into dictionary, where the keys are route numbers
          for (i = 0; i < headways.length; i++){
            headways_dictionary[headways[i][0]] = headways[i].slice(1, 25);
          }

          // print to console
          console.log(headways[0]); // each row in the array contains the route number and then headways for each hour
          console.log(headways_dictionary["47m"]);

      }
  });
});



/* =====================
  Initialize Variables
===================== */

// Text Controls
// Page number message Initialize
$("#page-message").text("");

// Initialize text
$("#main-heading").text("Exploring Service Frequencies in the SEPTA Bus Network"); // main heading
$("#title").text("Towards a Frequency-Based Map"); // title of the slide
$(".main-text-1").text("Use the slider and checkbox below to visualize bus service frequencies for specified times of day and categories. Once they are mapped, click on individual lines to get their service frequency."); // main text 1
$("#instructions").text("Default map: Mode-Based Map");

var parsedData;
var feature_group_subway;
var feature_group_1;
var feature_group_2;
var feature_group_3;
var feature_group_9;
var default_layer;


/* =====================
  Original GEOJSON Data
===================== */


// Data Link
// var route_data_link = "https://raw.githubusercontent.com/stevendshen/Datasets---Diwen-Shen/master/SEPTARoutesSpring2016.geojson";
// var stop_data_link = "https://raw.githubusercontent.com/stevendshen/Datasets---Diwen-Shen/master/SEPTAStopsByLineSpring2016.geojson";

// Attributes
// {"LINENAME": "Parx Casino to 54th-City",
// "tpField071": "Southbound",
// "tpField070": "Northbound",
// "LINEABBR": "1",
// "REVENUENO": "City",
// "tpField01": "COM",
// "tpField00": 1,
// "DIRNUM0": 0,
// "DIRNUM1": 1,
// "tpField05": "Parx Casino",
// "tpField06": "54th-City",
// "tpField02": "FRA",
// "Shape_Leng": 242031.474133}



/* =====================
  Getter Functions
===================== */

// find the exact frequency of a specific line and hour in a readable format
var find_frequency = function(line_number, hour){
  return headways_dictionary[line_number.toString()][hour+1] + " min";
};


// find the frequency category of a specific line and hour
// 1 = <15min, 2 = 16-30min, 3 = >30min, 9 = N/A
var find_frequency_cat = function(line_number, hour){
  freq = headways_dictionary[line_number.toString()][hour+1];
  if (freq == "--"){
    return 9;
  } else if (freq == ">60"){
    return 3;
  } else if (parseInt(freq) <= 15){
    return 1;
  } else if (parseInt(freq) <= 30){
    return 2;
  } else {
    return 3;
  }
};


/* =====================
  Carto
===================== */

var default_layer;
var default_layer_mapped = false; // store whether the default layer has been mapped

var draw_carto_default = function(){
  if (default_layer_mapped === false){
    var cartoUserName = 'stevendshen';
    var cartoVizId = '62b96550-9e54-4227-a2d5-ee73ddd8f27e';
    var layerUrl = 'https://'+cartoUserName+'.carto.com/api/v2/viz/'+cartoVizId+'/viz.json';

    cartodb.createLayer(map, layerUrl).on('done', function(layer) {
        default_layer = layer;
        map.addLayer(default_layer);
      }).on('error', function(err) {
        console.log(err);
      });

    default_layer_mapped = true;
  }
};

draw_carto_default();

var remove_default_layer = function(){
  if (default_layer_mapped === true){
    default_layer.remove();
    default_layer_mapped = false;
  }
};

var layer_subway; // initialize subway layer
var subway_mapped = false;

// Draw the MFL and BSL
var draw_carto_subways = function(){

  // Carto draw according to SQL call
  var sqlClient = new cartodb.SQL({
    user: 'stevendshen',
    format: 'geojson'
  });

  var style_subway = function(feature) {
    if (feature.properties.lineabbr == "MFL"){
      return {color: 'blue', opacity: 1, weight: 3};
    } else {
      return {color: 'orange', opacity: 1, weight: 3};
    }
  };

  // Then we specify the SQL we want to execute (the second argument is where params are provided)
  // e.g.: sqlClient.execute("SELECT * FROM pizza_ratings WHERE ratings > {{rating}}", {rating: 4})
  sqlClient.execute("(SELECT * FROM septa_mfl) UNION (SELECT * FROM septa_bsl)")
    .done(function(data) {
      layer_subway = L.geoJson(data, {
        style: style_subway,
        onEachFeature: function(feature, layer) {
          layer.on('click', function() { console.log(feature.properties.lineabbr); });
        }
      }).addTo(map);
    })
    .error(function(errors) {
    });

    // Mark that subway has been mapped
    subway_mapped = true;
};

var remove_subway_layer = function(){
  if (subway_mapped === true){
    layer_subway.clearLayers();
    subway_mapped = false;
  }
};


// Takes frequency category (1,2,3,9) and hour of day (0-23), maps bus lines
var draw_freq = function(freq_cat, hour){

  // Carto draw according to SQL call
  var sqlClient = new cartodb.SQL({
    user: 'stevendshen',
    format: 'geojson'
  });

  // Initialize SQL call
  sql = "SELECT * FROM septaroutesspring2016 WHERE lineabbr = '0'"; // initialize sql query, such that it does not crash if no i matches for loop

  // Loop through all bus lines in the headways dictionary, add them to SQL call if they match criteria
  for (i = 0; i < Object.keys(headways_dictionary).length; i++){
    // console.log(find_frequency_cat(Object.keys(headways_dictionary)[i], 12));
    if (find_frequency_cat(Object.keys(headways_dictionary)[i], hour) == freq_cat){
      sql += "OR lineabbr = '" + Object.keys(headways_dictionary)[i] + "'";
    }
  }

  // Create the style here, since it depends on freq_cat
  var style_by_freq = function(feature) {
    if (freq_cat == 1){
      return {color: 'DarkRed', opacity: 0.8, weight: 3};
    } else if (freq_cat == 2){
      return {color: 'DarkTurquoise', opacity: 1.0, weight: 3};
    } else if (freq_cat == 3){
      return {color: 'DarkSeaGreen', opacity: 0.8, weight: 3};
    }
  };

  // Then we specify the SQL we want to execute (the second argument is where params are provided)
  // e.g.: sqlClient.execute("SELECT * FROM pizza_ratings WHERE ratings > {{rating}}", {rating: 4})
  // Create feature groups based on frequency category
  // For some reason, feature groups cannot be overwritten. If overwritten, the original feature group cannot be cleared from the map.
  sqlClient.execute(sql).done(function(data) {
    $("#page-message").text("Mapping Complete");
    if (freq_cat == 1){
      feature_group_1 = L.geoJson(data, {
        style: style_by_freq, // style
        onEachFeature: function(feature, layer) {
          layer.on('click', function() { $("#instructions").text("Line: " + feature.properties.lineabbr + " Frequency at " + hour + "HRS: " + find_frequency(feature.properties.lineabbr, hour)); });
        }}).addTo(map);
    } else if (freq_cat == 2){
      feature_group_2 = L.geoJson(data, {
        style: style_by_freq, // style
        onEachFeature: function(feature, layer) {
          layer.on('click', function() { $("#instructions").text("Line: " + feature.properties.lineabbr + " Frequency at " + hour + "HRS: " + find_frequency(feature.properties.lineabbr, hour)); });
        }}).addTo(map);
    } else if (freq_cat == 3){
      feature_group_3 = L.geoJson(data, {
        style: style_by_freq, // style
        onEachFeature: function(feature, layer) {
          layer.on('click', function() { $("#instructions").text("Line: " + feature.properties.lineabbr + " Frequency at " + hour + "HRS: " + find_frequency(feature.properties.lineabbr, hour)); });
        }}).addTo(map);
    } else if (freq_cat == 9){
      feature_group_9 = L.geoJson(data, {
        style: style_by_freq, // style
        onEachFeature: function(feature, layer) {
          layer.on('click', function() { $("#instructions").text("Line: " + feature.properties.lineabbr + " Frequency at " + hour + "HRS: " + find_frequency(feature.properties.lineabbr, hour)); });
        }}).addTo(map);
    }
  }).error(function(errors) {
  });
  $("#page-message").text("Calling SQL Query and Mapping. This Might Take a While ...");
};


// Clear all layers
var clear_all_layers = function(){
  if(feature_group_1 !== undefined){feature_group_1.clearLayers();}
  if(feature_group_2 !== undefined){feature_group_2.clearLayers();}
  if(feature_group_3 !== undefined){feature_group_3.clearLayers();}
  if(feature_group_9 !== undefined){feature_group_9.clearLayers();}
};

/* =====================
  Slider and Checkbox
===================== */

// Initialize sidebar and checkbox variables
var selected_hour = 0; // store the selected hour (0-23)
var checkbox_values; // Initialize variables for checkbox
var selectors = ["#cbox-input1", "#cbox-input2", "#cbox-input3"]; // Get Input Values
var labels = ["#checkbox-label1", "#checkbox-label2", "#checkbox-label3"];


// Function that reads and stores the value of the slider
$( function() {
    var select = $( "#hour" );
    var slider = $( "#slider" ).slider({
      min: 1,
      max: 24,
      range: "min",
      value: select[ 0 ].selectedIndex + 1,
      slide: function( event, ui ) {
        select[ 0 ].selectedIndex = ui.value - 1;
        selected_hour = select[ 0 ].selectedIndex; // get the selected hour (0-23)
        // console.log(selected_hour);
      }
    });
    $( "#hour" ).on( "change", function() {
      slider.slider( "value", this.selectedIndex + 1 );
    });
});


// Function that maps according to checkbox_values
var map_according_to_checkbox = function(){
  if (checkbox_values[2] === true){
    draw_freq(3, selected_hour);
    console.log("Drawing category 3");
  } if (checkbox_values[1] === true){
    draw_freq(2, selected_hour);
  } if (checkbox_values[0] === true){
    draw_freq(1, selected_hour);
  }
};


// User Inputs: Run Function Only When Data Fully Loaded: $(document).ready(functionToCallWhenReady)
$(document).ready(function() {

  // Make "Previous Button" (the name of the button) Trigger: Clear All Layers and Map Default Layer
  $('button#button-previous').click(function(){
    console.log("Button triggered.");
    location.reload();
  });

  // Make "Next Button" (the name of the button) Trigger: Clear All Layers
  $('button#button-next').click(function(){
    console.log("Button triggered.");
    remove_default_layer();
    clear_all_layers();
    draw_carto_subways();
  });

  // Make "Checkbox Button" Trigger: Change State of the Application
  $('button#button-checkbox').click(function(){
    console.log("Button triggered.");
    _.each(selectors, function(some_array){$(some_array).prop('disabled', false);});
    checkbox_values = _.map(selectors, function(some_array){return $(some_array).is(":checked");}); // get boolean for check-box
    console.log(checkbox_values);
    map_according_to_checkbox();
  });


}); // end of huge ready function, don't delete
