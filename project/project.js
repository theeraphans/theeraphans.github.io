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
