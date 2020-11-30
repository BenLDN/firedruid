import logging
import json
from datetime import datetime
import scraper_tools.title_list_scraper as title_list_scraper
import scraper_tools.data_processor as data_processor
import db_tools.db_reader as db_reader
import db_tools.db_writer as db_writer


def read_news_site_list(news_sites_file):

    with open(news_sites_file, 'r') as file:
        news_sites = json.load(file)

    return news_sites


def scrape_all_sites(news_sites_file):

    scrape_keys = []
    day = datetime.now().strftime("%Y-%m-%d")
    hour = datetime.now().strftime("%H:%M")

    news_sites = read_news_site_list(news_sites_file)

    for site in news_sites:

        title_list = title_list_scraper.get_title_list_from_site(site)
        scrape_key = db_writer.store_scraped_titles(site['name'],
                                                    day,
                                                    hour,
                                                    title_list)
        scrape_keys.append(scrape_key)

    return scrape_keys


def process_scraped_data(scrape_keys, words_stored):

    processed_batch = []
    result_list = db_reader.read_site_titles(scrape_keys)

    for result in result_list:

        scrape, raw_title_list = result
        scrape_key, site, day, hour = scrape

        if len(raw_title_list) > 1:
            words_tuple_list = data_processor\
                .words_tuple_list_from_titles(raw_title_list,
                                              words_stored)

            processed_batch.append(tuple([words_tuple_list,
                                          scrape_key, site, day, hour]))

    db_writer.store_words(processed_batch)

    return len(str(processed_batch))


def generate_frontend_json(config):

    frontend_data = db_reader.get_frontend_data(config['words_stored'])

    with open(config['frontend_data_json'], 'w') as file:
        json.dump(frontend_data, file)

    return len(frontend_data['words']), len(frontend_data['datetimes'])


if __name__ == '__main__':

    logging.basicConfig(filename='druidscrape.log',
                        filemode='a',
                        format='%(asctime)s - %(message)s',
                        level=logging.INFO,
                        datefmt='%Y-%m-%d %H:%M:%S')

    logging.info('---=== main_scraper.py ===---')
    with open('config.json', 'r') as file:
        config = json.load(file)

    scrape_keys = scrape_all_sites(config['news_sites_file'])
    logging.info('Number of websites scraped: ' + str(len(scrape_keys)))

    payload_size = process_scraped_data(scrape_keys, config['words_stored'])
    logging.info('Processed data, payload size: ' + str(payload_size))

    no_of_words, no_of_dtm = generate_frontend_json(config)
    logging.info('JSON generated: ' + str(no_of_words) + ' words and ' + str(no_of_dtm) + ' datetimes')
