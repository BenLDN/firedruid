import json
from datetime import datetime
import scraper_tools.title_list_scraper as title_list_scraper
import scraper_tools.word_frequencies as word_frequencies
import db_tools.db_operations as db_operations


def read_news_site_list():

    with open('news_sites.txt', 'r') as infile:
        news_sites = json.load(infile)

    return news_sites


def scrape_all_sites():

    news_sites = read_news_site_list()
    conn = db_operations.db_connect()
    scrape_keys = []
    sites = []
    days = []
    hours = []

    day = datetime.now().strftime("%Y-%m-%d")
    hour = datetime.now().strftime("%H:%M")

    for site in news_sites:
        site_name = site['name']

        scrape_key = db_operations.insert_scrape(conn, [site_name, day, hour])
        scrape_keys.append(scrape_key)
        sites.append(site_name)
        days.append(day)
        hours.append(hour)

        title_list = title_list_scraper.get_title_list_from_site(site)

        db_operations.insert_titles(conn, title_list, scrape_key)

    db_operations.db_close(conn)

    return scrape_keys, sites, days, hours


if __name__ == '__main__':

    scrape_keys, sites, days, hours = scrape_all_sites()

    for (scrape_key, site, day, hour) in zip(scrape_keys, sites, days, hours):
        word_frequencies.db_titles_to_top_words(scrape_key,
                                                site,
                                                day,
                                                hour,
                                                20)
