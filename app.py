import json
from flask import Flask, render_template

colourlist = ["#4582EC", "#6f42c1", "#d9534f", "#fd7e14", "#02B875",
              "#e83e8c", "#f0ad4e", "#20c997", "#17a2b8", "#343a40"]


app = Flask(__name__)


@app.route("/")
def root():

    with open('config.json', 'r') as file:
        config = json.load(file)

    with open(config['frontend_json'], 'r') as file:
        app_load_data = json.load(file)

    with open(config['frontend_data_json'], 'r') as file:
        all_data = json.load(file)

    datetimes = all_data['datetimes']
    dates = sorted(list(set([dtm[:10] for dtm in datetimes])))
    dates = dates[14:] # dropping the days when firedruid was running in test mode
    default_end_date = dates[-1]
    default_start_date = dates[-31]
    default_top_n = 5
    print(datetimes[-1])

    week_keys = sorted(app_load_data['hourly'].keys(), reverse=True)

    week_keys.insert(0,  week_keys.pop())

    return render_template('index.html',
                           app_load_data=app_load_data,
                           all_data=all_data,
                           colourlist=colourlist,
                           week_keys=week_keys,
                           dates=dates,
                           default_start_date=default_start_date,
                           default_end_date=default_end_date,
                           default_top_n=default_top_n)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
