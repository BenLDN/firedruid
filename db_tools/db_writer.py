import db_tools.db_operations as db_operations


def store_scraped_titles(site_name, day, hour, title_list):

    conn = db_operations.db_connect('raw')

    scrape_key = db_operations.insert_scrape(conn, [site_name, day, hour])
    db_operations.insert_titles(conn, title_list, scrape_key)

    db_operations.db_close(conn)

    return scrape_key


def store_words(words_tuple_list, scrape_key, site, day, hour):

    conn = db_operations.db_connect('processed')
    db_operations.insert_words(conn,
                               words_tuple_list,
                               scrape_key,
                               site,
                               day,
                               hour)
    db_operations.db_close(conn)
