
var app_load_data = {{app_load_data}}
var all_data = {{all_data}}
var colourlist = {{colourlist}}
var start_dtm = '2020-06-30 01'
var end_dtm = '2020-07-15 20'
var top_n = 5

function generate_data(start_dtm, end_dtm, top_n) {


  console.log('Updating, logging start_dtm, end_dtm, top_n')
  console.log(start_dtm, end_dtm, top_n)
  // get start and end index based on test datetimes
  start_index = all_data['datetimes'].indexOf(start_dtm)
  end_index = all_data['datetimes'].indexOf(end_dtm)
  no_of_dtms = end_index - start_index

  // get the appropriate slice of all_data['frequencies'], all_data['datetimes'] and all_data['words']
  filtered_freq_lists = all_data['frequencies'].slice(start_index, end_index)
  datetimes = all_data['datetimes'].slice(start_index, end_index)

  // horizontal sum (& div100) frequencies

  var sum = (r, a) => r.map((b, i) => a[i] + b)
  total_freqs_over_period = filtered_freq_lists.reduce(sum)

  // determine threshold and create mask
  total_freqs_over_period_sorted = filtered_freq_lists.reduce(sum)
  total_freqs_over_period_sorted = total_freqs_over_period_sorted.sort(function(a, b) {return a - b;});
  threshold = total_freqs_over_period_sorted[total_freqs_over_period_sorted.length - 10]

  var mask = []
  var i
  for (i = 0; i < total_freqs_over_period.length; i++) {
    if (total_freqs_over_period[i] >= threshold) {
      mask.push(true)
    }
    else {
      mask.push(false)
    }
  }

  // top10 words
  top_words = []
  for (i = 0; i < all_data['words'].length; i++) {
    if (mask[i]) {
      top_words.push(all_data['words'][i])
    }
  }

  // top10 frequency arrays
  top_frequencies = []
  var j
  var k

  for (i = 0; i < filtered_freq_lists.length; i++) {
    var k = 0
    freq_list = filtered_freq_lists[i]
    for (j = 0; j < freq_list.length; j++) {
      word_freq = freq_list[j]
      if (mask[j]) {
        //console.log(k)
        //console.log(top_frequencies)
        if (i == 0) {
          top_frequencies.push([word_freq/100])
        }
        else {
          top_frequencies[k].push(word_freq/100)
        }
      k++
      }
    }
  }
  // total top top_frequencies (for the bar chart)
  top_total_freqs_over_period = []
  for (i = 0; i < total_freqs_over_period.length; i++) {
    if (mask[i]) {
      top_total_freqs_over_period.push(total_freqs_over_period[i]/100/no_of_dtms)
    }
  }

  arrayOfObj = top_words.map(function(d, i) {
    return {
      label: d,
      data: top_total_freqs_over_period[i] || 0
    }
  })

  sortedArrayOfObj = arrayOfObj.sort(function(a, b) {
    return b.data>a.data;
  })

  top_words_sorted = [];
  top_total_freqs_over_period_sorted = [];
  sortedArrayOfObj.forEach(function(d){
    top_words_sorted.push(d.label);
    top_total_freqs_over_period_sorted.push(d.data);
  });
}

generate_data(start_dtm, end_dtm, top_n)

//==

Chart.defaults.global.responsive = true;

// INTERACTIVE LINE GRAPH ===============================================================

var interactiveLineChartData = {

    labels: datetimes, //app_load_data['hourly']['Last 7 Days']['trend_data_hourly']['time_dim'],

    datasets: []
};

for (i = 0; i < top_n; i++) {

    dataset = {
        label: top_words[i], //app_load_data['hourly']['Last 7 Days']['trend_data_hourly']['words'][i],
        fill: false,
        lineTension: 0.3,
        borderColor: colourlist[i],
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colourlist[i],
        pointHoverBorderColor: colourlist[i],
        pointRadius: 0.5,
        pointHitRadius: 15,
        data: top_frequencies[i] //app_load_data['hourly']['Last 7 Days']['trend_data_hourly']['value_list'][i]
    }

    interactiveLineChartData.datasets.push(dataset)
}

var ctx = document.getElementById("interactiveLineChart").getContext("2d");

var interactiveLineChart = new Chart(ctx, {
    type: 'line',
    data: interactiveLineChartData,
    options: {
        maintainAspectRatio: false,

        title: {
            display: true,
            text: 'Word frequency (testing)'
        },

        scales: {

            yAxes: [{
                ticks: {

                    min: 0,
                    callback: function(value) {
                        return value.toFixed(2) + "%"
                    }
                },
                scaleLabel: {
                    display: false,
                }
            }]
        }
    }

});

// INTERACTIVE BAR CHART ===============================================================

var interactiveBarChartData = {

    labels: top_words_sorted, //app_load_data['hourly']['Last 7 Days']['top_words_hourly']['labels'],

    datasets: [{
        backgroundColor: "#dc3545",
        data: top_total_freqs_over_period_sorted //app_load_data['hourly']['Last 7 Days']['top_words_hourly']['values']

    }]
};

var ctx = document.getElementById("interactiveBarChart").getContext("2d");

var interactiveBarChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: interactiveBarChartData,

    options: {
        maintainAspectRatio: false,

        legend: {
            display: false
        },

        title: {
            display: true,
            text: 'Word frequency (testing)'
        },

        tooltips: {
            custom: function(tooltip) {
                if (!tooltip) return;
                // disable displaying the color box;
                tooltip.displayColors = false;
            },

            callbacks: {
                label: function(tooltipItem, data) {
                    return data['datasets'][0]['data'][tooltipItem['index']] + '%';
                }
            }
        },
        scales: {

            xAxes: [{
                ticks: {

                    min: 0,
                    callback: function(value) {
                        return value.toFixed(2) + "%"
                    }
                },
                scaleLabel: {
                    display: false,
                }
            }]
        }
    }

});

// OLD CHARTS FROM HERE ===============================================================

// HOURLY LINE GRAPH ===============================================================

var hourlyTrendsChartData = {

    labels: app_load_data['hourly']['Last 7 Days']['trend_data_hourly']['time_dim'],

    datasets: []
};

for (i = 0; i < 5; i++) {

    dataset = {
        label: app_load_data['hourly']['Last 7 Days']['trend_data_hourly']['words'][i],
        fill: false,
        lineTension: 0.3,
        borderColor: colourlist[i],
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colourlist[i],
        pointHoverBorderColor: colourlist[i],
        pointRadius: 1,
        pointHitRadius: 15,
        data: app_load_data['hourly']['Last 7 Days']['trend_data_hourly']['value_list'][i]
    }

    hourlyTrendsChartData.datasets.push(dataset)
}

var ctx = document.getElementById("hourlyTrendsChart").getContext("2d");

var hourlyTrendsChart = new Chart(ctx, {
    type: 'line',
    data: hourlyTrendsChartData,
    options: {
        maintainAspectRatio: false,

        title: {
            display: true,
            text: 'Word frequency in the last 7 days (top 5 words, hourly)'
        },

        scales: {

            yAxes: [{
                ticks: {

                    min: 0,
                    callback: function(value) {
                        return value.toFixed(2) + "%"
                    }
                },
                scaleLabel: {
                    display: false,
                }
            }]
        }
    }

});

// HOURLY BAR CHART ===============================================================

var hourlyTopChartData = {

    labels: app_load_data['hourly']['Last 7 Days']['top_words_hourly']['labels'],

    datasets: [{
        backgroundColor: "#dc3545",
        data: app_load_data['hourly']['Last 7 Days']['top_words_hourly']['values']

    }]
};

var ctx = document.getElementById("hourlyTopChart").getContext("2d");

var hourlyTopChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: hourlyTopChartData,

    options: {
        maintainAspectRatio: false,

        legend: {
            display: false
        },

        title: {
            display: true,
            text: 'Word frequency in the last 7 days (top 20 words, total)'
        },

        tooltips: {
            custom: function(tooltip) {
                if (!tooltip) return;
                // disable displaying the color box;
                tooltip.displayColors = false;
            },

            callbacks: {
                label: function(tooltipItem, data) {
                    return data['datasets'][0]['data'][tooltipItem['index']] + '%';
                }
            }
        },
        scales: {

            xAxes: [{
                ticks: {

                    min: 0,
                    callback: function(value) {
                        return value.toFixed(2) + "%"
                    }
                },
                scaleLabel: {
                    display: false,
                }
            }]
        }
    }

});

// DAILY LINE GRAPH ================================================================

var dailyTrendsChartData = {

    labels: app_load_data['daily']['latest']['trend_data_daily']['time_dim'],

    datasets: []

};

for (i = 0; i < 5; i++) {

    dataset = {
        label: app_load_data['daily']['latest']['trend_data_daily']['words'][i],
        fill: false,
        lineTension: 0.3,
        borderColor: colourlist[i],
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colourlist[i],
        pointHoverBorderColor: colourlist[i],
        pointRadius: 1,
        pointHitRadius: 15,
        data: app_load_data['daily']['latest']['trend_data_daily']['value_list'][i]
    }

    dailyTrendsChartData.datasets.push(dataset)
}

var ctx = document.getElementById("dailyTrendsChart").getContext("2d");

var dailyTrendsChart = new Chart(ctx, {
    type: 'line',
    data: dailyTrendsChartData,
    options: {
        maintainAspectRatio: false,

        title: {
            display: true,
            text: 'Word frequency in the last 30 days (top 5 words, hourly)'
        },

        scales: {

            yAxes: [{
                ticks: {

                    min: 0,
                    callback: function(value) {
                        return value.toFixed(2) + "%"
                    }
                },
                scaleLabel: {
                    display: false,
                }
            }]
        }
    }

});

// DAILY BAR CHART ===============================================================


var dailyTopChartData = {

    labels: app_load_data['daily']['latest']['top_words_daily']['labels'],

    datasets: [{
        backgroundColor: "#dc3545",
        data: app_load_data['daily']['latest']['top_words_daily']['values']

    }]
};

var ctx = document.getElementById("dailyTopChart").getContext("2d");

var dailyTopChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: dailyTopChartData,

    options: {
        maintainAspectRatio: false,

        legend: {
            display: false
        },

        title: {
            display: true,
            text: 'Word frequency in the last 30 days (top 20 words, total)'
        },

        tooltips: {
            custom: function(tooltip) {
                if (!tooltip) return;
                // disable displaying the color box;
                tooltip.displayColors = false;
            },

            callbacks: {
                label: function(tooltipItem, data) {
                    return data['datasets'][0]['data'][tooltipItem['index']] + '%';
                }
            }
        },
        scales: {

            xAxes: [{
                ticks: {

                    min: 0,
                    callback: function(value) {
                        return value.toFixed(2) + "%"
                    }
                },
                scaleLabel: {
                    display: false,
                }
            }]
        }
    }

});


function change_week(wk) {

    hourlyTopChart.data.labels = app_load_data['hourly'][wk]['top_words_hourly']['labels']
    hourlyTopChart.data.datasets[0].data = app_load_data['hourly'][wk]['top_words_hourly']['values']
    hourlyTopChart.update()

    hourlyTrendsChart.data.labels = app_load_data['hourly'][wk]['trend_data_hourly']['time_dim']
    hourlyTrendsChartData.datasets = []
    for (i = 0; i < 5; i++) {
        dataset = {
            label: app_load_data['hourly'][wk]['trend_data_hourly']['words'][i],
            fill: false,
            lineTension: 0.3,
            borderColor: colourlist[i],
            pointHoverRadius: 5,
            pointHoverBackgroundColor: colourlist[i],
            pointHoverBorderColor: colourlist[i],
            pointRadius: 1,
            pointHitRadius: 15,
            data: app_load_data['hourly'][wk]['trend_data_hourly']['value_list'][i]
        }
        hourlyTrendsChartData.datasets.push(dataset)
    }
    hourlyTrendsChart.update()
}


// CHANGE PARAMETERS

function update_everything(start_selected, end_selected, top_seleced) {
  start_with_hour = start_selected.concat(" 01")
  end_with_hour = end_selected.concat(" 23")
  generate_data(start_with_hour, end_with_hour, parseInt(top_seleced))
  //
  interactiveBarChart.data.labels = top_words_sorted
  interactiveBarChart.data.datasets[0].data = top_total_freqs_over_period_sorted
  interactiveBarChart.update()

  interactiveLineChart.data.labels = datetimes
  interactiveLineChartData.datasets = []
  for (i = 0; i < top_seleced; i++) {
      dataset = {
          label: top_words[i],
          fill: false,
          lineTension: 0.3,
          borderColor: colourlist[i],
          pointHoverRadius: 5,
          pointHoverBackgroundColor: colourlist[i],
          pointHoverBorderColor: colourlist[i],
          pointRadius: 1,
          pointHitRadius: 15,
          data: top_frequencies[i]
      }
      interactiveLineChartData.datasets.push(dataset)
  }
  interactiveLineChart.update()
  //
}
