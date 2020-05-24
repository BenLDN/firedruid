import pandas as pd
import db_tools.db_operations as db_operations


def read_top_words():

    conn = db_operations.db_connect()

    sql = '''SELECT *
             FROM words w
             LEFT JOIN scrapes s
             ON w.fk_scrapes = s.pk_scrapes'''

    top_words = db_operations.execute_sql(conn, sql)

    df = pd.DataFrame(top_words,
                      columns=['key1', 'key2', 'word',
                               'freq', 'rank', 'key3',
                               'site', 'dt', 'tm'])

    df = df[df.groupby(['dt'])['tm'].transform(max) == df['tm']]

    scrape_num = len(df.groupby(['dt', 'site']))

    df = df.groupby(['word']) \
           .sum() \
           .sort_values(by='freq',
                        ascending=False) \
           .iloc[:10]['freq']

    df = df / scrape_num

    db_operations.db_close(conn)

    return df
