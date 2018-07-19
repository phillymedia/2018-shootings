require("./L.SvgScaleOverlay");

var json1 = require("./disolved1.json");
var json2 = require("./disolved2.json");
var json3 = require("./disolved3.json");

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

var newMapData;
var lmap;
var slider;
var updated;
var byDate;

$(document).ready(function() {

    slider = document.getElementById("myRange");

    lmap = L.map('map').setView([
        39.9826, -75.1652
    ], 12);

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

    fetch('https://phl.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20shootings%20WHERE%20year%20=%202018').then((resp) => resp.json()).then(function(data) {
        console.log("data loaded");
        newMapData = data.rows;

        byDate = newMapData.slice(0);
        byDate.sort(function(a, b) {
            return new Date(a.date_) - new Date(b.date_);
        });
        $(".shootingnum").html(byDate.length);

        animateValue("numValue", 0, byDate.length, 1000);

        updated = (byDate.map(function(e) {
            return e.date_
        }).sort().reverse()[0]);

        $(".lastupdated").html(`Last updated: ${getTheMonth(updated.slice(5, 7))} ${Number(updated.slice(8, 10))}, 2018`)

        $(".dateupdated").html(`${getTheMonth(updated.slice(5, 7))} ${Number(updated.slice(8, 10))}`)
        makeCalendar();
        //

        $(".mapCover").on("click", function() {
            setTimeout(function () {
                makeMap();
            }, 500);
            $(".mapCover").remove();
        })
    })
})
// https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}
// http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$000[@60])/{z}/{x}/{y}

function makeMap() {
    var circles;

    var svgOverlay = L.SvgScaleOverlay();
    var radius = 3;

    var newRadius;

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
            // if (d.point_x) {
            setTimeout(function() {

                $(".datecontainer").html(getTheMonth(d.date_.slice(5, 7)) + " 2018")
                $(".numCounter").html(i + 1)

                dcounter = dcounter + d.fatal;
                if (d.point_x) {
                    var point = lmap.project(L.latLng(new L.LatLng(d.point_y, d.point_x)))._subtract(lmap.getPixelOrigin());
                    elem.attr('cx', point.x)
                    elem.attr('cy', point.y)
                    elem.attr('r', radius * 2);
                    elem.transition().duration(500).attr("r", radius);
                }

                if (d.fatal > 0) {
                    elem.classed('addedDotFatal', true)
                } else {
                    elem.classed('addedDot', true)
                }
                var vatalcount = $(".addedDotFatal");
                $(".numCounterDeath").html(vatalcount.length)

                slider.value = Date.parse(d.date_);

            }, 1500 * mulitplyer)

            // }

        })
    };

    svgOverlay.onScaleChange = function(scaleDiff) {
        if (scaleDiff > 0.5) {
            newRadius = radius * 1 / scaleDiff;
            var currentRadius = d3.select('circle').attr("r");
            if (currentRadius != newRadius) {
                d3.selectAll("circle").attr('r', newRadius);
            }
        }
    }

    lmap.addLayer(svgOverlay);

    slider.oninput = function() {
        var getval = this.value;
        var slidepct = (this.value - slider.min) / (slider.max - slider.min) * 100;

        if (slidepct <= 50) {
            $(".sliderdate").css("left", (this.value - slider.min) / (slider.max - slider.min) * 100 + "%").css('text-align', 'left')
        } else {
            $(".sliderdate").css("left", (this.value - slider.min) / (slider.max - slider.min) * 80 + "%").css('text-align', 'right')
        }

        var newdate;

        circles.each(function(d, i) {
            d3.select(this).classed('slideback', false)
            d3.select(this).classed('Fatalslider', false)

            if (Date.parse(d.date_) > getval) {
                d3.select(this).classed('notvisible', true)

            } else {

                if (!newdate || d.date_ > newdate) {
                    newdate = d.date_
                }

                d3.select(this).classed('notvisible', false)
                d3.select(this).classed('slideback', true)

                if (d.fatal > 0) {
                    d3.select(this).classed('slideback Fatalslider', true)
                }

                if (Math.abs(Date.parse(d.date_) - slider.value) < 60000000) {
                    d3.select(this).style("stroke", '#f0f921');
                    if(newRadius) {
                        d3.select(this).attr('r', newRadius * 2);
                        d3.select(this).style("stroke-width", newRadius);
                    } else {
                        d3.select(this).attr('r', radius * 2);
                        d3.select(this).style("stroke-width", radius);
                    }
                    // d3.select(this).style("stroke-width", '4');

                } else {
                    if(newRadius) {
                        d3.select(this).attr('r', newRadius);
                        d3.select(this).style("stroke-width", newRadius);
                    } else {
                        d3.select(this).attr('r', radius);
                        d3.select(this).style("stroke-width", radius);
                    }
                    d3.select(this).style("stroke", '');
                    d3.select(this).style("stroke-width", '');

                }
            }
        })

        $(".numCounterDeath").html($(".Fatalslider").length)

        var slidecircles = $(".slideback");
        $(".numCounter").html(slidecircles.length)
        $(".datecontainer").html(getTheMonth(newdate.slice(5, 7)) + " 2018")
        $(".sliderdate").html(`${getTheMonth(newdate.slice(5, 7))} ${Number(newdate.slice(8, 10))}`)
    }
}

function makeCalendar() {
    const tippy = require('tippy.js')
    var now = new Date(updated.slice(0, -1));
    console.log(now);
    // var calendar_data = require("./2018-shootings.geo.json");
    var calendar_data = byDate;
    var count_range = [];

    var weekday = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    Date.prototype.toISODate = function() {
        return this.getFullYear() + '-' + (
        '0' + (
        this.getMonth() + 1)).slice(-2) + '-' + (
        '0' + this.getDate()).slice(-2);
    }

    var month_index = -1;
    for (var d = new Date(2018, 0, 1); d <= now; d.setDate(d.getDate() + 1)) {
        var iso = d.toISODate();
        var month_cur;
        if (d.getMonth() !== month_index) {
            $("#calendar").append("<div class='month' id='" + months[d.getMonth()] + "'><div class='title'>" + months[d.getMonth()] + "</div><div class='month-inner'><div class='day' data-longdate='" + d.toDateString() + "' data-day='" + d.getDay() + "' data-date='" + iso + "'><div class='day-inner' data-count='0'></div></div></div></div>")
            month_cur = "#" + months[d.getMonth()];
        }
        if (d.getMonth() == month_index) {
            $(month_cur).find(".month-inner").append("<div class='day' data-longdate='" + d.toDateString() + "' data-day='" + d.getDay() + "' data-date='" + iso + "'><div class='day-inner' data-count='0'></div></div>")
        }
        var month_index = d.getMonth()
    }

    $(".month-inner").each(function() {
        var weekday = $(this).find(".day").first();
        var weedkday_eq = $(weekday).data("day");
        var weekday_w = $(weekday).width();
        $(weekday).css("margin-left", (weedkday_eq * (100 / 7) + "%"));
    })

    // console.log(calendar_data.features.length)

    // $.each(calendar_data.features, function (key, val) {
    //     $.each(val.properties, function(i,j){
    //       console.log("test")
    //          items.push('<li id="' + i + '">' + j + '</li>');
    //     })
    // });

    for (var j = 0; j < calendar_data.length; j++) {
        $(".day").each(function() {
            if ($(this).data("date") == calendar_data[j].date_.split('T')[0]) {
                var count = Number($(this).find(".day-inner").attr("data-count"));
                $(this).find(".day-inner").attr("data-count", (count + 1));
            }

        });
    }

    function normalize(val) {
        return (val - 0) / (Math.max.apply(null, count_range) - 0);
    }

    // $(".day").each(function() {
    //   var count_day = $(this).find(".day-inner").attr("data-count");
    //   count_range.push(Number(count_day));
    // });
    // console.log(Math.max.apply(null, count_range));

    var color_ramp = [
        '#f0f921',
        '#ccd237',
        '#a9ab41',
        '#888845',
        '#666546',
        '#444444'
    ]

    $(".day").each(function() {
        var count_day = $(this).find(".day-inner").attr("data-count");
        count_range.push(Number(count_day));

    });

    $(".day").each(function() {
        var count_day = $(this).find(".day-inner").attr("data-count");

        if (normalize(count_day) >= 0.9) {
            $(this).find(".day-inner").css("background-color", color_ramp[0])
        }

        if (normalize(count_day) < 0.9 && normalize(count_day) >= 0.7) {
            $(this).find(".day-inner").css("background-color", color_ramp[1])
        }

        if (normalize(count_day) < 0.7 && normalize(count_day) >= 0.5) {
            $(this).find(".day-inner").css("background-color", color_ramp[2])
        }

        if (normalize(count_day) < 0.5 && normalize(count_day) >= 0.3) {
            $(this).find(".day-inner").css("background-color", color_ramp[3])
        }

        if (normalize(count_day) < 0.3 && normalize(count_day) > 0) {
            $(this).find(".day-inner").css("background-color", color_ramp[4])
        }

        if (normalize(count_day) == 0) {
            $(this).find(".day-inner").css("background-color", color_ramp[5])
        }

        $(this).attr("title", "<h3>" + $(this).data("longdate") + "</h3><div class='sub'>Number of shootings: " + count_day + "</div>");

    });

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    function sortNumber(a, b) {
        return a - b;
    }

    var unique_count = count_range.filter(onlyUnique);
    unique_count.sort(sortNumber);
    var count_interval = Math.ceil(unique_count.length / 6)
    var count_legend = [];
    for (var i = 0; i < unique_count.length && count_legend.length < 6; i += count_interval)
        count_legend.push(unique_count[i]);
    console.log(count_legend)

    $("#calendar").before("<div id='calendar-legend'><span>Number of shootings per day</span><div id='calendar-legend-inner'></div></div>");
    var i;
    for (i = 0; i < count_legend.length; i++) {
        $("#calendar-legend-inner").prepend("<div class='legend-interval'><span class='color-key' style='background-color:" + color_ramp[i] + "'></span><span class='text-key'>" + (count_legend[count_legend.length - (i + 1)]) + "</span></div>")
    }

    tippy('.day', {
        theme: 'custom',
        animation: 'fade',
        animateFill: false,
        arrow: true
    })
}

function animateValue(id, start, end, duration) {
    var range = end - start;
    var current = start;
    var increment = end > start
        ? 1
        : -1;
    var stepTime = Math.abs(Math.floor(duration / range));
    var obj = document.getElementById(id);
    var timer = setInterval(function() {
        current += increment;
        obj.innerHTML = current;
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
}
