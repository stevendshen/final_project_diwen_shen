/* =====================
  Set up initial map
===================== */

var map = L.map('map', {
  center: [39.952380, -75.163635],
  zoom: 12
});

var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(map);


/* =====================
  State of the Application - Page numbers and buttons
===================== */

var state = {
  "slideNumber": 1, // slideNumber keeps track of what slide you are on. It should increase when you
                    // click the next button and decrease when you click the previous button. It
                    // should never get so large that it is bigger than the dataset. It should never
                    // get so small that it is smaller than 0.
  "slideData": [
    {
      "name": "Leaflet",
      "language": "Javascript",
      "namespace": "L"
    },
    {
      "name": "Underscore",
      "language": "Javascript",
      "namespace": "_"
    },
    {
      "name": "jQuery",
      "language": "Javascript",
      "namespace": "$"
    }
  ]
};

var clickNextButton = function() {
  if (state.slideNumber<5){
    state.slideNumber += 1;
    console.log("Current Page: " + state.slideNumber);
  } else {
    console.log("You have reached the last page.");
  }
  $("#page-message").text("Current Page: " + state.slideNumber);
};

var clickPreviousButton = function() {
  if (state.slideNumber>1){
    state.slideNumber -= 1;
    console.log("Current Page: " + state.slideNumber);
  } else {
    console.log("You have reached the first page.");
  }
  $("#page-message").text("Current Page: " + state.slideNumber);
};

var saySlideName = function(slide) {
  // saySlideName uses console.log to "say" the name of the slide it is given. It should run when
  // someone clicks on one of the buttons.
  console.log("Current Page: " + state.slideData);
};


// Control button display
var show_both_buttons = function(){
    $('button').show();
};
var show_previous_button = function(){
  $('#button-previous').show();
  $('#button-next').hide();
};
var show_next_button = function(){
    $('#button-previous').hide();
    $('#button-next').show();
};
show_next_button(); // Initialize on first page


// Control checkbox display
var show_checkbox_block = function(){
    $('div#checkbox-block').show();
};
var hide_checkbox_block = function(){
    $('div#checkbox-block').hide();
};
hide_checkbox_block(); // Initialize on first page


// Text Controls
// Page number message Initialize
$("#page-message").text("Current Page: 1");

// Initialize text
$("#main-heading").text("Exploring the Usefulness of SEPTA Bus (Trolley) Lines in University City"); // main heading
$("#title").text("Introduction"); // title of the slide
$(".main-text-1").text("University City is served by over 19 SEPTA bus and surface trolley lines, as shown on this map. However, don't be fooled. Only a handful of bus lines arrive every 15 minutes or so, while others arrive every 30 minutes or longer, and will not be useful to time-sensitive travelers who want to travel immediately."); // main text 1
$("#instructions").text("You can hover over a line and see what it is. For more detailed information, click on the line.");



/* =====================
  Import Datasets & Initialize Map
===================== */

// Data Link

var route_data_link = "https://raw.githubusercontent.com/stevendshen/Datasets---Diwen-Shen/master/SEPTARoutesSpring2016.geojson";
//var stop_data_link = "https://raw.githubusercontent.com/stevendshen/Datasets---Diwen-Shen/master/SEPTAStopsByLineSpring2016.geojson";


// Global Variables

var parsedData;
var featureGroup_1;
var featureGroup_2A;
var featureGroup_2B;
var featureGroup_3A;
var featureGroup_3B;
var featureGroup_3C;
var featureGroup_4A;
var featureGroup_4B;
var featureGroup_4C;
var checkbox_values = [false, false, false];

// Checkbox Selectors
var selectors = ["#cbox-input1", "#cbox-input2", "#cbox-input3"]; // Get Input Values
var labels = ["#checkbox-label1", "#checkbox-label2", "#checkbox-label3"];


// Read data into parsedData, load initial map

$(document).ready(function() {
  $.ajax(route_data_link).done(function(data) {
    parsedData = JSON.parse(data); // Cleaned Data Saved Here

    featureGroup_1 = L.geoJson(parsedData, {
      style: style_default,
      filter: filter_default
    }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_default);

  });
});


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


// Filter data to keep the file size down
var filter_default = function(feature) {
  if (feature.properties.LINEABBR === "21" | feature.properties.LINEABBR === "30" |
  feature.properties.LINEABBR === "40" | feature.properties.LINEABBR === "LUCYGR" |
  feature.properties.LINEABBR === "42" | feature.properties.LINEABBR === "LUCYGO" |
  feature.properties.LINEABBR === "34" | feature.properties.LINEABBR === "36" |
  feature.properties.LINEABBR === "13" | feature.properties.LINEABBR === "10" |
  feature.properties.LINEABBR === "11" | feature.properties.LINEABBR === "31" |
  feature.properties.LINEABBR === "64" | feature.properties.LINEABBR === "38" |
  feature.properties.LINEABBR === "43" | feature.properties.LINEABBR === "52" |
  feature.properties.LINEABBR === "9" | feature.properties.LINEABBR === "12" |
  feature.properties.LINEABBR === "44"){
    return true;
  } else {return false;}
};

/* =====================
  Functions
===================== */


// Filter by mode
var filter_Trolley = function(feature) {
  if (mode_data[feature.properties.LINEABBR] == "Trolley"){return true;
  } else {return false;
  }
};

var filter_Bus = function(feature) {
  if (mode_data[feature.properties.LINEABBR] == "Bus"){return true;
  } else {return false;
  }
};

// Filter by frequency
var filter_15 = function(feature) {
  if (frequency_data[feature.properties.LINEABBR] <= 15){return true;
  } else {return false;
  }
};

var filter_30 = function(feature) {
  if (frequency_data[feature.properties.LINEABBR] > 15 & frequency_data[feature.properties.LINEABBR] <= 30){return true;
  } else {return false;
  }
};

var filter_60 = function(feature) {
  if (frequency_data[feature.properties.LINEABBR] > 30){return true;
  } else {return false;
  }
};

// Filter by line
var filter_l21 = function(feature) {
  if (feature.properties.LINEABBR == "21"){return true;
  } else {return false;
  }
};

var filter_l30 = function(feature) {
  if (feature.properties.LINEABBR == "30"){return true;
  } else {return false;
  }
};


var filter_lLUCYGR = function(feature) {
  if (feature.properties.LINEABBR == "LUCYGR"){return true;
  } else {return false;
  }
};

// When clicking a line, display line number
var popup_line_info_when_clicked = function(layer) {
  layer.on('click', function (event) {
    layer.bindPopup("<dt>Line: "+layer.feature.properties.LINEABBR + "</dt><dt>Frequency: " + frequency_data[layer.feature.properties.LINEABBR] + " min</dt><dt>" + layer.feature.properties.tpField05 + " - " + layer.feature.properties.tpField06 + "</dt>"); // pop-up
    console.log("Click Successfully Registered");
    console.log(layer.feature.properties.LINEABBR);
  });
};


// Set styles: Default
var style_default = function(feature) {
  return {color: 'green', opacity: 1.0, weight: 3};
};

// Set styles: Color by Mode (using case function)
var style_by_mode = function(feature) {
  //console.log("Line: " + feature.properties.LINEABBR + mode_data[feature.properties.LINEABBR]);
  switch(mode_data[feature.properties.LINEABBR]){
    case "Bus": return {color: 'blue', opacity: 1.0, weight: 3};
    case "Trolley": return {color: 'green', opacity: 1.0, weight: 5};
  }
};

// Set styles: Color by Frequency (using case function)
var style_by_frequency = function(feature) {
  //console.log("Line: " + feature.properties.LINEABBR);
  if(frequency_data[feature.properties.LINEABBR] > 30){
    return {color: 'green', opacity: 1.0, weight: 3};
  } else if(frequency_data[feature.properties.LINEABBR] > 15) {
    return {color: 'blue', opacity: 1.0, weight: 3};
  } else if(frequency_data[feature.properties.LINEABBR] <= 15){
    return {color: 'red', opacity: 1.0, weight: 5};
  }
};


// Set Mouseover Effect
var highlight_when_mouseover = function(layer) {
  layer.on('mouseover', function (event) {
    //console.log("Mouseover Registered - Mouseover");
    layer.setStyle({
        weight: 5,
        color: "yellow"
    });
    layer.bringToFront();
    layer.bindPopup("Line: "+layer.feature.properties.LINEABBR).openPopup(); // pop-up
  });
};


// Set Mouseout Effect to default
var highlight_when_mouseout_default = function(layer) {
  layer.on('mouseout', function (event) {
    //console.log("Mouseout Registered - Default");
    layer.setStyle(style_default(layer.feature));
    layer.invoke('closePopup'); // It is known bug that .closePopup() does not work. Use this instead.
  });
};

// Set Mouseout Effect to by mode
var highlight_when_mouseout_by_mode = function(layer) {
  layer.on('mouseout', function (event) {
    //console.log("Mouseout Registered - by Mode");
    layer.setStyle(style_by_mode(layer.feature));
    layer.invoke('closePopup');
  });
};

// Set Mouseout Effect to by frequency
var highlight_when_mouseout_by_frequency = function(layer) {
  layer.on('mouseout', function (event) {
    //console.log("Mouseout Registered - by Frequency");
    layer.setStyle(style_by_frequency(layer.feature));
    layer.invoke('closePopup');
  });
};

// Map Zoom Levels:
// Whole City
var map_zoom_whole_city = function() {
  map.setView([39.952380, -75.163635], 12);
};
// University City
var map_zoom_UC = function() {
  map.setView([39.953411, -75.194447], 14);
};


// Create an array to store (mid-day around 12pm) frequency information, to be called
var frequency_data = {"21": 10, "30": 45, "40": 16, "42": 10, "LUCYGR": 30, "LUCYGO": 30, "34": 10,
  "36": 10, "13": 10, "10": 10, "11": 10, "31": 25, "64": 20, "38": 20, "43": 20, "52": 8, "9": 18, "44": 20, "12": 20};

var mode_data = {"21": "Bus", "30": "Bus", "40": "Bus", "42": "Bus", "LUCYGR": "Bus", "LUCYGO": "Bus", "34": "Trolley",
  "36": "Trolley", "13": "Trolley", "10": "Trolley", "11": "Trolley", "31": "Bus", "64": "Bus", "38": "Bus", "43": "Bus",
  "52": "Bus", "9": "Bus", "44": "Bus", "12": "Bus"};


// User Inputs: Run Function Only When Data Fully Loaded: $(document).ready(functionToCallWhenReady)
$(document).ready(function() {


  // Button Labels
  $("#button-next").text("Next Page");
  $("#button-previous").text("Previous Page");


  // Make "Next Button" Trigger: Change State of the Application
  $('body > div.sidebar > button#button-next').click(function(){
    clickNextButton();
    console.log("Button triggered.");
    update_page_content();
  });

  // Make "Previous Button" Trigger: Change State of the Application
  $('body > div.sidebar > button#button-previous').click(function(){
    clickPreviousButton();
    console.log("Button triggered.");
    update_page_content();
  });

  // Default checkboxes are all unchecked, and buttons are disabled
  $("#cbox-input1").prop("checked",false);
  $("#cbox-input2").prop("checked",false);
  $("#cbox-input3").prop("checked",false);
  _.each(selectors, function(some_array){$(some_array).prop('disabled', true);}); // Disable All Checkboxes as default
  $('button#button-checkbox').prop('disabled', true); // disable button

  // Make "Checkbox Button" Trigger: Change State of the Application
  $('button#button-checkbox').click(function(){
    console.log("Button triggered.");
    _.each(selectors, function(some_array){$(some_array).prop('disabled', false);});
    checkbox_values = _.map(selectors, function(some_array){return $(some_array).is(":checked");}); // get boolean for check-box
    console.log(checkbox_values);
    update_page_content();
  });

}); // end of huge ready function, don't delete


// Clear all layers
var clear_all_layers = function(){
  if(featureGroup_1 !== undefined){featureGroup_1.clearLayers();}
  if(featureGroup_2A !== undefined){featureGroup_2A.clearLayers();}
  if(featureGroup_2B !== undefined){featureGroup_2B.clearLayers();}
  if(featureGroup_3A !== undefined){featureGroup_3A.clearLayers();}
  if(featureGroup_3B !== undefined){featureGroup_3B.clearLayers();}
  if(featureGroup_3C !== undefined){featureGroup_3C.clearLayers();}
  if(featureGroup_4A !== undefined){featureGroup_4A.clearLayers();}
  if(featureGroup_4B !== undefined){featureGroup_4B.clearLayers();}
  if(featureGroup_4C !== undefined){featureGroup_4C.clearLayers();}
};


/* =====================
  MASTER FUNCTION:
  Update Content of Each Page Based on Page Number
===================== */

// When page change is triggered, update the content of the page
var update_page_content = function(){

  // Page 1:
  if (state.slideNumber==1){
    map_zoom_whole_city(); // set zoom
    show_next_button(); // set buttons
    clear_all_layers(); // clear unwanted layers, only if they are defined
    hide_checkbox_block(); // hide checkbox block

    featureGroup_1 = L.geoJson(parsedData, { // load featureGroup_1
      style: style_default,
      filter: filter_default
    }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_default);

    $("#title").text("Introduction");
    $(".main-text-1").text("University City is served by over 19 SEPTA bus and surface trolley lines, as shown on this map. However, don't be fooled. Only a handful of bus lines arrive every 15 minutes or so, while others arrive every 30 minutes or longer, and will not be useful to time-sensitive travelers who want to travel immediately."); // main text 1
    $("#instructions").text("You can hover over a bus line and see what line it is. For more detailed information, click on the bus line.");
  }

  // Page 2:
  else if (state.slideNumber==2){
    map_zoom_UC();
    show_both_buttons();
    clear_all_layers();
    hide_checkbox_block();

    featureGroup_2A = L.geoJson(parsedData, {
      style: style_by_mode,
      filter: filter_Bus
    }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_by_mode);

    featureGroup_2B = L.geoJson(parsedData, {
      style: style_by_mode,
      filter: filter_Trolley
    }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_by_mode);

    $("#title").text("Typical Transit Map");
    $(".main-text-1").text("Here is a typical transit map, where different lines are colored by mode - bus is blue, and trolley is green. The problem is that these maps don't tell you which lines are frequent -- where you can show up anytime and expect a vehicle -- versus which lines are infrequent and cannot be used unless the trip is planned well-ahead."); // main text 1
    $("#instructions").text("You can hover over a line and see what it is. For more detailed information, click on the line.");
  }

  // Page 3:
  else if (state.slideNumber==3){
    map_zoom_UC();
    show_both_buttons();
    clear_all_layers();
    show_checkbox_block();

    featureGroup_3A = L.geoJson(parsedData, {
      style: style_by_frequency,
      filter: filter_60
    }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_by_frequency);

    featureGroup_3B = L.geoJson(parsedData, {
      style: style_by_frequency,
      filter: filter_30
    }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_by_frequency);

    featureGroup_3C = L.geoJson(parsedData, {
      style: style_by_frequency,
      filter: filter_15
    }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_by_frequency);

    $("#title").text("The Frequency Map");
    $(".main-text-1").text("To understand the actual usefulness of our bus system, I recoded the map to reflect typical mid-day frequencies. The frequent-network consists of lines that arrive every 15 min can serve as 'conveyor belts' that are available whenever you wish to travel. Other lines are less useful."); // main text 1
    $("#instructions").text("You can hover over a line and see what it is. For more detailed information, click on the line.");

  }

  // Page 4:
  else if (state.slideNumber==4){
    map_zoom_UC();
    show_both_buttons();
    clear_all_layers();
    show_checkbox_block();

    featureGroup_4A = L.geoJson(parsedData, {
      style: style_by_frequency,
      filter: filter_l21
    }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_by_frequency);

    featureGroup_4B = L.geoJson(parsedData, {
      style: style_by_frequency,
      filter: filter_l30
    }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_by_frequency);

    featureGroup_4C = L.geoJson(parsedData, {
      style: style_by_frequency,
      filter: filter_lLUCYGR
    }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_by_frequency);

    var popup_1 = L.popup().setLatLng([39.962523, -75.213115]).setContent("Line 30 comes every 45 min. For most, wait time is longer than walk time from other frequent route.").addTo(map);
    var popup_2 = L.popup().setLatLng([39.956305, -75.194147]).setContent("LUCY Green comes every 30 min, useful only when travel time coincides with schedule.").addTo(map);
    var popup_3 = L.popup().setLatLng([39.949496, -75.164750]).setContent("Line 21 comes every 10 min, useful for any spontaneous, time-sensitive traveler (which is everyone), without needing to consult a schedule or worry about missing a bus.").addTo(map);

    $("#title").text("The Frequency Map: Case Study");
    $(".main-text-1").text("To understand the actual usefulness of our bus system, I recoded the map to reflect typical mid-day frequencies. The frequent-network consists of lines that arrive every 15 min can serve as 'conveyor belts' that are available whenever you wish to travel. Other lines are less useful."); // main text 1
    $("#instructions").text("");

  }

  // Page 5:
  else if (state.slideNumber==5){
    map_zoom_UC();
    show_previous_button();
    clear_all_layers();
    show_checkbox_block();

    map.closePopup(); // close popup

    // Enable checkboxes and buttons
    _.each(selectors, function(some_array){$(some_array).prop('disabled', false);}); // enable checkboxes
    $('button#button-checkbox').prop('disabled', false); // enable button

    var checkbox_60 = function() {
      featureGroup_3A = L.geoJson(parsedData, {
        style: style_by_frequency,
        filter: filter_60
      }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_by_frequency);
    };

    var checkbox_30 = function() {
      featureGroup_3B = L.geoJson(parsedData, {
        style: style_by_frequency,
        filter: filter_30
      }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_by_frequency);
    };

    var checkbox_15 = function() {
      featureGroup_3C = L.geoJson(parsedData, {
        style: style_by_frequency,
        filter: filter_15
      }).addTo(map).eachLayer(popup_line_info_when_clicked).eachLayer(highlight_when_mouseover).eachLayer(highlight_when_mouseout_by_frequency);
    };

    if(checkbox_values[0]===true){checkbox_15();}
    if(checkbox_values[1]===true){checkbox_30();}
    if(checkbox_values[2]===true){checkbox_60();}

    $("#title").text("The Frequency Map");
    $(".main-text-1").text("This frequent transit map helps to reveal what level of transit mobility is possible for spontaneous, time-sensitive travelers. It is clear that the area covered by the frequent (useful) network is much smaller than the entire transit network, showing that simply measuring route coverage is not sufficient for evaluating the quality of a transit system, offering opportunity for improvement."); // main text 1
    $("#instructions").text("Use the checkbox to explorer the different layers in the transit system.");
    $("#page-message").text("Current Page: 5 - This is the last page.");

  }

}; // end of huge ready function, don't delete



/* =====================
  Archived Code
===================== */

// Get coordinates of click event
//map.on('click', function(event) {
    // alert("Lat, Lon : " + event.latlng.lat + ", " + event.latlng.lng);
    //L.circleMarker(event.latlng).addTo(map).bindPopup("some text").openPopup();
//});


// Set styles of lines (without using switch function)
//var myStyle = function(feature) {
//  console.log(feature);
//  if(feature.properties.LINEABBR === "21"){return {color: 'red', opacity: 1.0};
//} else if(feature.properties.LINEABBR === "LUCYGR"){return {color: 'blue', opacity: 1.0};
//  } else {return {color: 'green'};
//  }
//};
