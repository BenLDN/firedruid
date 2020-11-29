var all_data = {{all_data}}
var colourlist = {{colourlist}}
var start_dt = "{{default_start_date}}"
var end_dt = "{{default_end_date}}"
var top_n = 5

// (RE)CALCULATING CHART DATA ==================================================

function generate_data(start_dt, end_dt, top_n) {
    var i
    var j
    var k

    // adding hours to dates

    for (i = 0; i < all_data['datetimes'].length; i++) {
        if (all_data['datetimes'][i].slice(0, 10) == start_dt) {
            start_dtm = all_data['datetimes'][i]
            break
        }
    }

    for (i = all_data['datetimes'].length - 1; i >= 0; i--) {
        if (all_data['datetimes'][i].slice(0, 10) == end_dt) {
            end_dtm = all_data['datetimes'][i]
            break
        }
    }

    // get start and end index based on datetimes
    start_index = all_data['datetimes'].indexOf(start_dtm)
    end_index = all_data['datetimes'].indexOf(end_dtm)
    no_of_dtms = end_index - start_index

    // get the appropriate slice of all_data['frequencies'] and all_data['datetimes']
    filtered_freq_lists = all_data['frequencies'].slice(start_index, end_index)
    datetimes = all_data['datetimes'].slice(start_index, end_index)

    // horizontal sum of frequencies
    var sum = (r, a) => r.map((b, i) => a[i] + b)
    total_freqs_over_period = filtered_freq_lists.reduce(sum)

    // determine threshold and create boolean mask for top words
    total_freqs_over_period_sorted = filtered_freq_lists.reduce(sum)
    total_freqs_over_period_sorted = total_freqs_over_period_sorted.sort(function(a, b) {
        return a - b;
    });
    threshold = total_freqs_over_period_sorted[total_freqs_over_period_sorted.length - top_n]

    var mask = []
    for (i = 0; i < total_freqs_over_period.length; i++) {
        if (total_freqs_over_period[i] >= threshold) {
            mask.push(true)
        } else {
            mask.push(false)
        }
    }

    // build array for top words
    top_words = []
    for (i = 0; i < all_data['words'].length; i++) {
        if (mask[i]) {
            top_words.push(all_data['words'][i])
        }
    }

    // build matrix (array of arrays) for frequencies
    top_frequencies = []

    for (i = 0; i < filtered_freq_lists.length; i++) {
        var k = 0
        freq_list = filtered_freq_lists[i]
        for (j = 0; j < freq_list.length; j++) {
            word_freq = freq_list[j]
            if (mask[j]) {
                //console.log(k)
                //console.log(top_frequencies)
                if (i == 0) {
                    top_frequencies.push([word_freq / 100])
                } else {
                    top_frequencies[k].push(word_freq / 100)
                }
                k++
            }
        }
    }

    // total top frequencies over the whole period (for the bar chart)
    top_total_freqs_over_period = []
    for (i = 0; i < total_freqs_over_period.length; i++) {
        if (mask[i]) {
            top_total_freqs_over_period.push(total_freqs_over_period[i] / 100 / no_of_dtms)
        }
    }

    arrayOfObj = top_words.map(function(d, i) {
        return {
            label: d,
            data: top_total_freqs_over_period[i] || 0
        }
    })

    sortedArrayOfObj = arrayOfObj.sort(function(a, b) {
        return b.data > a.data;
    })

    top_words_sorted = [];
    top_total_freqs_over_period_sorted = [];
    sortedArrayOfObj.forEach(function(d) {
        top_words_sorted.push(d.label);
        top_total_freqs_over_period_sorted.push(d.data);
    })


    // create date arrays for the dropdowns (enforcing star < end)

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    all_dates = all_data['datetimes'].map((dtm) => dtm.slice(0, 10)).filter(onlyUnique)

    valid_dt_starts = all_dates.slice(0, all_dates.indexOf(end_dt))
    valid_dt_ends = all_dates.slice(all_dates.indexOf(start_dt) + 1, all_dates.length)

    function removeOptions(selectElement) {
        var i, L = selectElement.options.length - 1;
        for (i = L; i >= 0; i--) {
            selectElement.remove(i);
        }
    }

    function selectElement(id, valueToSelect) {
        let element = document.getElementById(id);
        element.value = valueToSelect;
    }

    start_selector = document.getElementById("choose-start")
    end_selector = document.getElementById("choose-end")
    top_selector = document.getElementById("choose-top-n")

    removeOptions(start_selector)
    removeOptions(end_selector)

    for (var i = 0; i < valid_dt_starts.length; i++) {
        var opt = valid_dt_starts[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        start_selector.appendChild(el);
    }

    for (var i = 0; i < valid_dt_ends.length; i++) {
        var opt = valid_dt_ends[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        end_selector.appendChild(el);
    }

    start_selector.value = start_dt
    end_selector.value = end_dt
    top_selector.value = top_n

}

generate_data(start_dt, end_dt, top_n)

Chart.defaults.global.responsive = true;

// LINE GRAPH ==================================================================

var interactiveLineChartData = {

    labels: datetimes,

    datasets: []
};

for (i = 0; i < top_n; i++) {

    dataset = {
        label: top_words[i],
        fill: false,
        lineTension: 0.3,
        borderColor: colourlist[i],
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colourlist[i],
        pointHoverBorderColor: colourlist[i],
        pointRadius: 0.5,
        pointHitRadius: 15,
        data: top_frequencies[i]
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

// BAR CHART ===================================================================

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

// UPDATING CHARTS AFTER PARAMETERS CHANGE =====================================

function update_everything(start_selected, end_selected, top_seleced) {

    generate_data(start_selected, end_selected, parseInt(top_seleced))
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
