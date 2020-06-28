import json
from flask import Flask, render_template
import db_tools.db_reader as db_reader

colourlist = ["#4582EC", "#6f42c1", "#d9534f", "#fd7e14", "#02B875",
              "#e83e8c", "#f0ad4e", "#20c997", "#17a2b8", "#343a40"]


app = Flask(__name__)


@app.route("/")
def root():

    with open('config.json', 'r') as file:
        config = json.load(file)


    with open(config['frontend_json'], 'r') as file:
        app_load_data2 = json.load(file)

    app_load_data = app_load_data2['latest']

    return render_template("index.html",

    	app_load_data = app_load_data2,
    	colourlist = colourlist,

        top_labels_hourly=list(app_load_data['top_words_hourly']['labels']),
        top_values_hourly=list(app_load_data['top_words_hourly']['values']),
        trend_time_dim_hourly=app_load_data['trend_data_hourly']['time_dim'],
        trend_hourly_zip=zip(app_load_data['trend_data_hourly']['words'],
                             app_load_data['trend_data_hourly']['value_list'],
                             colourlist),
        top_labels_daily=list(app_load_data['top_words_daily']['labels']),
        top_values_daily=list(app_load_data['top_words_daily']['values']),
        trend_time_dim_daily=app_load_data['trend_data_daily']['time_dim'],
        trend_daily_zip=zip(app_load_data['trend_data_daily']['words'],
                            app_load_data['trend_data_daily']['value_list'],
                            colourlist))


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
