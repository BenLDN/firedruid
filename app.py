from flask import Flask, render_template
import db_tools.db_reader as db_reader

colourlist = ["#4582EC", "#6f42c1", "#d9534f", "#fd7e14", "#02B875",
              "#e83e8c", "#f0ad4e", "#20c997", "#17a2b8", "#343a40"]


app = Flask(__name__)


@app.route("/")
def root():
    return render_template("index.html")


@app.route("/about/")
def public():
    return render_template("about.html")


@app.route("/top-words-7d/")
def top_words_7d():
    top_words = db_reader.top_words_7d()
    labels = list(top_words.index)
    values = map(lambda x: x * 100, list(top_words))
    return render_template("top_words_7d.html",
                           values=values,
                           labels=labels)


@app.route("/top-words-trend/")
def top_words_trend():
    how_many = 5
    dates, wordlist, valuelist = db_reader.top_words_daily(how_many)
    valuelist = [list(map(lambda x: x * 100,
                 list(values))) for values in valuelist]
    return render_template("top_words_trend.html",
                           wordlist_valuelist_colourlist=zip(wordlist,
                                                             valuelist,
                                                             colourlist),
                           labels=dates,
                           )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
