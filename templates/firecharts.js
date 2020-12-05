var all_data = {{all_data}}
var colourlist = {{colourlist}}
var top_start_dt = "{{default_start_date}}"
var custom_start_dt = "{{default_start_date}}"
var top_end_dt = "{{default_end_date}}"
var custom_end_dt = "{{default_end_date}}"
var top_n = 5

// (RE)CALCULATING TOP CHART DATA ==============================================

function generate_top_data(top_start_dt, top_end_dt, top_n) {
    var i
    var j
    var k

    // adding hours to dates

    for (i = 0; i < all_data['datetimes'].length; i++) {
        if (all_data['datetimes'][i].slice(0, 10) == top_start_dt) {
            top_start_dtm = all_data['datetimes'][i]
            break
        }
    }

    for (i = all_data['datetimes'].length - 1; i >= 0; i--) {
        if (all_data['datetimes'][i].slice(0, 10) == top_end_dt) {
            top_end_dtm = all_data['datetimes'][i]
            break
        }
    }

    // get start and end index based on datetimes
    top_start_index = all_data['datetimes'].indexOf(top_start_dtm)
    top_end_index = all_data['datetimes'].indexOf(top_end_dtm)
    top_no_of_dtms = top_end_index - top_start_index

    // get the appropriate slice of all_data['frequencies'] and all_data['datetimes']
    filtered_freq_lists = all_data['frequencies'].slice(top_start_index, top_end_index)
    top_datetimes = all_data['datetimes'].slice(top_start_index, top_end_index)

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
            top_total_freqs_over_period.push(total_freqs_over_period[i] / 100 / top_no_of_dtms)
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

    top_all_dates = all_data['datetimes'].map((dtm) => dtm.slice(0, 10)).filter(onlyUnique)

    top_valid_dt_starts = top_all_dates.slice(0, top_all_dates.indexOf(top_end_dt))
    top_valid_dt_ends = top_all_dates.slice(top_all_dates.indexOf(top_start_dt) + 1, top_all_dates.length)

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

    top_start_selector = document.getElementById("choose-top-start")
    top_end_selector = document.getElementById("choose-top-end")
    top_n_selector = document.getElementById("choose-top-n")

    removeOptions(top_start_selector)
    removeOptions(top_end_selector)

    for (var i = 0; i < top_valid_dt_starts.length; i++) {
        var opt = top_valid_dt_starts[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        top_start_selector.appendChild(el);
    }

    for (var i = 0; i < top_valid_dt_ends.length; i++) {
        var opt = top_valid_dt_ends[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        top_end_selector.appendChild(el);
    }

    top_start_selector.value = top_start_dt
    top_end_selector.value = top_end_dt
    top_n_selector.value = top_n

}

generate_top_data(top_start_dt, top_end_dt, top_n)

// (RE)CALCULATING CUSTOM CHART DATA ===========================================

function generate_custom_data(custom_start_dt, custom_end_dt, word1, word2, word3) {
    var i
    var j
    var k

    // adding hours to dates

    for (i = 0; i < all_data['datetimes'].length; i++) {
        if (all_data['datetimes'][i].slice(0, 10) == custom_start_dt) {
            custom_start_dtm = all_data['datetimes'][i]
            break
        }
    }

    for (i = all_data['datetimes'].length - 1; i >= 0; i--) {
        if (all_data['datetimes'][i].slice(0, 10) == custom_end_dt) {
            custom_end_dtm = all_data['datetimes'][i]
            break
        }
    }

    // get start and end index based on datetimes
    custom_start_index = all_data['datetimes'].indexOf(custom_start_dtm)
    custom_end_index = all_data['datetimes'].indexOf(custom_end_dtm)
    custom_no_of_dtms = custom_end_index - custom_start_index

    // get the appropriate slice of all_data['frequencies'] and all_data['datetimes']
    custom_filtered_freq_lists = all_data['frequencies'].slice(custom_start_index, custom_end_index)
    custom_datetimes = all_data['datetimes'].slice(custom_start_index, custom_end_index)

    // get the indicies of selected words
    custom_word_indices = []
    custom_words = []
    for (const element of [word1, word2, word3]) {
      if (element != "(select word)") {
        custom_words.push(element)
        custom_word_indices.push(all_data['words'].indexOf(element))
      }
    }

    custom_frequencies = []

    for (i = 0; i < custom_filtered_freq_lists.length; i++) {
        var k = 0
        freq_list = custom_filtered_freq_lists[i]
        for (j = 0; j < freq_list.length; j++) {
            word_freq = freq_list[j]
            if (custom_word_indices.includes(j)) {
                if (i == 0) {
                    custom_frequencies.push([word_freq / 100])
                } else {
                    custom_frequencies[k].push(word_freq / 100)
                }
                k++
            }
        }
    }

    custom_words.sort()

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    custom_all_dates = all_data['datetimes'].map((dtm) => dtm.slice(0, 10)).filter(onlyUnique)

    custom_valid_dt_starts = custom_all_dates.slice(0, custom_all_dates.indexOf(custom_end_dt))
    custom_valid_dt_ends = custom_all_dates.slice(custom_all_dates.indexOf(custom_start_dt) + 1, custom_all_dates.length)

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

    custom_start_selector = document.getElementById("choose-custom-start")
    custom_end_selector = document.getElementById("choose-custom-end")

    removeOptions(custom_start_selector)
    removeOptions(custom_end_selector)

    for (var i = 0; i < custom_valid_dt_starts.length; i++) {
        var opt = custom_valid_dt_starts[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        custom_start_selector.appendChild(el);
    }

    for (var i = 0; i < custom_valid_dt_ends.length; i++) {
        var opt = custom_valid_dt_ends[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        custom_end_selector.appendChild(el);
    }

    custom_start_selector.value = custom_start_dt
    custom_end_selector.value = custom_end_dt
}

// Load word list and add elements to word dropdowns

function load_word_dopdown() {

  word_selector1 = document.getElementById("choose-word1")
  word_selector2 = document.getElementById("choose-word2")
  word_selector3 = document.getElementById("choose-word3")

  for (var i = 0; i < all_data['words'].length; i++) {
      var opt = all_data['words'][i];
      var el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      word_selector1.appendChild(el);
  }

  for (var i = 0; i < all_data['words'].length; i++) {
      var opt = all_data['words'][i];
      var el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      word_selector2.appendChild(el);
  }

  for (var i = 0; i < all_data['words'].length; i++) {
      var opt = all_data['words'][i];
      var el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      word_selector3.appendChild(el);
  }

  word_selector1.value = "(select word)"
  word_selector2.value = "(select word)"
  word_selector3.value = "(select word)"

}

load_word_dopdown()
generate_custom_data(custom_start_dt, custom_end_dt, "(select word)", "(select word)", "(select word)")

// TOP LINE GRAPH ==============================================================

Chart.defaults.global.responsive = true;

var topLineChartData = {

    labels: top_datetimes,
    datasets: []
};

for (i = 0; i < top_n; i++) {

    topDataset = {
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

    topLineChartData.datasets.push(topDataset)
}

var ctx = document.getElementById("topLineChart").getContext("2d");

var topLineChart = new Chart(ctx, {
    type: 'line',
    data: topLineChartData,
    options: {
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Word frequency over time'
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

// TOP BAR CHART ===============================================================

var topBarChartData = {

    labels: top_words_sorted,

    datasets: [{
        backgroundColor: "#dc3545",
        data: top_total_freqs_over_period_sorted

    }]
};

var ctx = document.getElementById("topBarChart").getContext("2d");

var topBarChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: topBarChartData,

    options: {
        maintainAspectRatio: false,

        legend: {
            display: false
        },
        title: {
            display: true,
            text: 'Total word frequency in period'
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

// CUSTOM LINE CHART ============================================================

var customLineChartData = {

    labels: custom_datetimes,
    datasets: []
};

for (i = 0; i < custom_words.length; i++) {

    dataset = {
        label: custom_words[i],
        fill: false,
        lineTension: 0.3,
        borderColor: colourlist[i],
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colourlist[i],
        pointHoverBorderColor: colourlist[i],
        pointRadius: 0.5,
        pointHitRadius: 15,
        data: custom_frequencies[i]
    }

    customLineChartData.datasets.push(dataset)
}

var ctx = document.getElementById("customLineChart").getContext("2d");

var customLineChart = new Chart(ctx, {
    type: 'line',
    data: customLineChartData,
    options: {
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Word frequencies'
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


// UPDATING TOP CHARTS AFTER PARAMETERS CHANGE =================================

function update_top_chart(top_start_selected, top_end_selected, top_n_seleced) {

    generate_top_data(top_start_selected, top_end_selected, parseInt(top_n_seleced))
    //
    topBarChart.data.labels = top_words_sorted
    topBarChart.data.datasets[0].data = top_total_freqs_over_period_sorted
    topBarChart.update()

    topLineChart.data.labels = top_datetimes
    topLineChartData.datasets = []
    for (i = 0; i < top_n_seleced; i++) {
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
        topLineChartData.datasets.push(dataset)
    }
    topLineChart.update()
    //
}

// UPDATING CUSTOM CHARTS AFTER PARAMETERS CHANGE ==============================

function update_custom_chart(custom_start_selected, custom_end_selected, word1, word2, word3) {

    generate_custom_data(custom_start_selected, custom_end_selected, word1, word2, word3)

    customLineChart.data.labels = custom_datetimes
    customLineChartData.datasets = []
    for (i = 0; i < custom_words.length; i++) {
        dataset = {
            label: custom_words[i],
            fill: false,
            lineTension: 0.3,
            borderColor: colourlist[i],
            pointHoverRadius: 5,
            pointHoverBackgroundColor: colourlist[i],
            pointHoverBorderColor: colourlist[i],
            pointRadius: 1,
            pointHitRadius: 15,
            data: custom_frequencies[i]
        }
        customLineChartData.datasets.push(dataset)
    }
    customLineChart.update()
    //
}
