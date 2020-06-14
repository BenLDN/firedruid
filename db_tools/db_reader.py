import datetime
import numpy as np
import pandas as pd
import db_tools.db_operations as db_operations


def read_all():

    conn = db_operations.db_connect('processed')

    sql = '''SELECT * FROM words'''
    data = db_operations.execute_sql(conn, sql)

    df = pd.DataFrame(data,
                      columns=['key1', 'scrape_key', 'site', 'dt',
                               'tm', 'word', 'freq', 'rank'])

    db_operations.db_close(conn)

    df['dtm'] = df.dt + " " + df.tm
    df['dtm'] = pd.to_datetime(df['dtm'])

    df = df[df.groupby(['dtm'])['tm'].transform(max) == df['tm']]

    return df


def trunc_df_days(df, how_many_days):
    day_delta = str(how_many_days) + "day"
    return df[df.dtm >= datetime.datetime.now() - pd.to_timedelta(day_delta)]


def get_trend_data(df, how_many_words, how_many_days, interval):

    trend_data = {}

    df = trunc_df_days(df, how_many_days)

    if interval == 'hourly':
        pivot_by = 'dtm'
        num_of_scrapes = df.groupby('dtm')['scrape_key'].nunique()
    else:
        pivot_by = 'dt'
        num_of_scrapes = df.groupby('dt')['scrape_key'].nunique()

    df = pd.pivot_table(df,
                        index=['word'],
                        columns=[pivot_by],
                        values='freq',
                        aggfunc=np.sum)

    df = df.divide(num_of_scrapes, axis=1)

    df = df.fillna(0)

    df['total'] = df.sum(axis=1)
    df = df.sort_values(by='total', ascending=False).drop(['total'], axis=1)

    df = df.iloc[:how_many_words, :]

    dtms = list(df.columns)
    trend_data['time_dim'] = [str(dtm)[:16] for dtm in dtms]

    trend_data['words'] = list(df.index)

    value_list = []
    for i in range(0, how_many_words):
        vals = df.iloc[i, :]
        vals = map(lambda x: round(x, 6) * 100, vals)
        value_list.append(list(vals))

    trend_data['value_list'] = value_list

    return trend_data


def get_top_words(df, how_many_words, how_many_days):

    top_data = {}

    df = trunc_df_days(df, how_many_days)

    num_of_scrapes = len(df.groupby(['dtm', 'site']))  # to be updated

    ser = df.groupby(['word']) \
            .sum() \
            .sort_values(by='freq',
                         ascending=False) \
            .iloc[:how_many_words]['freq']

    ser = ser / num_of_scrapes

    ser = ser.map(lambda x: round(x, 6) * 100)

    top_data['labels'] = list(ser.index)
    top_data['values'] = list(ser)

    return top_data


def get_app_load_data(trend_words, top_words, hourly_days, daily_days):

    app_load_data = {}
    df = read_all()

    app_load_data['top_words_hourly'] = get_top_words(df,
                                                      top_words,
                                                      hourly_days)

    app_load_data['top_words_daily'] = get_top_words(df,
                                                     top_words,
                                                     daily_days)

    app_load_data['trend_data_hourly'] = get_trend_data(df,
                                                        trend_words,
                                                        hourly_days,
                                                        'hourly')

    app_load_data['trend_data_daily'] = get_trend_data(df,
                                                       trend_words,
                                                       daily_days,
                                                       'daily')

    return app_load_data


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
