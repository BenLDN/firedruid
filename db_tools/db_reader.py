import datetime
import numpy as np
import pandas as pd
import db_tools.db_operations as db_operations


def read_all():

    conn = db_operations.db_connect('processed')

    sql = '''SELECT * FROM words'''
    top_words = db_operations.execute_sql(conn, sql)

    df = pd.DataFrame(top_words,
                      columns=['key1', 'key2', 'site', 'dt',
                               'tm', 'word', 'freq', 'rank'])

    df['dt'] = pd.to_datetime(df['dt'])
    df = df[df.groupby(['dt'])['tm'].transform(max) == df['tm']]
    db_operations.db_close(conn)

    return df


def top_words_7d():

    df = read_all()
    df = df[df.dt >= datetime.datetime.now() - pd.to_timedelta("7day")]
    scrape_num = len(df.groupby(['dt', 'site']))

    df = df.groupby(['word']) \
           .sum() \
           .sort_values(by='freq',
                        ascending=False) \
           .iloc[:10]['freq']

    df = df / scrape_num

    return df


def top_words_daily(how_many):

    df = read_all()
    site_num = len(df.groupby(['site']))

    df = pd.pivot_table(df,
                        index=['word'],
                        columns=['dt'],
                        values='freq',
                        aggfunc=np.sum)

    df = df / site_num

    df = df.fillna(0)
    df['total'] = df.sum(axis=1)
    df = df.sort_values(by='total', ascending=False)
    df = df.iloc[:how_many, :-1]

    datetimes = list(df.columns)
    dates = [str(datetime)[:10] for datetime in datetimes]
    words = list(df.index)

    value_list = []

    for i in range(0, how_many):
        value_list.append(df.iloc[i, :].tolist())

    return dates, words, value_list


def read_site_titles(scrape_key):
    conn = db_operations.db_connect('raw')

    sql_titles = 'SELECT * FROM titles WHERE fk_scrapes = ' + str(scrape_key)
    sql_scrape = 'SELECT * FROM scrapes WHERE pk_scrapes = ' + str(scrape_key)

    raw_titles = db_operations.execute_sql(conn, sql_titles)
    scrape = db_operations.execute_sql(conn, sql_scrape)

    site_titles = [title_item[2]
                   for title_item in raw_titles
                   if title_item[1] == scrape_key]

    db_operations.db_close(conn)

    return site_titles, scrape[0]
