const BASE_URL = "https://3asq.org";

function parseHTML(htmlString) {
  const parser = new DOMParser();
  return parser.parseFromString(htmlString, "text/html");
}

globalThis.SynthetiqModule = {
  async discoveryHome() {
    const res = await fetchv2(`${BASE_URL}/manga/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = parseHTML(await res.text());

    const items = [];
    doc.querySelectorAll(".page-item-detail, .manga__item").forEach((el) => {
      const link = el.querySelector(".post-title a, h3 a");
      const img = el.querySelector("img");
      if (link) {
        items.push({
          id: link.getAttribute("href"),
          title: link.textContent.trim(),
          cover: img ? (img.getAttribute("data-src") || img.getAttribute("src")) : null
        });
      }
    });

    return [{ id: "latest", title: "Latest Releases", items }];
  },

  async searchResults(query, page = 1) {
    const url = `${BASE_URL}/page/${page}/?s=${encodeURIComponent(query)}&post_type=wp-manga`;
    const res = await fetchv2(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = parseHTML(await res.text());

    const results = [];
    doc.querySelectorAll(".c-tabs-item__content, .search-wrap .row").forEach((el) => {
      const link = el.querySelector(".post-title a, .tab-thumb a");
      const img = el.querySelector("img");
      if (link) {
        results.push({
          id: link.getAttribute("href"),
          title: link.textContent.trim(),
          cover: img ? (img.getAttribute("data-src") || img.getAttribute("src")) : null
        });
      }
    });

    return { items: results, hasMore: results.length > 0 };
  },

  async extractDetails(itemID) {
    const res = await fetchv2(itemID);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = parseHTML(await res.text());

    const title = doc.querySelector(".post-title h1")?.textContent.trim() || "";
    const coverEl = doc.querySelector(".summary_image img");
    const cover = coverEl ? (coverEl.getAttribute("data-src") || coverEl.getAttribute("src")) : null;
    const description = doc.querySelector(".description-summary, .summary__content")?.textContent.trim() || "";
    const author = doc.querySelector(".author-content a")?.textContent.trim() || "Unknown";

    return { id: itemID, title, cover, description, author, status: "Ongoing" };
  },

  async extractChapters(itemID) {
    const res = await fetchv2(itemID);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = parseHTML(await res.text());

    const chapters = [];
    doc.querySelectorAll("li.wp-manga-chapter").forEach((el) => {
      const a = el.querySelector("a");
      if (a) {
        chapters.push({
          id: a.getAttribute("href"),
          title: a.textContent.trim()
        });
      }
    });

    return chapters.reverse();
  },

  async extractImages(chapterID) {
    const res = await fetchv2(chapterID);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = parseHTML(await res.text());

    const images = [];
    doc.querySelectorAll(".reading-content img, .page-break img").forEach((img) => {
      const src = img.getAttribute("data-src") || img.getAttribute("src");
      if (src) images.push(src.trim());
    });

    return images;
  }
};
