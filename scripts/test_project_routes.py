import unittest
from urllib.request import urlopen
from urllib.error import HTTPError
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.diagrams = 0
        self.articles = 0
        self.assets = []
        self.ids = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag == 'article':
            self.articles += 1
        if tag in ('img', 'script'):
            self.assets.append(attrs.get('src', ''))
        if tag == 'link':
            self.assets.append(attrs.get('href', ''))
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
                self.assertEqual(article.articles, 1)
                self.assertNotIn('data-workflow', text)

    def test_local_links_assets_and_fragments_resolve(self):
        root = Path(__file__).resolve().parents[1]
        files = [root / 'index.html', root / 'project/index.html', *root.glob('project/*/index.html'), *root.glob('project/*/architecture.html')]
        for file in files:
            page = Page(file.read_text())
            for link in page.links + page.assets:
                resolved = urlparse(urljoin('http://localhost:8765/' + str(file.relative_to(root)), link))
                if resolved.netloc != 'localhost:8765':
                    continue
                target = root / unquote(resolved.path).lstrip('/')
                if target.is_dir():
                    target = target / 'index.html'
                with self.subTest(file=str(file.relative_to(root)), link=link):
                    self.assertTrue(target.is_file(), str(target))
                    if resolved.fragment:
                        self.assertIn(resolved.fragment, Page(target.read_text()).ids)


if __name__ == '__main__':
    unittest.main()
