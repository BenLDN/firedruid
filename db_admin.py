import sys
import pandas as pd
import db_tools.db_operations as db_operations
import scraper_tools.word_frequencies as word_frequencies


def screen_dump():

    conn = db_operations.db_connect('raw')

    scrapes = db_operations.execute_sql(conn, 'SELECT * FROM scrapes')
    titles = db_operations.execute_sql(conn, 'SELECT * FROM titles')

    print('number of scrapes: ' + str(len(scrapes)))
    print('number of titles: ' + str(len(titles)))

    print('scrapes: ')
    for scrape in scrapes:
        print(scrape)

    print('titles: ')
    for title in titles:
        print(title)


def csv_word_dump():

    conn = db_operations.db_connect('processed')
    sql = '''SELECT * FROM words'''
    top_words = db_operations.execute_sql(conn, sql)
    db_operations.db_close(conn)

    if __name__ == '__main__':
        df = pd.DataFrame(top_words)
        df.to_csv('db.csv')

    print('Done')


def recreate_db():

    conn = db_operations.db_connect('raw')
    db_operations.create_scrapers_table(conn)
    db_operations.create_titles_table(conn)
    db_operations.db_close(conn)

    conn = db_operations.db_connect('processed')
    db_operations.create_words_table(conn)
    db_operations.db_close(conn)

    print('Done')


def rerun_word_freq():

    conn = db_operations.db_connect('raw')

    db_operations.create_words_table(conn)
    sql = '''SELECT * from scrapes'''
    scrape_rows = db_operations.execute_sql(conn, sql)

    db_operations.db_close(conn)

    for scrape_row in scrape_rows:
        word_frequencies.db_titles_to_top_words(scrape_row[0],
                                                scrape_row[1],
                                                scrape_row[2],
                                                scrape_row[3],
                                                20)

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
                 recreate-db,
                 rerun-word-freq,
                 run-sql'''

    if len(sys.argv) != 2:
        print(helptxt)

    elif sys.argv[1] == 'screen-dump':
        screen_dump()

    elif sys.argv[1] == 'csv-words-dump':
        csv_word_dump()

    elif sys.argv[1] == 'recreate-db':
        recreate_db()

    elif sys.argv[1] == 'rerun-word-freq':
        rerun_word_freq()

    elif sys.argv[1] == 'run-sql':
        run_sql()

    else:
        print(helptxt)
