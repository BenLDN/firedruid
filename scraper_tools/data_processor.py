import re
import json
from collections import Counter
from textblob import Word

####
from datetime import datetime
####


def load_config():

    with open('config.json', 'r') as file:
        config = json.load(file)

    return config['excluded_words_file'], config['min_word_length']


def read_excluded_words(excluded_words_file):

    with open('excluded_words.json', 'r') as exc_file:
        excluded_words = json.load(exc_file)

    return set(excluded_words)


def clean_list(raw_list):

    def clean_string(text):
        return re.sub('[^0-9a-zA-Z]+', ' ', text.lower()).strip()

    return [clean_string(title) for title in raw_list]


def word_freq_from_list(title_list):
    title_words = ' '.join(title_list).split()
    title_words_lemmatised = []

    for title_word in title_words:
        title_words_lemmatised.append(Word(title_word).lemmatize())
    return Counter(title_words_lemmatised)


def word_freq_filter(raw_freq, excluded_words, min_word_length):
    word_freq_cleaned = {word: freq for word, freq in raw_freq.items()
                         if len(word) >= min_word_length and
                         word not in excluded_words}

    return word_freq_cleaned


def calculate_freq_percentage(freq_abs):
    total_words = sum(freq_abs.values())
    return {word: (freq / total_words) for word, freq in freq_abs.items()}


def get_top_words(freq_pctg, word_count):
    return Counter(freq_pctg).most_common()[: word_count]


def add_rank(tuple_list):
    list_with_rank = []

    for i, tup in enumerate(tuple_list):
        list_with_rank.append((tup[0], tup[1], i+1))

    return list_with_rank


def words_tuple_list_from_titles(raw_title_list, word_count):

    excluded_words_file, min_word_length = load_config()
    excluded_words = read_excluded_words(excluded_words_file)

    title_list = clean_list(raw_title_list)

    word_freq_abs = word_freq_from_list(title_list) # This step takes the most time by far
    word_freq_abs_filtered = word_freq_filter(word_freq_abs,
                                              excluded_words,
                                              min_word_length)

    word_freq_pctg = calculate_freq_percentage(word_freq_abs_filtered)
    word_freq_pctg_top = get_top_words(word_freq_pctg, word_count)

    word_freq_pctg_top_ranked = add_rank(word_freq_pctg_top)

    return word_freq_pctg_top_ranked
