"""Build focused project-based research notes."""
from pathlib import Path
from html import escape
import re
from build_blog import head, article_toc
from blog_topics import TOPICS, BASIS

ROOT = Path(__file__).resolve().parents[1]
TITLE = 'Beyond the prompt: designing an agent harness for business workflows'
SLUG = 'business-agent-harness'

TESTS = [
    'Compare explicit request preparation with a model-only handoff on the same incomplete shipment inquiries. Inspect the selected route and exact tool inputs alongside answer quality. Keep the model and available capabilities fixed so the comparison measures the handoff policy.',
    'Preserve the baseline version and evaluator configuration. Compare one proposed change on development cases, then use a separate held-out set for promotion. Attach failed cases, tool evidence, and the configuration diff to the review. Inspect judge disagreement rather than treating an average score as sufficient evidence.',
    'Disconnect the browser during a controlled long-running response. Inspect runtime state and reconnect without starting another execution. Repeat with two users and attempt access to the wrong session. Delivery recovery and permission checks need independent acceptance criteria.',
    'Add a document containing a unique phrase, inspect retrieval, then attempt deletion during a remote-service outage. The interface must preserve the failed mutation status. After recovery, delete successfully and check both retrieval paths. Record which path supplied each answer.',
    'Compare taxonomy-only classification with retrieval-assisted classification on the same reviewed messages. Preserve the retrieved definitions beside each prediction. Include similar categories and multiple intents, and keep the output policy fixed. Inspect whether retrieval supplied useful definitions or distracting context.',
    'Report category-level errors alongside correction time. Keep email and transcript cases separate and related messages within the same split. Replay duplicate messages and inspect both the records and dashboard counts. The outcome is a reviewed record with a known correction cost.',
    'Create a controlled fixture with unconverted, fully converted, and partly converted quotations. Test eligibility against explicit expected answers before comparing priority rules. Freeze the observation time so later orders do not change the explanation of an earlier decision.',
    'Simulate a follow-up endpoint accepting a task but delaying its response until timeout. Replay the decision and inspect duplicate effects. Separately define a commercial observation window and comparison population. Increased notifications demonstrate activity; incremental revenue requires a controlled outcome comparison.',
    'Use one order with several lines and shipment events. Write expected totals before constructing joins, then inspect each consumer result for multiplication. Change one shared definition and trace affected reports. This tests calculation correctness and the ownership of reusable business rules.',
    'Load an interval, rerun it unchanged, then correct one source record. Compare report values with literal expected totals after every step. Inspect the report as well as the warehouse, because relationships, measures, and cached data can preserve an incorrect result.',
    'Compare classification alone with the documented recognition approach on fixed labeled crops. Include similar packaging and products absent from the reference index. Report unknown-product behavior separately. Choose any rejection threshold on development data before evaluating held-out cases.',
    'Separate offline prediction evaluation from a timed audit study. Define workload, correction policy, and completion criteria before timing. Record missed products, wrong identities, correction effort, and elapsed time. The reported 45-to-15-minute outcome remains a project result, not a newly replicated experiment.',
]

def sections(project, suffix):
    source = (ROOT / f'scripts/content/{project}{suffix}.html').read_text()
    return {m.group(1): m.group(0) for m in re.finditer(r'<section id="([^"]+)"[^>]*>.*?</section>', source, re.S)}

def write_article(slug, title, summary, body, project=None):
    desktop, mobile = article_toc(body)
    folder = ROOT / 'blog' / slug
    folder.mkdir(parents=True, exist_ok=True)
    related = ''
    article = head(title, 1).replace('<main id="main">', '<main id="main" class="article-layout">')
    article += desktop + '<div class="article-column"><article><div class="intro article-intro"><a class="back-link" href="../">← All blog posts</a>'
    article += f'<h1>{escape(title)}</h1><p class="lead">{escape(summary)}</p><p class="meta">Theeraphan Sukchok · 9 October 2026 · Engineering research note</p>{related}</div>'
    article += mobile + '<div class="article-body">' + body + '</div></article></div></main><footer><span>© 2026 Theeraphan Sukchok</span><a href="../">All posts</a></footer><script src="../../js/reading-nav.js?v=20261009-research"></script></body></html>'
    (folder / 'index.html').write_text(article)

def build():
    write_article(SLUG, TITLE, 'A literature-informed proposal for authorization, recovery, and evaluation around business agents.', (ROOT / 'scripts/content/harness-blog.html').read_text())
    assert len(TOPICS) == len(TESTS)
    for topic, test in zip(TOPICS, TESTS):
        slug, project, title, summary, research_ids, base_ids = topic
        base, research = sections(project, ''), sections(project, '-research')
        body = '<section id="scope" data-toc="Project and evidence"><h2>Where this question comes from</h2><p>' + escape(BASIS[project]) + '</p><p>This engineering note develops a testable question from my work. It does not report a new experiment or claim a novel algorithm.</p></section>'
        body += ''.join(base[key] for key in base_ids)
        body += ''.join(research[key] for key in research_ids)
        body = re.sub(r'\{\{(?:architecture|detail)\}\}', '', body)
        body += '<section id="next-test" data-toc="A testable next step"><h2>What I would test next</h2><p>' + escape(test) + '</p><p>This is a proposed test, not a completed result. A future report needs its fixtures, baseline, and execution evidence.</p></section>'
        body += research['references']
        write_article(slug, title, summary, body, project)
    catalog = head('Blog') + '<div class="intro"><p class="eyebrow">Blog</p><h1>Research &amp; engineering notes.</h1><p class="lead">Ideas and technical decisions in agent systems, evaluation, data, and computer vision.</p></div><nav class="project-catalog" aria-label="Blog articles">'
    labels = {'agentic-platform': 'Agent systems · Evaluation', 'hermes': 'AI applications · Reliability', 'voc': 'Classification · Retrieval', 'sales-recovery': 'Workflow automation', 'data-platform': 'Data engineering · Analytics', 'visual-recognition': 'Computer vision'}
    for slug, parent, title, summary, *_ in TOPICS:
        catalog += f'<a href="{slug}/"><span class="catalog-number">9 October 2026</span><h2>{escape(title)}</h2><p>{escape(summary)}</p><div class="tags"><span>{labels[parent]}</span></div><span class="catalog-read">Read article →</span></a>'
    catalog += f'<a href="{SLUG}/"><span class="catalog-number">9 October 2026</span><h2>{TITLE}</h2><p>A literature-informed starting point for business-agent reliability.</p><div class="tags"><span>Agent systems · Reliability</span></div><span class="catalog-read">Read article →</span></a></nav></main><footer>© 2026 Theeraphan Sukchok</footer></body></html>'
    (ROOT / 'blog/index.html').write_text(catalog)

if __name__ == '__main__':
    build()
