import json
from datetime import datetime
import scraper_tools.title_list_scraper as title_list_scraper
import scraper_tools.word_frequencies as word_frequencies
import db_tools.db_reader as db_reader
import db_tools.db_writer as db_writer


def read_news_site_list():

    with open('news_sites.txt', 'r') as infile:
        news_sites = json.load(infile)

    return news_sites


def scrape_all_sites():

    scrape_keys = []
    day = datetime.now().strftime("%Y-%m-%d")
    hour = datetime.now().strftime("%H:%M")

    news_sites = read_news_site_list()

    for site in news_sites:

        title_list = title_list_scraper.get_title_list_from_site(site)
        scrape_key = db_writer.store_scraped_titles(site['name'],
                                                    day,
                                                    hour,
                                                    title_list)
        scrape_keys.append(scrape_key)

    return scrape_keys


def process_scraped_data(scrape_keys, words_stored):

    for scrape_key in scrape_keys:

        raw_title_list, scrape = db_reader.read_site_titles(scrape_key)
        site, day, hour = scrape[1], scrape[2], scrape[3]
        words_tuple_list = word_frequencies\
            .words_tuple_list_from_titles(raw_title_list,
                                          words_stored)

        db_writer.store_words(words_tuple_list, scrape_key, site, day, hour)


if __name__ == '__main__':

    words_stored = 20

    scrape_keys = scrape_all_sites()

    process_scraped_data(scrape_keys, words_stored)
