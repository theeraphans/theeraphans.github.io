import unittest
from urllib.request import urlopen
from urllib.error import HTTPError
from html.parser import HTMLParser


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.diagrams = 0
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag == 'svg' and attrs.get('role') == 'img':
            self.diagrams += 1


class ProjectRoutes(unittest.TestCase):
    def test_readers_can_open_each_article_from_catalog(self):
        catalog = Page(urlopen('http://localhost:8765/project/').read().decode())
        for slug in ['agentic-platform', 'voc', 'sales-recovery', 'data-platform', 'visual-recognition', 'hermes']:
            with self.subTest(slug=slug):
                self.assertIn(slug + '/', catalog.links)
                try:
                    text = urlopen('http://localhost:8765/project/' + slug + '/').read().decode()
                except HTTPError as error:
                    self.fail(f'{slug}: article returned {error.code}')
                article = Page(text)
                self.assertGreaterEqual(article.diagrams, 1)
                self.assertIn('../', article.links)


if __name__ == '__main__':
    unittest.main()
