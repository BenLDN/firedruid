import json

news_sites = [
    {
        'name': 'bbc',
        'link': 'https://www.bbc.co.uk',
        'rules': [[0, {'class': 'top-story__title'}]]
    },

    {
        'name': 'guardian',
        'link': 'https://www.theguardian.com/uk',
        'rules': [['a', {'data-link-name': 'article'}]]
    },

    {
        'name': 'independent',
        'link': 'https://www.independent.co.uk',
        'rules': [[0, {'class': 'headline'}],
                  ['h2', 0]]
    },

    {
        'name': 'telegraph',
        'link': 'https://www.telegraph.co.uk',
        'rules': [[0, {'class': 'list-headline__text'}]]
    },

    {
        'name': 'dailymail',
        'link': 'https://www.dailymail.co.uk',
        'rules': [['a', {'itemprop': 'url'}]]
    },

    {
        'name': 'sun',
        'link': 'https://www.thesun.co.uk',
        'rules': [['p', {'class': 'teaser__subdeck'}]]
    },

    {
        'name': 'mirror',
        'link': 'https://www.mirror.co.uk',
        'rules': [['a', {'class': 'headline'}]]
    },

    {
        'name': 'express',
        'link': 'https://www.express.co.uk',
        'rules': [['h2', 0],
                  ['h4', 0]]
    }
    ]

exclude_words = ['the', 'be', 'is', 'am', 'are', 'was',
                 'were', 'been', 'to', 'of', 'and', 'a', 'in',
                 'that', 'have', 'has', 'had', 'i', 'it', 'for',
                 'not', 'on', 'with', 'he', 'as', 'you',
                 'do', 'does', 'did', 'done', 'at', 'this',
                 'but', 'his', 'by', 'from', 'they', 'we',
                 'say', 'her', 'she', 'or', 'an', 'will',
                 'my', 'one', 'all', 'would', 'there', 'their',
                 'what', 'so', 'up', 'out', 'if', 'about', 'who',
                 'get', 'which', 'go', 'me', 'when', 'make', 'can',
                 'like', 'time', 'no', 'just', 'him', 'know',
                 'take', 'people', 'into', 'year', 'your', 'good',
                 'some', 'could', 'them', 'see', 'other', 'than',
                 'then', 'now', 'look', 'only', 'come', 'its', 'over',
                 'think', 'also', 'back', 'after', 'use', 'two',
                 'how', 'our', 'work', 'first', 'well', 'way', 'even',
                 'new', 'want', 'because', 'any', 'these', 'give',
                 'gives', 'gave', 'given' 'day', 'most', 'us', 'says',
                 'why', 'off', 'more', 'show', 'ever', 'need', 'should',
                 'taking', 'got', 'everything', 'every']


with open('news_sites.txt', 'w') as news_file:
    json.dump(news_sites, news_file)


with open('exclude_words.txt', 'w') as exclude_file:
    json.dump(exclude_words, exclude_file)
