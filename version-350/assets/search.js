import { movies } from "./search-data.js";

var input = document.getElementById("site-search-input");
var button = document.getElementById("site-search-button");
var summary = document.getElementById("search-summary");
var results = document.getElementById("search-results");

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getInitialQuery() {
  var params = new URLSearchParams(window.location.search);
  return params.get("q") || "";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildCard(movie) {
  var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
    return `<span>${escapeHtml(tag)}</span>`;
  }).join("");

  return `
    <article class="movie-card">
      <a class="movie-poster" href="${escapeHtml(movie.url)}">
        <img src="${escapeHtml(movie.image)}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="movie-badge">${escapeHtml(movie.type)}</span>
        <span class="movie-duration">${escapeHtml(movie.duration)}</span>
      </a>
      <div class="movie-body">
        <div class="movie-meta-row">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.categoryName)}</span>
        </div>
        <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.description)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>
  `;
}

function performSearch() {
  var query = normalize(input.value);
  var terms = query.split(/\s+/).filter(Boolean);
  var matched = movies.filter(function (movie) {
    var haystack = normalize([
      movie.title,
      movie.region,
      movie.year,
      movie.type,
      movie.genre,
      movie.categoryName,
      (movie.tags || []).join(" "),
      movie.description
    ].join(" "));

    return terms.every(function (term) {
      return haystack.indexOf(term) !== -1;
    });
  });

  var limited = matched.slice(0, 120);
  results.innerHTML = limited.map(buildCard).join("");

  if (!query) {
    summary.textContent = "展示片库中的热门内容，可输入关键词进一步筛选。";
  } else {
    summary.textContent = "找到 " + matched.length + " 个结果，当前显示前 " + limited.length + " 个。";
  }
}

if (input && button && results) {
  input.value = getInitialQuery();
  button.addEventListener("click", performSearch);
  input.addEventListener("input", performSearch);
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      performSearch();
    }
  });
  performSearch();
}
