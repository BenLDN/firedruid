import datetime
import numpy as np
import pandas as pd
import db_tools.db_operations as db_operations


def read_site_titles(scrape_key_list):

    conn = db_operations.db_connect('raw')

    result_list = []

    sql = '''SELECT s.pk_scrapes, s.site, s.day, s.hour, t.title
             FROM scrapes s LEFT JOIN titles t ON s.pk_scrapes = t.fk_scrapes
             WHERE s.pk_scrapes IN
          '''
    sql +=  '(' + ','.join([str(itm) for itm in scrape_key_list]) + ')'

    results = db_operations.execute_sql(conn, sql)

    db_operations.db_close(conn)

    result_dict = {}
    for result in results:
        key = tuple(result[0:4])
        value = result[4]
        if key in result_dict:
            result_dict[key].append(value)
        else:
            result_dict[key] = [value]

    result_list = [(k,v) for k,v in result_dict.items()]

    return result_list


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


def get_frontend_data(words_stored):

    df = read_all()

    df['dtm'] = df['dt'] + " " + df['tm'].str[:2]
    df = df[['dt', 'dtm', 'word', 'freq']]
    df['rel_freq'] = df['freq'] / df.groupby('dtm')['dtm'].transform('count') * words_stored

    pivot_dt = pd.pivot_table(df,
                      values='rel_freq',
                      index=['word'],
                      columns=['dt'],
                      aggfunc=np.sum)

    words_to_keep = set()
    lens = []
    for column in pivot_dt:
        daily_top_words = list(pivot_dt[column].sort_values(ascending=False)[:10].index.values)
        words_to_keep.update(daily_top_words)

    pivot_dtm = pd.pivot_table(df,
                       values='rel_freq',
                       index=['word'],
                       columns=['dtm'],
                       aggfunc=np.sum)

    pivot_dtm = pivot_dtm[pivot_dtm.index.isin(words_to_keep)]
    pivot_dtm = pivot_dtm.transpose()
    pivot_dtm = pivot_dtm.fillna(value=0)
    pivot_dtm = pivot_dtm.applymap(lambda x: int(str(x)[2:6]))
    pivot_dtm = pivot_dtm.sort_index(ascending=True)

    frontend_dict = {}
    frontend_dict['words'] = list(pivot_dtm.columns)
    frontend_dict['datetimes'] = list(pivot_dtm.index)
    frontend_dict['frequencies'] = pivot_dtm.values.tolist()

    return frontend_dict
