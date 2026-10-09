(() => {
  const project = Boolean(document.getElementById('platform'));
  const articleSections = Array.from(document.querySelectorAll('[data-toc]')).map(section => [section.id, section.dataset.toc]);
  const items = articleSections.length ? articleSections : project
    ? [['platform', 'Agentic Platform'], ['digital-transformation', 'Digital Transformation'], ['voc', 'VOC'], ['sales', 'Sales recovery'], ['data', 'Data platform'], ['vision', 'Visual recognition'], ['hermes', 'Hermes']]
    : [['featured-work', 'Selected work'], ['about', 'About'], ['experience', 'Experience'], ['education', 'Education'], ['skills', 'Skills'], ['contact', 'Contact']];
  const existingNav = document.querySelector('.article-toc nav');
  const nav = existingNav || document.createElement('nav');
  if (!existingNav) nav.className = 'reading-toc';
  nav.setAttribute('aria-label', 'On this page');
  const label = document.createElement('span');
  label.className = 'reading-toc-label';
  label.textContent = 'ON THIS PAGE';
  if (!existingNav) nav.append(label);
  const sections = items.filter(([id]) => document.getElementById(id)).map(([id, title]) => {
    const link = existingNav ? nav.querySelector(`a[href="#${id}"]`) : document.createElement('a');
    if (!link) return null;
    link.href = `#${id}`;
    link.textContent = title;
    if (!existingNav) nav.append(link);
    return { element: document.getElementById(id), link };
  }).filter(item => item && item.element);
  const up = document.createElement('button');
  up.type = 'button';
  up.className = 'reading-up';
  up.setAttribute('aria-label', 'Back to top');
  up.textContent = '↑';
  up.hidden = true;
  up.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
  if (!existingNav) document.body.append(nav);
  document.body.append(up);
  const update = () => {
    const threshold = window.innerHeight * 0.3;
    let active = null;
    sections.forEach(item => {
      if (item.element.getBoundingClientRect().top <= threshold) active = item;
    });
    sections.forEach(item => {
      if (item === active) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    });
    up.hidden = window.scrollY < window.innerHeight * 0.6;
  };
  let pending = false;
  window.addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { update(); pending = false; });
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
