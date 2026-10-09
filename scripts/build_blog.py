"""Generate the public article pages from editable prose sources."""
from html import escape
from project_data import ROOT, PROJECTS, diagram

TAGS = {
    'agentic-platform': ['Agentic AI', 'Evaluation', 'Independent'],
    'voc': ['Customer operations', 'Retrieval', 'Production'],
    'sales-recovery': ['Sales automation', 'Decision workflows'],
    'data-platform': ['Data engineering', 'Power BI'],
    'visual-recognition': ['Computer vision', 'Retail', 'Production'],
    'hermes': ['AI workspace', 'Independent', 'In development'],
}

def tags(project):
    return '<div class="tags">' + ''.join('<span>' + escape(t) + '</span>' for t in TAGS[project['slug']]) + '</div>'

def head(title, depth=0):
    root = '../../' if depth else '../'
    return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)} | Theeraphan Sukchok</title><meta name="description" content="Project notes by Theeraphan Sukchok: AI systems, business workflows, and the engineering behind them."><link rel="stylesheet" href="{root}css/portfolio.css?v=20261009-blog"><link rel="stylesheet" href="{root}css/reading-nav.css"></head><body id="top"><header><a href="{root}" class="brand">TS.</a><nav aria-label="Main"><a href="{root}">About</a><a href="{root}project/">Projects</a><a href="{root}reading/">Reading</a><a href="{root}assets/theeraphan-sukchok-resume.pdf">Résumé ↗</a></nav></header><main id="main">'

def build():
    for index, project in enumerate(PROJECTS):
        slug = project['slug']
        svg = diagram(slug, project['title'], project['nodes'], project['supports'])
        figure = f'<figure><div class="architecture-scroll" tabindex="0" aria-label="Scrollable architecture diagram">{svg}</div><figcaption>A simplified public architecture. Solid arrows show the main flow; dashed arrows show supporting dependencies. <a href="architecture.html">Open diagram ↗</a></figcaption></figure>'
        detail = ''
        if project.get('detail'):
            title = 'Evaluation and version review' if slug == 'agentic-platform' else 'Agent publishing and runtime selection'
            detail_svg = diagram(slug+'-detail', title, project['detail']).replace('viewBox="0 0 860 664"', 'viewBox="0 0 390 664"')
            detail = f'<figure><div class="architecture-scroll detail">{detail_svg}</div><figcaption>{title}.</figcaption></figure>'
        body = (ROOT / 'scripts/content' / (slug + '.html')).read_text().replace('{{architecture}}', figure).replace('{{detail}}', detail)
        content = head(project['title'], 1) + f'<article><div class="intro article-intro"><a class="back-link" href="../">← All project notes</a><h1>{escape(project["title"])}</h1><p class="lead">{escape(project["summary"])}</p><p class="meta">By Theeraphan Sukchok · {escape(project["group"])} · Updated October 2026</p>{tags(project)}</div><div class="article-body">{body}</div></article>'
        next_project = PROJECTS[(index+1) % len(PROJECTS)]
        content += f'<div class="article-next"><span class="eyebrow">Keep reading</span><a href="../{next_project["slug"]}/">{escape(next_project["title"])} →</a><a href="../">All projects</a></div></main><footer><span>© 2026 Theeraphan Sukchok</span><a href="../../">Portfolio</a></footer><script src="../../js/reading-nav.js?v=20261009-blog"></script></body></html>'
        folder = ROOT / 'project' / slug
        (folder / 'index.html').write_text(content)
        standalone = head(project['title'] + ' architecture', 1) + f'<a href="./">← Back to article</a><h1>{escape(project["title"])}</h1>' + figure.replace('<a href="architecture.html">Open diagram ↗</a>', '') + detail + '</main></body></html>'
        (folder / 'architecture.html').write_text(standalone)
    catalog = head('Project notes') + '<div class="intro"><p class="eyebrow">Project notes</p><h1>How I build AI systems.</h1><p class="lead">Stories about the problems, engineering decisions, and practical work behind my projects.</p><p class="muted">Start with the agent platform, explore the customer-service and data work, or read about the retail vision system. Each article explains its implementation status and public scope.</p></div><nav class="project-catalog" aria-label="Project articles">'
    for index, project in enumerate(PROJECTS):
        catalog += f'<a id="{project["id"]}" href="{project["slug"]}/"><span class="catalog-number">{index+1:02d} / {escape(project["group"])}</span><h2>{escape(project["title"])}</h2><p>{escape(project["summary"])}</p>{tags(project)}<span class="catalog-read">Read article →</span></a>'
    catalog += '</nav></main><footer><span>© 2026 Theeraphan Sukchok</span><a href="../">Portfolio</a></footer><script src="../js/reading-nav.js?v=20261009-blog"></script></body></html>'
    (ROOT / 'project/index.html').write_text(catalog)

if __name__ == '__main__':
    build()
