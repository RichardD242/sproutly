// Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
function showSlide(idx) {
  slides.forEach((s, i) => s.classList.toggle('active', i === idx));
}
function moveSlide(dir) {
  currentSlide = (currentSlide + dir + slides.length) % slides.length;
  showSlide(currentSlide);
}
setInterval(() => { if (slides.length) moveSlide(1); }, 4000);

// Accordion
document.querySelectorAll('.accordion-item-trigger').forEach(trigger => {
  trigger.addEventListener('click', function() {
    this.parentElement.classList.toggle('open');
  });
});

// Tabs
document.querySelectorAll('.tab-link').forEach(tab => {
  tab.addEventListener('click', function() {
    let idx = +this.dataset.tab;
    document.querySelectorAll('.tab-link').forEach((t,i) => t.classList.toggle('active', i===idx));
    document.querySelectorAll('.w-tab-pane').forEach((p,i) => p.classList.toggle('active', i===idx));
  });
});