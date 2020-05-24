import sqlite3


def db_connect():
    return sqlite3.connect('scraper.db')


def db_close(conn):
    conn.close()


def create_scrapers_table(conn):
    c = conn.cursor()
    c.execute('DROP TABLE IF EXISTS scrapes')
    c.execute('''CREATE TABLE scrapes
             (pk_scrapes INTEGER PRIMARY KEY AUTOINCREMENT,
              site TEXT,
              day TEXT,
              hour TEXT)''')
    c.close()


def create_titles_table(conn):
    c = conn.cursor()
    c.execute('DROP TABLE IF EXISTS titles')
    c.execute('''CREATE TABLE titles
             (pk_titles INTEGER PRIMARY KEY AUTOINCREMENT,
              fk_scrapes INTEGER,
              title TEXT,
              FOREIGN KEY (fk_scrapes) REFERENCES scrapes (pk_scrapes))''')
    c.close()


def create_words_table(conn):
    c = conn.cursor()
    c.execute('DROP TABLE IF EXISTS words')
    c.execute('''CREATE TABLE words
             (pk_words INTEGER PRIMARY KEY AUTOINCREMENT,
              fk_scrapes INTEGER,
              word TEXT,
              pctg REAL,
              rank INTEGER,
              FOREIGN KEY (fk_scrapes) REFERENCES scrapes (pk_scrapes))''')
    c.close()


def insert_scrape(conn, scrape):
    c = conn.cursor()
    c.execute('INSERT INTO scrapes VALUES (null, ?, ?, ?)', scrape)
    conn.commit()
    scrape_key = c.lastrowid
    c.close()
    return scrape_key


def insert_titles(conn, title_list, scrape_key):
    c = conn.cursor()
    rows = []

    for title in title_list:
        rows.append((None, scrape_key, title))

    c.executemany('INSERT INTO titles VALUES (?, ?, ?)', rows)

    conn.commit()
    c.close()


def insert_words(conn, words_tup_list, scrape_key):
    c = conn.cursor()
    rows = []
    for words_tup in words_tup_list:
        rows.append((None,
                     scrape_key,
                     words_tup[0],
                     words_tup[1],
                     words_tup[2]))

    c.executemany('INSERT INTO words VALUES (?, ?, ?, ?, ?)', rows)

    conn.commit()
    c.close()


def execute_sql(conn, sql):
    c = conn.cursor()
    c.execute(sql)
    return c.fetchall()
