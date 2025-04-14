// devtools.js – Full Readable Version (v1.5.3)

(function () {
    if (window.__devToolsInjected) return;
    window.__devToolsInjected = true;
  
    function getContrast(fg, bg) {
      const luminance = hex => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        const rgb = [r, g, b].map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      };
      return (luminance(fg) + 0.05) / (luminance(bg) + 0.05);
    }
  
    function checkContrast(el) {
      const style = window.getComputedStyle(el);
      const fg = style.color;
      const bg = style.backgroundColor;
      const [c1, c2] = [fg, bg].map(c => {
        const rgb = c.match(/\d+/g).map(Number);
        return "#" + rgb.slice(0, 3).map(v => v.toString(16).padStart(2, "0")).join("");
      });
      if (c1 && c2) {
        const cr = getContrast(c1, c2);
        if (cr < 4.5) {
          console.warn("❗ Low contrast:", el, "CR:", cr.toFixed(2), c1, "on", c2);
        }
      }
    }
  
    // CSS Injection
    const style = document.createElement("style");
    style.textContent = `
      .dev-toolbar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 99999;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 6px 10px;
        font-family: sans-serif;
        font-size: 14px;
        display: flex;
        gap: 1rem;
        align-items: center;
        transition: transform 0.4s ease;
      }
      .dev-toolbar.hidden {
        transform: translateY(100%);
      }
      .dev-toolbar label {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .dev-toolbar button {
        background: none;
        border: 1px solid white;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        cursor: pointer;
      }
      .dev-toolbar button:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .dev-toolbar input[type="checkbox"] {
        box-sizing: border-box;
        width: 18px;
        height: 18px;
        margin: 3px 7px 0 0;
        padding: 0;
        border: 1px solid white;
        appearance: none;
        background-color: transparent;
        outline: none;
        transition: outline 0.1s;
      }
      .dev-toolbar input[type="checkbox"]:checked {
        background-size: 50%;
        background-repeat: no-repeat;
        background-position: center;
        padding: 2px;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 0 32 32" xml:space="preserve"><path style="fill:%23FFF" d="M11.941,28.877l-11.941-11.942l5.695-5.696l6.246,6.246l14.364-14.364L32,8.818"/></svg>');
      }
      .dev-toolbar label:has([disabled]) {
        opacity: 0.55;
      }
      .dev-grid {
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 999;
        opacity: 0.8;
      }
      .dev-grid [class^="container"], .dev-grid .row {
        height: 100%;
      }
      .dev-column {
        background: rgba(21,198,36,0.108);
        position: relative;
      }
      .dev-column::after, .dev-column::before {
        width: 16px;
        height: 100%;
        content: "";
        display: block;
        position: absolute;
        top: 0;
        background: rgba(21,198,36,0.108);
      }
      .dev-column::before {
        left: 0;
        border-left: 1px solid rgba(0,138,12,0.1);
      }
      .dev-column::after {
        right: 0;
        border-right: 1px solid rgba(0,138,12,0.1);
      }
      .dev-column-outline *{outline:1px solid red;}
      .dev-column-outline .dev-toolbar *,
      .dev-column-outline .dev-grid *{outline:none;}
    `;
    document.head.appendChild(style);
  
    const toolbar = document.createElement("div");
    toolbar.className = "dev-toolbar";
    toolbar.innerHTML = `
      <label><input type="checkbox" id="toggleGrid"> Grid</label>
      <label><input type="checkbox" id="toggleFluid" disabled> Container Fluid</label>
      <label><input type="checkbox" id="toggleOutlines"> Outlines</label>
      <button id="clearStorage">Clear Storage</button>
      <button id="a11yCheck">Accessibility Helpers (console)</button>
    `;
    document.body.appendChild(toolbar);
  
    const grid = document.createElement("div");
    grid.className = "dev-grid";
    grid.style.display = "none";
    grid.innerHTML = '<div class="container"><div class="row">' + Array.from({ length: 12 }).map(() => '<div class="col dev-column"></div>').join("") + '</div></div>';
    document.body.appendChild(grid);
  
    const set = (k, v) => localStorage.setItem(k, v);
    const get = k => localStorage.getItem(k) === "true";
  
    const elG = document.getElementById("toggleGrid");
    const elO = document.getElementById("toggleOutlines");
    const elF = document.getElementById("toggleFluid");
    const container = grid.firstElementChild;
  
    function detectOverflows() {
      const w = document.body.offsetWidth;
      document.querySelectorAll("body *").forEach(el => {
        if (el.getBoundingClientRect().right > w) {
          console.warn("Overflowing element →", el);
        }
      });
    }
  
    elG.addEventListener("change", e => {
      const on = e.target.checked;
      grid.style.display = on ? "block" : "none";
      elF.disabled = !on;
      set("devGrid", on);
    });
  
    elO.addEventListener("change", e => {
      const on = e.target.checked;
      document.body.classList.toggle("dev-column-outline", on);
      set("devOutlines", on);
      if (on) detectOverflows();
    });
  
    elF.addEventListener("change", e => {
      const on = e.target.checked;
      container.classList.toggle("container-fluid", on);
      container.classList.toggle("container", !on);
      set("devFluid", on);
    });
  
    document.getElementById("clearStorage").addEventListener("click", () => {
      localStorage.clear();
      alert("localStorage cleared");
    });
  
    document.getElementById("a11yCheck").addEventListener("click", () => {
      console.log("🔍 Accessibility Helpers");
      let last = 0;
      document.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach(h => {
        const lvl = parseInt(h.tagName[1]);
        console.log(`Heading: <${h.tagName.toLowerCase()}> – ${h.textContent.trim()}`);
        if (lvl - last > 1 && last > 0) console.warn("⚠️ Skipped heading level!");
        last = lvl;
      });
      document.querySelectorAll("[role]").forEach(el => {
        console.log(`ARIA role: <${el.tagName.toLowerCase()}> [role="${el.getAttribute("role")}"]`);
      });
      document.querySelectorAll("img").forEach(el => {
        const alt = el.getAttribute("alt");
        if (alt) console.log("🖼️ IMG alt:", alt);
        else console.warn("❌ Missing alt for image:", el);
      });
      document.querySelectorAll("body *").forEach(el => {
        if (typeof el.innerText === "string" && el.innerText.trim()) {
          checkContrast(el);
        }
      });
    });
  
    if (get("devGrid")) {
      elG.checked = true;
      grid.style.display = "block";
      elF.disabled = false;
    }
    if (get("devOutlines")) {
      elO.checked = true;
      document.body.classList.add("dev-column-outline");
      detectOverflows();
    }
    if (get("devFluid")) {
      elF.checked = true;
      container.classList.remove("container");
      container.classList.add("container-fluid");
    }
  
    let scrollY = window.pageYOffset, lock = false;
    window.addEventListener("scroll", () => {
      if (!lock) {
        requestAnimationFrame(() => {
          if (Math.abs(window.pageYOffset - scrollY) >= 5) {
            toolbar.classList.toggle("hidden", window.pageYOffset > scrollY);
            scrollY = window.pageYOffset;
          }
          lock = false;
        });
        lock = true;
      }
    });
  })();  