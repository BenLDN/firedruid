from flask import Flask, render_template
import db_tools.db_reader as db_reader

trends_colourlist = ["#4582EC", "#6f42c1", "#d9534f", "#fd7e14", "#02B875",
                     "#e83e8c", "#f0ad4e", "#20c997", "#17a2b8", "#343a40"]


app = Flask(__name__)


@app.route("/")
def root():

    top_words = db_reader.top_words_7d()
    words_labels = list(top_words.index)
    words_values = map(lambda x: round(x, 6) * 100, list(top_words))

    how_many = 5
    trends_dates, trends_wordlist, trends_valuelist = \
        db_reader.top_words_daily(how_many)

    trends_valuelist = [list(map(lambda x: round(x, 6) * 100,
                        list(values))) for values in trends_valuelist]

    return render_template("index.html",
                           words_labels=words_labels,
                           words_values=words_values,
                           trends_dates=trends_dates,
                           trends_zip=zip(trends_wordlist,
                                          trends_valuelist,
                                          trends_colourlist))


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
