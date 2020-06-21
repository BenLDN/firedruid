// HOURLY LINE GRAPH ===============================================================

Chart.defaults.global.responsive = true;

var hourlyTrendsChartData = {

    labels: [{%for dim in trend_time_dim_hourly %} "{{dim}}", {% endfor %}],

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
                    display: true,
                    labelString: "Word Frequency"
                }
            }]
        }
    }

});

// HOURLY BAR CHART ===============================================================

var hourlyTopChartData = {

    labels: [{% for label in top_labels_hourly %} "{{label}}", {% endfor %}],

    datasets: [{
        backgroundColor: "#dc3545",
        data: [{% for val in top_values_hourly %} {{val}}, {% endfor %}]

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
                    display: true,
                    labelString: "Word Frequency"
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
