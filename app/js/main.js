require("./L.SvgScaleOverlay");
require("./calendar.js");


// var newdata = require("./2018-shootings.geo.json");
var json1 = require("./disolved1.json");
var json2 = require("./disolved2.json");
var json3 = require("./disolved3.json");

// var geojson = new L.geoJson(newdata);

var months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

function getTheMonth(m) {
    return months[Number(m) - 1]
}

var lmap = L.map('map').setView([
    39.9826, -75.1652
], 12);
// https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}
// http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$000[@60])/{z}/{x}/{y}
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}' + (
    L.Browser.retina
    ? '@2x'
    : '') + '.png', {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'}).addTo(lmap);

lmap.scrollWheelZoom.disable();

var myStyle = {
    "fillColor": "#000000",
    'color': "white",
    "weight": 2,
    "opacity": 0.5,
    'fillOpacity': 0.65
};

L.geoJson(json1, {style: myStyle}).addTo(lmap);
L.geoJson(json2, {style: myStyle}).addTo(lmap);
L.geoJson(json3, {style: myStyle}).addTo(lmap);

$(window).load(function() {

    var slider = document.getElementById("myRange");

    fetch('https://phl.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20shootings%20WHERE%20year%20=%202018').then((resp) => resp.json()).then(function(data) {
        console.log("data loaded");
        var newMapData = data.rows;

        var byDate = newMapData.slice(0).filter(w => w.point_x);
        byDate.sort(function(a, b) {
                return new Date(a.date_) - new Date(b.date_);
        });
        let updated = (byDate.map(function(e) {
            return e.date_
        }).sort().reverse()[0]);

        $(".lastupdated").html(`Last updated: ${getTheMonth(updated.slice(5, 7))} ${Number(updated.slice(8, 10))}, 2018`)

        var circles;

        var svgOverlay = L.SvgScaleOverlay();
        var radius = 3;

        svgOverlay.onInitData = function() {
            if (!circles) {
                var g = d3.select(this._g);
                circles = g.selectAll("circle").data(byDate).enter().append('circle');
                circles.style("fill-opacity", 0.85);
                circles.style("fill", "#f0f921")
            }

            var dcounter = 0;

            slider.min = Date.parse('2018-01-01T00:00:00Z');
            slider.max = Date.parse(updated);

            circles.each(function(d, i) {

                var elem = d3.select(this);
                d.parsedDate = Date.parse(d.date_);

                var mulitplyer = (d.parsedDate - 1514782800000) / 1000000000;
                if (d.point_x) {
                    // setTimeout(function() {

                    $(".datecontainer").html(getTheMonth(d.date_.slice(5, 7)) + " 2018")
                    $(".numCounter").html(i+1)

                    dcounter = dcounter + d.fatal;
                    var point = lmap.project(L.latLng(new L.LatLng(d.point_y, d.point_x)))._subtract(lmap.getPixelOrigin());
                    elem.attr('cx', point.x)
                    elem.attr('cy', point.y)
                    elem.attr('r', radius * 2);
                    elem.transition().duration(500).attr("r", radius);

                    if (d.fatal > 0) {
                        elem.classed('addedDotFatal', true)
                    } else {
                        elem.classed('addedDot', true)
                    }
                    var vatalcount = $(".addedDotFatal");
                    $(".numCounterDeath").html(vatalcount.length)



                    slider.value = Date.parse(d.date_);

                    // }, 1500 * mulitplyer)


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

        slider.oninput = function() {
            var getval = this.value;
            var slidepct = (this.value - slider.min)/(slider.max - slider.min)*100;

            if(slidepct <= 50){
                $(".sliderdate").css("left",(this.value - slider.min)/(slider.max - slider.min)*100 + "%").css('text-align','left')
            } else {
                $(".sliderdate").css("left",(this.value - slider.min)/(slider.max - slider.min)*85 + "%").css('text-align','right')
            }

            var newdate;

            circles.each(function(d,i) {
                d3.select(this).classed('slideback', false)
                d3.select(this).classed('Fatalslider', false)

                if (Date.parse(d.date_) > getval) {
                    d3.select(this).classed('notvisible', true)

                } else {

                    if(!newdate || d.date_ > newdate) {newdate = d.date_}

                    d3.select(this).classed('notvisible', false)
                    d3.select(this).classed('slideback', true)

                    if (d.fatal > 0) {
                        d3.select(this).classed('slideback Fatalslider', true)
                    }


                    if(Math.abs(Date.parse(d.date_) - slider.value) < 60000000){
                        // d3.select(this).classed('selectedslider', true)
                        // d3.select(this).style("fill-opacity", 0.6);
                        d3.select(this).style("stroke", '#f0f921');
                        d3.select(this).attr('r', radius*2);
                        d3.select(this).style("stroke-width", '4');

                    } else {
                        // d3.select(this).classed('selectedslider', false)
                        d3.select(this).attr('r', radius);
                        d3.select(this).style("stroke", '');
                        d3.select(this).style("stroke-width", '');
                    }

                }

            })



            $(".numCounterDeath").html($(".Fatalslider").length)

            var slidecircles = $(".slideback");
            $(".numCounter").html(slidecircles.length)
            $(".datecontainer").html(getTheMonth(newdate.slice(5, 7)) + " 2018")
            $(".sliderdate").html(`${getTheMonth(newdate.slice(5, 7))} ${Number(newdate.slice(8, 10))}` )
        }

    })
});
