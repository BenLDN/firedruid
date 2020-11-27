import json
from flask import Flask, render_template

colourlist = ["#4582EC", "#6f42c1", "#d9534f", "#fd7e14", "#02B875",
              "#e83e8c", "#f0ad4e", "#20c997", "#17a2b8", "#343a40"]


app = Flask(__name__)


@app.route("/")
def root():

    with open('config.json', 'r') as file:
        config = json.load(file)

    with open(config['frontend_data_json'], 'r') as file:
        all_data = json.load(file)

    datetimes = all_data['datetimes']
    dates = sorted(list(set([dtm[:10] for dtm in datetimes])))
    default_end_date = dates[-1]
    default_start_date = dates[-31]

    return render_template('index.html',
                           all_data=all_data,
                           colourlist=colourlist,
                           default_start_date=default_start_date,
                           default_end_date=default_end_date)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
