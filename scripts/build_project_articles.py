"""Build static project articles from the approved public case-study copy."""
from pathlib import Path
from html import escape
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SOURCE = subprocess.check_output(['git', 'show', 'bfc329d:project/index.html'], cwd=ROOT, text=True)
PROJECTS = [
    dict(slug='agentic-platform', id='platform', title='Agentic AI Platform', group='Independent project', summary='Build agents, connect business tools, and review improvements before publishing a new version.', result='Local implementation · execution and evaluation services',
         nodes=[('Authoring & channels', 'UI / chat service', 'Define capability and receive requests'), ('Agentic core', 'FastAPI / runtime graph', 'Load a version and coordinate execution'), ('MCP tool servers', 'Business-tool interface', 'Run the selected business capability'), ('Execution records', 'FlowRun / Langfuse', 'Inspect outcomes and tool activity'), ('Agent versions', 'PostgreSQL / immutable snapshots', 'Store rules, skills and tool definitions'), ('Evaluation service', 'Golden cases / sandbox runner', 'Measure a selected version separately')],
         supports=[(4, 1), (1, 5)],
         notes=[('Runtime boundary', 'The core creates and runs capabilities. Routers and loaders prepare state before graph execution; graph nodes consume state and return patches.'), ('Tool boundary', 'MCP servers expose business capabilities. The diagram groups individual tools rather than implying every tool is called on every request.'), ('Evaluation boundary', 'Evaluation runs beside execution. Curated cases and recorded tool evidence help distinguish a bad answer from an incorrect action.'), ('Version contract', 'The core and evaluation service share the version under test. Suggested changes require review before creating or promoting a later version.')],
         detail=[('Curated cases', 'Corpus / expected answers', 'Prepare examples with reviewable expectations'), ('Sandbox run', 'Version under test', 'Capture answers and tool-call evidence'), ('Scoring & diagnosis', 'Schema / tools / behavior', 'Locate failures and propose a change'), ('Human review', 'Diff / version promotion', 'Accept or reject the proposed change')]),
    dict(slug='voc', id='voc', title='VOC Inquiry Intelligence', group='Digital Transformation', summary='Turn customer emails and calls into reviewed inquiry data that teams can act on.', result='108 inquiry types · 3,000+ emails and 600+ calls per day',
         nodes=[('Customer messages', 'Email / recorded calls', 'Capture the original customer inquiry'), ('Preparation & analysis', 'Azure OpenAI / orchestration', 'Transcribe calls and classify the message'), ('Review portal', 'Human review', 'Check inquiry type and urgent cases'), ('Business reporting', 'CRM / Power BI', 'Deliver reviewed data to operations'), ('Inquiry definitions', 'LlamaIndex / Milvus', 'Retrieve context for classification'), ('Execution traces', 'LangFuse', 'Inspect the analysis workflow')], supports=[(4, 1), (1, 5)],
         notes=[('Input preparation', 'Email preparation and call transcription create text that the analysis workflow can process. The original message remains the business evidence.'), ('Grounded classification', 'Retrieval supplies inquiry definitions for classification. The taxonomy covers 108 inquiry types; retrieval is context, not a substitute for a correct label.'), ('Human handoff', 'People inspect results in the portal before delivery to CRM and Power BI. Urgent-case review and customer feedback analysis support operational decisions.'), ('Reporting contract', 'Downstream consumers receive reviewed inquiry data. Production accuracy and response-time measurements are not disclosed here.')]),
    dict(slug='sales-recovery', id='sales', title='Autonomous Sales Recovery Agent', group='Digital Transformation', summary='Identify quotations that have not become orders and give sales teams a repeatable follow-up process.', result='Prioritized follow-up · production revenue figures not disclosed',
         nodes=[('Quotations & orders', 'ERP / CRM data', 'Find quotations without a matching order'), ('Recovery decision', 'Rules / heuristic inference', 'Assess value, age and lead-time context'), ('Follow-up workflow', 'Power Automate', 'Trigger business follow-up actions'), ('Sales team', 'Tasks / notifications / email', 'Act on prioritized opportunities'), ('Business context', 'Lead time / follow-up rules', 'Supply context for prioritization'), ('Scheduled processing', 'Airflow', 'Run the monitoring workflow')], supports=[(4, 1), (5, 1)],
         notes=[('Opportunity detection', 'The workflow compares quotations with sales-order information to identify opportunities that still need follow-up.'), ('Decision logic', 'Quotation value and age support prioritization. Business rules and lead-time analysis keep follow-up timing tied to the sales process.'), ('Action handoff', 'Power Automate connects decisions to email, tasks, and notifications. This public diagram does not claim a particular customer-send approval policy.'), ('Outcome boundary', 'The project makes follow-up repeatable. Exact recovered revenue and production conversion figures remain confidential.')]),
    dict(slug='data-platform', id='data', title='Data Platform / Power BI', group='Digital Transformation', summary='Create shared business data models so reporting and automation do not rebuild the same logic.', result='Reusable warehouse models · analytics and automation',
         nodes=[('Business sources', 'Operational datasets', 'Collect data used across reporting teams'), ('Data pipelines', 'Airflow / SQL', 'Schedule extraction and loading'), ('Warehouse models', 'dbt / SQL', 'Transform data into reusable models'), ('Business consumers', 'Power BI / automation', 'Use shared data for reporting and workflows'), ('Pipeline environment', 'Docker', 'Package pipeline dependencies'), ('Model definitions', 'dbt transformations', 'Keep reporting logic in reusable SQL')], supports=[(4, 1), (5, 2)],
         notes=[('Source boundary', 'The public architecture groups business sources because internal system names and connection details are not disclosed.'), ('Pipeline ownership', 'Airflow schedules the data workflow. Docker packages the environment; it is not a separate data-processing stage.'), ('Reusable modeling', 'SQL and dbt establish warehouse models that downstream consumers can reuse instead of rebuilding reporting logic.'), ('Consumer boundary', 'Power BI and automation depend on the shared models. Specific refresh schedules, warehouse vendor, and adoption figures are not claimed here.')]),
    dict(slug='visual-recognition', id='vision', title='Visual Product Recognition & Shelf Analytics', group='Production system', summary='Convert shelf photos into product and availability data, reducing the work needed for a store audit.', result='45 → 15 minutes per store · 750+ SKU classes',
         nodes=[('Shelf photographs', 'Store audit input', 'Capture products in their shelf context'), ('Product detection', 'YOLO', 'Locate products in the photograph'), ('Product recognition', 'CNN / ViT + FAISS / KNN', 'Classify products and compare similar items'), ('Shelf analytics', 'OpenCV / downstream BI', 'Produce product and availability data'), ('Serving layer', 'Flask APIs / Docker', 'Expose the recognition pipeline'), ('Product references', 'SKU classes / similarity index', 'Support recognition across 750+ classes')], supports=[(4, 1), (5, 2)],
         notes=[('Detection first', 'Detection locates products before recognition. This separates the task of finding an item from deciding which SKU it is.'), ('Recognition evidence', 'Classification and similarity search contribute to product recognition. The public description does not specify an unpublished fusion rule or model threshold.'), ('Serving and post-processing', 'Flask APIs expose the pipeline. OpenCV post-processing turns predictions into outputs that downstream analysis can use.'), ('Measured result', 'Audit time fell from 45 to 15 minutes, about 67% less time. The reported recognition accuracy was 90%; detailed evaluation conditions are not public.')]),
    dict(slug='hermes', id='hermes', title='Hermes Enterprise AI Workspace', group='Independent project · in development', summary='Give teams a workspace to configure agents and run conversations without exposing backend credentials.', result='Local portal and backend prototype · enterprise hardening planned',
         nodes=[('Enterprise portal', 'Next.js', 'Configure agents and open conversations'), ('Backend-for-frontend', 'FastAPI / ownership checks', 'Keep credentials server-side and proxy SSE'), ('Agent runtime', 'Hermes API', 'Execute the selected agent team'), ('Conversation context', 'Honcho memory', 'Provide persistent memory context'), ('Portal records', 'SQLite', 'Map users to sessions and agent versions'), ('Knowledge service', 'Optional Cognee / local index', 'Retrieve user-scoped document context')], supports=[(4, 1), (1, 5)],
         notes=[('Credential boundary', 'The browser talks to the FastAPI backend. The backend owns the Hermes credential and checks session ownership before proxying execution.'), ('Streaming contract', 'The backend proxies SSE chat streams from the Hermes runtime. The portal presents conversation and tool activity to the user.'), ('Knowledge boundary', 'When enabled, Cognee uses isolated datasets. Chat retrieval can fall back to a user-scoped local index; document creation and deletion fail explicitly when the service is unavailable.'), ('Current limitations', 'The local setup defaults to mock mode. This page does not claim live multi-user production reliability, enterprise SSO, or completed RBAC hardening.')],
         detail=[('Agent definition', 'Persona / configuration', 'Create a configuration in the workspace'), ('Validation', 'Factory checks', 'Check the configuration before publishing'), ('Published version', 'Version lifecycle', 'Make a version available for selection'), ('Runtime team selection', 'Conversation setup', 'Select agents; publishing does not start chat')]),
]


def diagram(slug, title, nodes, supports=()):
    positions = [(32, 48), (32, 192), (32, 336), (32, 480), (504, 192), (504, 336)]
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 664" role="img" aria-labelledby="{slug}-title {slug}-desc"><title id="{slug}-title">{escape(title)}</title><desc id="{slug}-desc">{escape("Architecture showing " + ", ".join(n[0] for n in nodes) + " and their connections.")}</desc><defs>']
    for name, color in [('arrow', '#656b63'), ('arrow-accent', '#285b40'), ('arrow-link', '#285b40')]:
        parts.append(f'<marker id="{slug}-{name}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="{color}"/></marker>')
    parts.append('</defs><rect width="860" height="664" fill="#faf9f6"/>')
    for i in range(3):
        y = positions[i][1] + 100
        parts.append(f'<path d="M192 {y} V{positions[i+1][1]}" fill="none" stroke="#656b63" stroke-width="1.5" marker-end="url(#{slug}-arrow)"/>')
    for edge_index, (source, target) in enumerate(supports):
        sx, sy = positions[source]
        tx, ty = positions[target]
        sy += 76 if source < 4 else 52
        ty += 40 + 20 * edge_index if target < 4 else 52
        start = sx + 320 if source < 4 else sx
        end = tx if target >= 4 else tx + 320
        if sy == ty:
            path = f'M{start} {sy} H{end}'
        else:
            mid = 408 + edge_index * 24
            direction = 1 if ty > sy else -1
            horizontal = 1 if end > start else -1
            path = f'M{start} {sy} H{mid-horizontal*8} Q{mid} {sy} {mid} {sy+direction*8} V{ty-direction*8} Q{mid} {ty} {mid+horizontal*8} {ty} H{end}'
        parts.append(f'<path d="{path}" fill="none" stroke="#656b63" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#{slug}-arrow)"/>')
    for i, (name, tech, purpose) in enumerate(nodes):
        x, y = positions[i]
        fill, stroke = ('#edf1e9', '#285b40') if i == 1 else ('#ffffff', '#656b63')
        parts.append(f'<g><rect x="{x}" y="{y}" width="320" height="100" rx="6" fill="{fill}" stroke="{stroke}"/><text x="{x+16}" y="{y+28}" font-size="16" font-weight="600" fill="#252925">{escape(name)}</text><text x="{x+16}" y="{y+52}" font-size="11" fill="#285b40">{escape(tech)}</text><text x="{x+16}" y="{y+78}" font-size="11" fill="#656b63">{escape(purpose)}</text></g>')
    parts.append('<path d="M32 612 H824" stroke="#dddfd7"/><text x="32" y="640" font-size="11" fill="#656b63">Solid: primary flow · Dashed: supporting dependency</text></svg>')
    return ''.join(parts)


def article_body(project):
    tag = 'article' if project['id'] in ('voc', 'sales', 'data') else 'section'
    body = re.search(fr'<{tag} id="{project["id"]}">(.*?)</{tag}>', SOURCE, re.S).group(1)
    body = re.sub(r'<p class="eyebrow">.*?</p>', '', body, count=1)
    body = re.sub(r'<h[23]>.*?</h[23]>', '', body, count=1)
    body = re.sub(r'<details>.*?</details>', '', body, flags=re.S)
    body = body.replace('<h3>The problem</h3>', '<h2>The problem</h2>').replace('<h3>What I designed</h3>', '<h2>My contribution</h2>').replace('<h3>What I built</h3>', '<h2>My contribution</h2>').replace("<h3>What I'm building</h3>", '<h2>My contribution</h2>').replace('<h3>What changed</h3>', '<h2>What changed</h2>')
    return body


def head(title, depth=0):
    prefix = '../' if depth else ''
    return f'<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)} | Theeraphan Sukchok</title><meta name="theme-color" content="#faf9f6"><link rel="stylesheet" href="{prefix}stories.css?v=20261009-articles"><link rel="stylesheet" href="{prefix}../css/reading-nav.css"></head><body id="top"><header><a href="{prefix}../" class="brand">TS.</a><nav aria-label="Main"><a href="{prefix}../">Portfolio</a> <a href="{prefix or "./"}">Projects</a></nav></header><main id="main">'


def build():
    for index, project in enumerate(PROJECTS):
        slug = project['slug']
        svg = diagram(slug, project['title'], project['nodes'], project['supports'])
        notes = ''.join(f'<li><h3>{escape(title)}</h3><p>{escape(text)}</p></li>' for title, text in project['notes'])
        extra = ''
        if project.get('detail'):
            title = 'Evaluation and version review' if slug == 'agentic-platform' else 'Agent publishing and runtime selection'
            extra = f'<h3>{title}</h3><div class="architecture-scroll" tabindex="0" aria-label="{title}">{diagram(slug+"-detail", title, project["detail"])}</div>'
        content = head(project['title'], 1) + f'<div class="intro article-intro"><a class="back-link" href="../">← All projects</a><p class="eyebrow">{escape(project["group"])}</p><h1>{escape(project["title"])}</h1><p class="lead">{escape(project["summary"])}</p><p class="article-result">{escape(project["result"])}</p><nav class="article-jump" aria-label="Article sections"><a href="#story">The story</a><a href="#architecture">Architecture</a><a href="#decisions">Technical decisions</a></nav></div><section id="story" data-toc="The story">{article_body(project)}</section><section id="architecture" data-toc="Architecture"><p class="eyebrow">SYSTEM DESIGN</p><h2>How the pieces fit together</h2><p class="muted">A simplified public architecture. Each box has a specific responsibility; internal deployment and confidential business details are omitted.</p><p class="diagram-hint">On small screens, swipe the diagram horizontally.</p><div class="architecture-scroll" tabindex="0" aria-label="Architecture diagram">{svg}</div>{extra}<p><a href="architecture.html">Open the architecture on its own ↗</a></p></section><section id="decisions" data-toc="Technical decisions"><h2>Technical decisions & boundaries</h2><ol class="decision-list">{notes}</ol></section>'
        next_project = PROJECTS[(index+1) % len(PROJECTS)]
        content += f'<div class="article-next"><span class="eyebrow">KEEP READING</span><a href="../{next_project["slug"]}/">{escape(next_project["title"])} →</a><a href="../">All projects</a></div></main><footer>© 2026 Theeraphan Sukchok <a href="../../">Portfolio</a></footer><script src="../stories.js?v=20261009"></script><script src="../../js/reading-nav.js?v=20261009-articles"></script></body></html>'
        folder = ROOT / 'project' / slug
        folder.mkdir(exist_ok=True)
        (folder / 'index.html').write_text(content)
        standalone = f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(project["title"])} architecture</title><style>body{{margin:0;background:#faf9f6;color:#252925;font:15px/1.8 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:24px}}main{{max-width:1000px;margin:auto}}a{{color:#285b40}}svg{{display:block;width:100%;min-width:720px;font-family:inherit}}.figure{{overflow:auto}}h1{{font-size:26px;line-height:1.3}}</style></head><body><main><a href="./">← Back to case study</a><h1>{escape(project["title"])}</h1><p>Simplified public architecture. Dashed connections show supporting dependencies.</p><div class="figure">{svg}</div>{extra.replace("architecture-scroll", "figure")}<p>Internal deployment details are omitted. See the case study for implementation status and limitations.</p></main></body></html>'
        (folder / 'architecture.html').write_text(standalone)
    catalog = head('Projects') + '<div class="intro"><p class="eyebrow">THEERAPHAN SUKCHOK / PROJECT NOTES</p><h1>Things I build.</h1><p class="lead">The problem, the work, and the system behind it.</p><p class="muted">Choose a project for its story and a detailed technical walkthrough. Employer work is described without proprietary details.</p></div><nav class="project-catalog" aria-label="Project articles">'
    for index, project in enumerate(PROJECTS):
        catalog += f'<a id="{project["id"]}" href="{project["slug"]}/"><span class="catalog-number">{index+1:02d}</span><span><small>{escape(project["group"])}</small><h2>{escape(project["title"])}</h2><p>{escape(project["summary"])}</p><span class="catalog-read">Read the case study →</span></span></a>'
    catalog += '</nav></main><footer>© 2026 Theeraphan Sukchok <a href="../">Portfolio</a></footer><script src="../js/reading-nav.js?v=20261009-articles"></script></body></html>'
    (ROOT / 'project/index.html').write_text(catalog)


if __name__ == '__main__':
    build()
