const tippy = require('tippy.js')
var now = new Date();
var calendar_data = require("./2018-shootings.geo.json");
var count_range = [];
var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

Date.prototype.toISODate = function() {
  return this.getFullYear() + '-' +
    ('0' + (this.getMonth() + 1)).slice(-2) + '-' +
    ('0' + this.getDate()).slice(-2);
}

var month_index = -1;
for (var d = new Date(2018, 0, 1); d <= now; d.setDate(d.getDate() + 1)) {
  var iso = d.toISODate();
  var month_cur;
  if (d.getMonth() !== month_index) {
    $("#calendar").append("<div class='month' id='" + month[d.getMonth()] + "'><div class='title'>" + month[d.getMonth()] + "</div><div class='month-inner'></div></div>")
    month_cur = "#" + month[d.getMonth()];
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
//         // items.push('<li id="' + i + '">' + j + '</li>');
//     })
// });

for (var j = 0; j < calendar_data.features.length; j++) {
  $(".day").each(function() {
    if ($(this).data("date") == calendar_data.features[j].properties.date_.split(' ')[0]) {
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

var color_ramp = ['#f0f921', '#d4d93e', '#b7b94e', '#9b9a57', '#7f7d5d', '#616161']

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

  if (normalize(count_day) < 0.3 && normalize(count_day) >= 0.1) {
    $(this).find(".day-inner").css("background-color", color_ramp[4])
  }

  if (normalize(count_day) < 0.1) {
    $(this).find(".day-inner").css("background-color", color_ramp[5])
  }

  $(this).attr("title", "<h3>" + $(this).data("longdate") + "</h3><div class='sub'>Number of shootings: " + count_day + "</div>");

});

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function sortNumber(a,b) {
    return a - b;
}

var unique_count = count_range.filter( onlyUnique );
unique_count.sort(sortNumber);
var count_interval = Math.ceil(unique_count.length/6)
var count_legend = [];
for (var i = 0; i < unique_count.length && count_legend.length < 6; i += count_interval) count_legend.push(unique_count[i]);
console.log(count_legend)


$("#calendar").before("<div id='calendar-legend'><span>Number of shootings per day</span><div id='calendar-legend-inner'></div></div>");
var i;
for (i = 0; i < count_legend.length; i++) {
    $("#calendar-legend-inner").prepend("<div class='legend-interval'><span class='color-key' style='background-color:"+color_ramp[i]+"'></span><span class='text-key'>"+count_legend[i]+"</span></div>")
}


tippy('.day', {
  theme: 'custom',
  animation: 'fade',
  animateFill: false,
  arrow: true
})

// console.log(normalize());
