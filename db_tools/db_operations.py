import json
import sqlite3


def db_connect(db='raw'):

    with open('config.json', 'r') as file:
        config = json.load(file)

    if db == 'raw':
        return sqlite3.connect(config['raw_db_path'])
    elif db == 'processed':
        return sqlite3.connect(config['processed_db_path'])
    else:
        pass


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
              scrape_key INTEGER,
              site TEXT,
              day TEXT,
              hour TEXT,
              word TEXT,
              pctg REAL,
              rank INTEGER)''')
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


def insert_words(conn, processed_batch): # words_tup_list, scrape_key, site, day, hour

    insert_rows = []

    for processed_row in processed_batch:
        words_tup_list, scrape_key, site, day, hour = processed_row
        for words_tup in words_tup_list:
            insert_rows.append((None,
                                scrape_key,
                                site,
                                day,
                                hour,
                                words_tup[0],
                                words_tup[1],
                                words_tup[2]))
    c = conn.cursor()
    c.executemany('INSERT INTO words VALUES (?, ?, ?, ?, ?, ?, ?, ?)', insert_rows)
    conn.commit()
    c.close()


def execute_sql(conn, sql):
    c = conn.cursor()
    c.execute(sql)
    return c.fetchall()
