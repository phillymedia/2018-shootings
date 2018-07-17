require("./L.SvgScaleOverlay");

var newdata = require("./2018-shootings.geo.json");

var geojson = new L.geoJson(newdata);

var months = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getMonth(m) {
    return months[Number(m) - 1]
}
//  $(document).ready(function(){
//  });
var lmap = L.map('map').setView([
    39.9826, -75.1652
], 12);
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}' + (
    L.Browser.retina
    ? '@2x'
    : '') + '.png', {
    // minZoom: 13,
    // maxZoom: 17,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
}).addTo(lmap);
// map.scrollWheelZoom.disable();

var newMapData = newdata.features;

// lmap.fitBounds(geojson.getBounds());

// var lmap = new  L.map('map').setView([39.9526, -75.1652], 14)
//                        .addLayer(L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png"));

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

    circles.each(function(d, i) {
        var elem = d3.select(this);
        d.properties.parsedDate = Date.parse(d.properties.date_);
        var mulitplyer = (d.properties.parsedDate - 1514782800000) / 1000000000;
        if (d.geometry) {
            setTimeout(function() {

                $(".datecontainer").html(getMonth(d.properties.date_.slice(5, 7)) + d.properties.date_.slice(8, 10) + " 2018")
                $(".numCounter").html(counter ++)

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
