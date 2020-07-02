Chart.defaults.global.responsive = true;

app_data = {{app_load_data}}

function load_data(key) {
    trend_time_dim_hourly = app_data['hourly']['latest']['trend_data_hourly']['time_dim'];
    trend_words_hourly = app_data['hourly']['latest']['trend_data_hourly']['words'];
    trend_values_hourly = app_data['hourly']['latest']['trend_data_hourly']['value_list'];
    top_labels_hourly = app_data['hourly'][key]['top_words_hourly']['labels'];
    top_values_hourly = app_data['hourly'][key]['top_words_hourly']['values'];
}

load_data('latest')

function change_week(wk) {
    load_data(wk);
    load_hourlyTopChart()

}


// HOURLY BAR CHART ===============================================================

function load_hourlyTopChart() {

    hourlyTopChartData = {

        labels: top_labels_hourly,

        datasets: [{
            backgroundColor: "#dc3545",
            data: top_values_hourly

        }]
    };

    ctx2 = document.getElementById("hourlyTopChart").getContext("2d");

    hourlyTopChart = new Chart(ctx2, {
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

}

load_hourlyTopChart()

// HOURLY LINE GRAPH ===============================================================


function load_hourlyTrendsChart() {

    var hourlyTrendsChartData = {

        labels: trend_time_dim_hourly,

        datasets: [{% for word, values, colour in trend_hourly_zip %}
              {
                label: '{{ word }}',
                fill: false,
                lineTension: 0.3,
                borderColor: "{{colour}}",
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "{{colour}}",
                pointHoverBorderColor: "{{colour}}",
                pointRadius: 1,
                pointHitRadius: 15,
                data: {{values}},
              },
            {% endfor %}

        ]
    };

    var ctx1 = document.getElementById("hourlyTrendsChart").getContext("2d");

    var hourlyTrendsChart = new Chart(ctx1, {
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

}

load_hourlyTrendsChart()

// DAILY LINE GRAPH ================================================================

var dailyTrendsChartData = {

    labels: [{% for dim in trend_time_dim_daily %} "{{dim}}", {% endfor %}],

    datasets: [{% for word, values, colour in trend_daily_zip %}
          {
            label: '{{ word }}',
            fill: false,
            lineTension: 0.3,
            borderColor: "{{colour}}",
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "{{colour}}",
            pointHoverBorderColor: "{{colour}}",
            pointRadius: 1,
            pointHitRadius: 15,
            data: {{values}},

          },
        {% endfor %}

    ]
};

var ctx3 = document.getElementById("dailyTrendsChart").getContext("2d");

var dailyTrendsChart = new Chart(ctx3, {
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

// HOURLY BAR CHART ===============================================================

var dailyTopChartData = {

    labels: [{% for label in top_labels_daily %} "{{label}}", {% endfor %}],

    datasets: [{
        backgroundColor: "#dc3545",
        data: [{% for val in top_values_daily %} {{val}}, {% endfor %}]

    }]
};

var ctx4 = document.getElementById("dailyTopChart").getContext("2d");

var dailyTopChart = new Chart(ctx4, {
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
