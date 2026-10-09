const progress = document.getElementById('scroll-progress');

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
}

window.addEventListener('scroll', updateProgress, { passive: true });
document.getElementById('year').textContent = new Date().getFullYear();
updateProgress();

const projectLinks = [...document.querySelectorAll('[data-project-link]')];
const projectSections = projectLinks
  .map((link) => document.getElementById(link.dataset.projectLink))
  .filter(Boolean);

if ('IntersectionObserver' in window && projectSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    projectLinks.forEach((link) => {
      const active = link.dataset.projectLink === visible.target.id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: [0, .15, .4] });

  projectSections.forEach((section) => sectionObserver.observe(section));
}

// Both complete flows remain readable until the interactive controls initialize.
const hermesDiagram = document.querySelector('.hermes-interactive');
if (hermesDiagram) {
  const modes = [...hermesDiagram.querySelectorAll('[data-hermes-mode]')];
  const flows = [...hermesDiagram.querySelectorAll('[data-hermes-flow]')];
  const nodes = [...hermesDiagram.querySelectorAll('[data-hermes-node]')];
  const connections = [...hermesDiagram.querySelectorAll('[data-hermes-connect]')];

  function showHermesMode(mode) {
    flows.forEach((flow) => { flow.hidden = flow.dataset.hermesFlow !== mode; });
    modes.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.hermesMode === mode));
    });
    nodes.forEach((node) => {
      node.setAttribute('aria-expanded', 'false');
      document.getElementById(node.getAttribute('aria-controls')).hidden = true;
      node.querySelector('.hermes-node-action').textContent = 'Explore component +';
    });
    connections.forEach((connection) => connection.classList.remove('is-connected'));
    hermesDiagram.querySelector('.hermes-mode-status').textContent =
      mode === 'build' ? 'Agent building flow shown.' : 'Request execution flow shown.';
  }

  modes.forEach((button) => button.addEventListener('click', () => showHermesMode(button.dataset.hermesMode)));
  nodes.forEach((node) => {
    node.disabled = false;
    node.addEventListener('click', () => {
      const expand = node.getAttribute('aria-expanded') !== 'true';
      nodes.forEach((other) => {
        const selected = other === node && expand;
        other.setAttribute('aria-expanded', String(selected));
        document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
        other.querySelector('.hermes-node-action').textContent = selected ? 'Close details −' : 'Explore component +';
      });
      connections.forEach((connection) => connection.classList.toggle('is-connected',
        expand && connection.dataset.hermesConnect.split(' ').includes(node.dataset.hermesNode)));
    });
  });
  showHermesMode('execute');
  hermesDiagram.classList.add('is-enhanced');
  ['.hermes-mode-controls', '.hermes-interaction-help', '.hermes-mode-status'].forEach((selector) => {
    hermesDiagram.querySelector(selector).hidden = false;
  });
}
