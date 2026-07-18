const progress = document.getElementById('scroll-progress');

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
}

window.addEventListener('scroll', updateProgress, { passive: true });
document.getElementById('year').textContent = new Date().getFullYear();
updateProgress();
