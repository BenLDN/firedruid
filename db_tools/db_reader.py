import datetime
import numpy as np
import pandas as pd
import db_tools.db_operations as db_operations


def read_all():
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
