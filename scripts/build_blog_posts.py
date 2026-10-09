"""Build the independent blog using the shared article layout."""
from pathlib import Path
from build_blog import head, article_toc

ROOT = Path(__file__).resolve().parents[1]
TITLE = 'Beyond the prompt: designing an agent harness for business workflows'
SLUG = 'business-agent-harness'

def build():
    body = (ROOT / 'scripts/content/harness-blog.html').read_text()
    desktop, mobile = article_toc(body)
    folder = ROOT / 'blog' / SLUG
    folder.mkdir(parents=True, exist_ok=True)
    article = head(TITLE, 1).replace('<main id="main">', '<main id="main" class="article-layout">')
    article += desktop + '<div class="article-column"><article><div class="intro article-intro"><a class="back-link" href="../">← All blog posts</a><h1>' + TITLE + '</h1><p class="lead">A literature-informed proposal for authorization, recovery, and evaluation around business agents.</p><p class="meta">Theeraphan Sukchok · 9 October 2026 · Research note</p><div class="tags"><span>Agentic AI</span><span>Harness engineering</span><span>Evaluation</span></div></div>' + mobile + '<div class="article-body">' + body + '</div></article></div></main><footer><span>© 2026 Theeraphan Sukchok</span><a href="../">All posts</a></footer><script src="../../js/reading-nav.js?v=20261009-research"></script></body></html>'
    (folder / 'index.html').write_text(article)
    catalog = head('Blog') + '<div class="intro"><p class="eyebrow">Blog</p><h1>Research notes &amp; ideas.</h1><p class="lead">Reading the evidence, examining engineering choices, and defining what to test next.</p></div><nav class="project-catalog" aria-label="Blog posts"><a href="' + SLUG + '/"><span class="catalog-number">9 October 2026 · Research note</span><h2>' + TITLE + '</h2><p>What should the software around an agent guarantee before it can execute business actions?</p><div class="tags"><span>Agentic AI</span><span>Evaluation</span></div><span class="catalog-read">Read article →</span></a></nav></main><footer>© 2026 Theeraphan Sukchok</footer></body></html>'
    (ROOT / 'blog/index.html').write_text(catalog)

if __name__ == '__main__':
    build()
