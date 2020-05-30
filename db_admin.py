import sys
import pandas as pd
import db_tools.db_operations as db_operations
import scraper_tools.word_frequencies as word_frequencies


def screen_dump():

    conn = db_operations.db_connect()

    scrapes = db_operations.execute_sql(conn, 'SELECT * FROM scrapes')
    titles = db_operations.execute_sql(conn, 'SELECT * FROM titles')
    words = db_operations.execute_sql(conn, 'SELECT * FROM words')

    print('number of scrapes: ' + str(len(scrapes)))
    print('number of titles: ' + str(len(titles)))
    print('number of words: ' + str(len(words)))

    print('scrapes: ')
    for scrape in scrapes:
        print(scrape)

    print('titles: ')
    for title in titles:
        print(title)

    print('words: ')
    for word in words:
        print(word)


def csv_word_dump():

    conn = db_operations.db_connect()
    sql = '''SELECT * FROM words w
             LEFT JOIN scrapes s ON w.fk_scrapes = s.pk_scrapes'''
    top_words = db_operations.execute_sql(conn, sql)
    db_operations.db_close(conn)

    if __name__ == '__main__':
        df = pd.DataFrame(top_words)
        df.to_csv('db.csv')

    print('Done')


def erase_db():

    conn = db_operations.db_connect()

    db_operations.create_scrapers_table(conn)
    db_operations.create_titles_table(conn)
    db_operations.create_words_table(conn)
    db_operations.db_close(conn)

    print('Done')


def rerun_word_freq():

    conn = db_operations.db_connect()

    db_operations.create_words_table(conn)
    sql = '''SELECT DISTINCT pk_scrapes from scrapes'''
    scrape_keys = db_operations.execute_sql(conn, sql)
    db_operations.db_close(conn)

    for scrape_key in scrape_keys:
        word_frequencies.db_titles_to_top_words(scrape_key[0], 20)

    print('Done')


def run_sql():

    sql = input('SQL: ')

    conn = db_operations.db_connect()
    data = db_operations.execute_sql(conn, sql)
    db_operations.db_close(conn)

    print(data)


if __name__ == '__main__':

    helptxt = '''Options:

                 screen-dump,
                 csv-words-dump,
                 erase-db,
                 rerun-word-freq,
                 run-sql'''

    if len(sys.argv) != 2:
        print(helptxt)

    elif sys.argv[1] == 'screen-dump':
        screen_dump()

    elif sys.argv[1] == 'csv-words-dump':
        csv_word_dump()

    elif sys.argv[1] == 'erase-db':
        pass
        # erase_db()

    elif sys.argv[1] == 'rerun-word-freq':
        rerun_word_freq()

    elif sys.argv[1] == 'run-sql':
        run_sql()

    else:
        print(helptxt)
