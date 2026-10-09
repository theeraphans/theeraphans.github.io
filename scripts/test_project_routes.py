import unittest
import re
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
        self.toc_sections = []
        self.left_toc = False
        self.mobile_toc = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('data-toc'):
            self.toc_sections.append(attrs['id'])
        if tag == 'aside' and attrs.get('class') == 'article-toc':
            self.left_toc = True
        if tag == 'details' and attrs.get('class') == 'mobile-toc':
            self.mobile_toc = True
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
    def test_blog_series_has_twelve_distinct_project_notes(self):
        from blog_topics import TOPICS
        root = Path(__file__).resolve().parents[1]
        catalog = Page((root / 'blog/index.html').read_text())
        self.assertEqual(len(TOPICS), 12)
        self.assertEqual(len(set(topic[0] for topic in TOPICS)), 12)
        for slug, project, title, *_ in TOPICS:
            self.assertIn(slug + '/', catalog.links)
            text = (root / 'blog' / slug / 'index.html').read_text()
            page = Page(text)
            self.assertTrue(page.left_toc)
            self.assertTrue(page.mobile_toc)
            self.assertEqual(len(page.ids), len(set(page.ids)))
            self.assertIn('references', page.ids)
            self.assertNotIn('../../project/' + project + '/', page.links)
            self.assertNotIn('Project overview', text)
            self.assertNotIn('{{', text)
            self.assertGreater(len(re.sub('<[^>]+>', ' ', text).split()), 400)
            self.assertIn(title, urlopen('http://localhost:8765/blog/' + slug + '/').read().decode())

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
                self.assertTrue(article.left_toc)
                self.assertTrue(article.mobile_toc)
                self.assertIn('references', article.toc_sections)
                for section in article.toc_sections:
                    self.assertEqual(article.links.count('#' + section), 2)

    def test_local_links_assets_and_fragments_resolve(self):
        root = Path(__file__).resolve().parents[1]
        files = [root / 'index.html', root / 'project/index.html', *root.glob('project/*/index.html'), *root.glob('project/*/architecture.html'), *root.glob('blog/**/index.html')]
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
