import sys
import pandas as pd
import main_scraper
import db_tools.db_operations as db_operations


def recreate_db():

    text = '''This might erase both databases. Enter "Y" to continue: '''
    confirm = input(text)

    if confirm == 'Y':

        conn = db_operations.db_connect('raw')
        db_operations.create_scrapers_table(conn)
        db_operations.create_titles_table(conn)
        db_operations.db_close(conn)

        conn = db_operations.db_connect('processed')
        db_operations.create_words_table(conn)
        db_operations.db_close(conn)

        print('Done')

    else:
        print('Cancelled')


def db_to_csv(db_name):

    conn = db_operations.db_connect(db_name)

    if db_name == 'processed':
        sql = '''SELECT *
                 FROM words'''
        file_name = 'db_processed.csv'
    elif db_name == 'raw':
        sql = '''SELECT *
                 FROM scrapes s
                 LEFT JOIN titles t
                 ON s.pk_scrapes = t.fk_scrapes'''
        file_name = 'db_raw.csv'

    data_dump = db_operations.execute_sql(conn, sql)
    db_operations.db_close(conn)

    pd.DataFrame(data_dump).to_csv(file_name)

    print('Done')


def rerun_processing():

    text = '''Top X words from each scrape are stored. What should X be? '''
    words_stored = int(input(text))

    conn = db_operations.db_connect('raw')

    db_operations.create_words_table(conn)
    sql = '''SELECT pk_scrapes from scrapes'''
    scrape_keys_raw = db_operations.execute_sql(conn, sql)
    scrape_keys = [key[0] for key in scrape_keys_raw]

    db_operations.db_close(conn)

    main_scraper.process_scraped_data(scrape_keys, words_stored)


def run_sql():

    text = '''Database to use: "raw" (default) or "processed"? '''
    db_name = input(text)

    if db_name != 'processed':
        db_name = 'raw'

    text = '''Output should be sent to "screen" (default) or "csv" '''
    out_method = input(text)

    if out_method != 'csv':
        out_method = 'screen'

    sql = input('SQL: ')

    conn = db_operations.db_connect(db_name)
    data = db_operations.execute_sql(conn, sql)
    db_operations.db_close(conn)

    if out_method == 'screen':
        print(data)
    else:
        pd.DataFrame(data).to_csv('sql_output.csv')


if __name__ == '__main__':

    helptxt = '''Options:

                 raw-to-csv,
                 processed-to-csv,
                 recreate-db,
                 rerun-processing,
                 run-sql'''

    if len(sys.argv) != 2:
        print(helptxt)

    elif sys.argv[1] == 'raw-to-csv':
        db_to_csv('raw')

    elif sys.argv[1] == 'processed-to-csv':
        db_to_csv('processed')

    elif sys.argv[1] == 'recreate-db':
        recreate_db()

    elif sys.argv[1] == 'rerun-processing':
        rerun_processing()

    elif sys.argv[1] == 'run-sql':
        run_sql()

    else:
        print(helptxt)
