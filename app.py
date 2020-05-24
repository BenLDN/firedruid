from flask import Flask, render_template
import db_tools.db_reader as db_reader


app = Flask(__name__)


@app.route("/")
def root():
    return render_template("index.html")


@app.route("/about/")
def public():
    return render_template("about.html")


@app.route("/top-words/")
def words():
    legend = 'Most common words'
    top_words = db_reader.read_top_words()
    labels = list(top_words.index)
    values = list(top_words)
    return render_template("top_words.html",
                           values=values,
                           labels=labels,
                           legend=legend)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
