const catalog=JSON.parse(document.getElementById('catalog-data').textContent);
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=i=>i.pages[0].file;
const stamp=i=>Date.parse(i.runAt)||0;
const date=i=>stamp(i)?new Date(stamp(i)).toLocaleDateString('en',{month:'short',day:'numeric'}):'From the archive';
const url=i=>encodeURI(i.pages[0].file);
const thumbnail=i=>i.imageUrl|| (i.videoId?`https://i.ytimg.com/vi/${encodeURIComponent(i.videoId)}/hqdefault.jpg`:'');
let saved=new Set();try{const value=JSON.parse(localStorage.getItem('reading-room-saved')||'[]');if(Array.isArray(value))saved=new Set(value)}catch{}
const state={mode:'all',topic:'All',query:'',sort:'new',limit:12};
$('#total').textContent=catalog.length;$('#collection-note').textContent=`${catalog.length} summaries. A growing collection.`;
const topics=[...new Set(catalog.map(i=>i.category))].sort();
$('#topics').innerHTML=topics.map(t=>`<button class="topic" data-topic="${esc(t)}">${esc(t)}</button>`).join('');
const latest=[...catalog].sort((a,b)=>stamp(b)-stamp(a))[0];
if(latest)$('#featured').innerHTML=`<div class="feature-copy"><span class="feature-label">Fresh from the collection · ${esc(latest.source)}</span><h2><a href="${url(latest)}">${esc(latest.title)}</a></h2><p>${esc(latest.description)}</p><a class="read-link" href="${url(latest)}">Read the summary &nbsp; ↗</a></div><a class="feature-image" href="${url(latest)}" aria-label="${esc(latest.title)}">${thumbnail(latest)?`<img src="${thumbnail(latest)}" alt="" fetchpriority="high">`:''}</a>`;
function render(){
let items=catalog.filter(i=>(state.mode!=='saved'||saved.has(key(i)))&&(state.topic==='All'||i.category===state.topic)&&`${i.title} ${i.description} ${i.source} ${i.category}`.toLowerCase().includes(state.query));
items.sort(state.sort==='title'?(a,b)=>a.title.localeCompare(b.title):state.sort==='old'?(a,b)=>stamp(a)-stamp(b):(a,b)=>stamp(b)-stamp(a));
$('#saved-count').textContent=catalog.filter(i=>saved.has(key(i))).length;
$('#collection-title').textContent=state.mode==='saved'?'Saved for later':'Explore the library';
$('#result-count').textContent=`${items.length} ${items.length===1?'summary':'summaries'}${state.query?' matching your search':' to spark your next idea'}`;
$('#active-topic').textContent=state.topic==='All'?'':state.topic;
$('#featured').hidden=state.mode==='saved'||state.topic!=='All'||!!state.query;
$('#catalog-grid').innerHTML=items.slice(0,state.limit).map(i=>`<article class="summary"><a class="thumbnail" href="${url(i)}" aria-label="Read ${esc(i.title)}">${thumbnail(i)?`<img src="${thumbnail(i)}" alt="" loading="lazy">`:''}</a><div class="summary-meta"><span class="category">${esc(i.category)}</span><button class="save" data-save="${esc(key(i))}" aria-pressed="${saved.has(key(i))}" aria-label="${saved.has(key(i))?'Unsave':'Save'} ${esc(i.title)}">${saved.has(key(i))?'♥':'♡'}</button></div><h3><a href="${url(i)}">${esc(i.title)}</a></h3><p>${esc(i.description)}</p><div class="byline"><span>${esc(i.source)}</span><span>${date(i)}</span></div>${i.pages.length>1?`<div class="byline">${i.pages.map(p=>`<a href="${encodeURI(p.file)}">${esc(p.label)} ↗</a>`).join('')}</div>`:''}</article>`).join('');
$('#empty').hidden=items.length>0;$('#load-more').hidden=items.length<=state.limit;
document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===state.mode);b.setAttribute('aria-pressed',b.dataset.mode===state.mode)});
document.querySelectorAll('[data-topic]').forEach(b=>{b.classList.toggle('active',b.dataset.topic===state.topic);b.setAttribute('aria-pressed',b.dataset.topic===state.topic)});
}
$('#catalog-search').addEventListener('input',e=>{state.query=e.target.value.trim().toLowerCase();state.limit=12;render()});
$('#sort').addEventListener('change',e=>{state.sort=e.target.value;render()});
$('#load-more').addEventListener('click',()=>{state.limit+=12;render()});
$('#clear').addEventListener('click',()=>{Object.assign(state,{topic:'All',query:'',limit:12});$('#catalog-search').value='';render()});
document.addEventListener('click',e=>{const topic=e.target.closest('[data-topic]'),mode=e.target.closest('[data-mode]'),save=e.target.closest('[data-save]');if(topic){state.topic=state.topic===topic.dataset.topic?'All':topic.dataset.topic;state.limit=12;render()}if(mode){state.mode=mode.dataset.mode;state.topic='All';state.limit=12;render()}if(save){const id=save.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);try{localStorage.setItem('reading-room-saved',JSON.stringify([...saved]))}catch{}render();[...document.querySelectorAll('[data-save]')].find(b=>b.dataset.save===id)?.focus()}});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('#catalog-search').focus()}});
document.addEventListener('error',e=>{if(e.target.tagName==='IMG')e.target.style.visibility='hidden'},true);
render();
