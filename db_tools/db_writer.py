import db_tools.db_operations as db_operations


def store_scraped_titles(site_name, day, hour, title_list):

    conn = db_operations.db_connect('raw')

    scrape_key = db_operations.insert_scrape(conn, [site_name, day, hour])
    db_operations.insert_titles(conn, title_list, scrape_key)

    db_operations.db_close(conn)

    return scrape_key


def store_words(processed_batch):
    conn = db_operations.db_connect('processed')
    db_operations.insert_words(conn, processed_batch)
    db_operations.db_close(conn)
