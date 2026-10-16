// ---- Data: replace with your own images (see README) ----
const IMAGES = [
  { id: 10,   title: "Forest light",      category: "Nature" },
  { id: 11,   title: "Quiet shore",       category: "Nature" },
  { id: 15,   title: "River bend",        category: "Nature" },
  { id: 1018, title: "Mountain ridge",    category: "Nature" },
  { id: 1015, title: "Valley river",      category: "Nature" },
  { id: 237,  title: "Black puppy",       category: "Animals" },
  { id: 1025, title: "Pug in a blanket",  category: "Animals" },
  { id: 1074, title: "Lion at rest",      category: "Animals" },
  { id: 1020, title: "Bear in the grass", category: "Animals" },
  { id: 1067, title: "Glass facade",      category: "City" },
  { id: 164,  title: "Street corner",     category: "City" },
  { id: 43,   title: "Old town roofs",    category: "City" },
];

const src = (img, w, h) => `https://picsum.photos/id/${img.id}/${w}/${h}`;

const gallery = document.getElementById("gallery");
const filtersEl = document.getElementById("filters");
const countEl = document.getElementById("count");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCaption = document.getElementById("lbCaption");
const lbCounter = document.getElementById("lbCounter");

let visible = [...IMAGES]; // images matching the current filter
let current = 0;           // index inside `visible`
let lastFocused = null;

// ---- Build gallery ----
IMAGES.forEach((img) => {
  const card = document.createElement("button");
  card.className = "card";
  card.dataset.title = img.title;
  card.dataset.category = img.category;
  card.innerHTML = `<img src="${src(img, 600, 450)}" alt="${img.title}" loading="lazy" />`;
  card.addEventListener("click", () => openLightbox(img));
  gallery.appendChild(card);
});

// ---- Filters ----
const categories = ["All", ...new Set(IMAGES.map((i) => i.category))];
categories.forEach((cat, i) => {
  const b = document.createElement("button");
  b.className = "filter-btn" + (i === 0 ? " active" : "");
  b.textContent = cat;
  b.addEventListener("click", () => applyFilter(cat, b));
  filtersEl.appendChild(b);
});

function applyFilter(cat, btn) {
  filtersEl.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  visible = IMAGES.filter((i) => cat === "All" || i.category === cat);

  gallery.querySelectorAll(".card").forEach((card) => {
    const show = cat === "All" || card.dataset.category === cat;
    card.hidden = !show;
    if (show) { // restart the enter animation
      card.style.animation = "none";
      void card.offsetWidth;
      card.style.animation = "";
    }
  });
  countEl.textContent = `${visible.length} photo${visible.length === 1 ? "" : "s"} in ${cat}`;
}
countEl.textContent = `${IMAGES.length} photos in All`;

// ---- Lightbox ----
function openLightbox(img) {
  lastFocused = document.activeElement;
  current = visible.indexOf(img);
  render(false);
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add("open"));
  document.body.style.overflow = "hidden";
  document.getElementById("lbClose").focus();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
  setTimeout(() => { lightbox.hidden = true; }, 300);
  if (lastFocused) lastFocused.focus();
}

function render(animate = true) {
  const img = visible[current];
  const update = () => {
    lbImg.src = src(img, 1400, 933);
    lbImg.alt = img.title;
    lbCaption.textContent = `${img.title} (${img.category})`;
    lbCounter.textContent = `${current + 1} / ${visible.length}`;
    lbImg.classList.remove("swap");
  };
  if (!animate) return update();
  lbImg.classList.add("swap");
  setTimeout(update, 200);
}

function step(dir) {
  current = (current + dir + visible.length) % visible.length; // wraps around
  render();
}

document.getElementById("lbNext").addEventListener("click", () => step(1));
document.getElementById("lbPrev").addEventListener("click", () => step(-1));
document.getElementById("lbClose").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});

// Touch swipe
let startX = 0;
lightbox.addEventListener("touchstart", (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
});
