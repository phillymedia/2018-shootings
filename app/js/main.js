require("./L.SvgScaleOverlay");

var newdata = require("./2018-shootings.geo.json");
var json1 = require("./disolved1.json");
var json2 = require("./disolved2.json");
var json3 = require("./disolved3.json");

var geojson = new L.geoJson(newdata);

var months = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getMonth(m) {
    return months[Number(m) - 1]
}

var lmap = L.map('map',{
    maxBounds: geojson.getBounds()
}).setView([
    39.9826, -75.1652
], 12);
// https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}
L.tileLayer('http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$000[@60])/{z}/{x}/{y}' + (
    L.Browser.retina
    ? '@2x'
    : '') + '.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
}).addTo(lmap);

lmap.scrollWheelZoom.disable();

var myStyle = {
    "fillColor": "#000000",
    'color':"white",
    "weight": 2,
    "opacity": 0.5,
    'fillOpacity':0.65
};


L.geoJson(json1, {style:myStyle}).addTo(lmap);
L.geoJson(json2, {style:myStyle}).addTo(lmap);
L.geoJson(json3, {style:myStyle}).addTo(lmap);

var newMapData = newdata.features;

// lmap.fitBounds(geojson.getBounds());

// var lmap = new  L.map('map').setView([39.9526, -75.1652], 14)
// lmap.addLayer(L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$000[@60])/{z}/{x}/{y}.png"));

var circles;

var svgOverlay = L.SvgScaleOverlay();
var radius = 3;

// ------------------------------------------------------------
svgOverlay.onInitData = function() {
    if (!circles) {
        var g = d3.select(this._g);
        circles = g.selectAll("circle").data(newMapData).enter().append('circle');
        // -- opacity based on grouping optimization in point data
        circles.style("fill-opacity", 0.85);
        circles.style("fill", "#f0f921")

    }

    var counter = 0;
    var dcounter = 0;

    circles.each(function(d, i) {
        var elem = d3.select(this);
        d.properties.parsedDate = Date.parse(d.properties.date_);
        var mulitplyer = (d.properties.parsedDate - 1514782800000) / 1000000000;
        if (d.geometry) {
            setTimeout(function() {

                $(".datecontainer").html(getMonth(d.properties.date_.slice(5, 7)) + " 2018")
                $(".numCounter").html(counter ++)
                $(".numCounterDeath").html(dcounter + d.properties.fatal)
                dcounter = dcounter + d.properties.fatal;

                var point = lmap.project(L.latLng(new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0])))._subtract(lmap.getPixelOrigin());
                elem.attr('cx', point.x)
                elem.attr('cy', point.y)
                elem.attr('r', radius * 2);
                elem.transition().duration(500).attr("r", radius);

                if(d.properties.fatal > 0 ) {
                    elem.classed('addedDotFatal', true)
                } else {
                    elem.classed('addedDot', true)
                }

                if (d.properties.dateNum > 0) {
                    elem.style("fill", "#0d0887")
                }
                if (d.properties.dateNum > 20090000) {
                    elem.style("fill", "#42039d")
                }
                if (d.properties.dateNum > 20100000) {
                    elem.style("fill", "#6b00a8")
                }
                if (d.properties.dateNum > 20110000) {
                    elem.style("fill", "#900da3")
                }
                if (d.properties.dateNum > 20120000) {
                    elem.style("fill", "#b12a90")
                }
                if (d.properties.dateNum > 20130000) {
                    elem.style("fill", "#cb4778")
                }
                if (d.properties.dateNum > 20140000) {
                    elem.style("fill", "#e16461")
                }
                if (d.properties.dateNum > 20150000) {
                    elem.style("fill", "#f3834c")
                }
                if (d.properties.dateNum > 20160000) {
                    elem.style("fill", "#fca736")
                }
                if (d.properties.dateNum > 20170000) {
                    elem.style("fill", "#fdce25")
                }
                if (d.properties.dateNum > 20180000) {
                    elem.style("fill", "#f0f921")
                }

            }, 1500 * mulitplyer)
        }

    })
};

svgOverlay.onScaleChange = function(scaleDiff) {
    if (scaleDiff > 0.5) {
        var newRadius = radius * 1 / scaleDiff;

        var currentRadius = d3.select('circle').attr("r");
        if (currentRadius != newRadius) {
            d3.selectAll("circle").attr('r', newRadius);
        }
    }

}

lmap.addLayer(svgOverlay);
/***********************/




fetch('https://phl.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20shootings%20WHERE%20year%20=%202018')
  .then((resp) => resp.json()) // Transform the data into json
  .then(function(data) {
      console.log(data.rows)
    })
