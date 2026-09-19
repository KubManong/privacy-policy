/* 捷待办门户 · 全局交互 */
(function () {
  "use strict";

  /* 标记脚本已运行：style.css 用 .reveal-ready 门控滚动显现的隐藏态，
     本脚本加载失败时（JS 关闭 / 404）内容不会被隐藏 */
  document.documentElement.classList.add("reveal-ready");

  var reducedMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReduced = reducedMQ.matches;
  /* 会话中途修改系统"减弱动态效果"也能即时生效：
     各事件处理器都在触发时读取该变量，这里只需保持它同步 */
  if (typeof reducedMQ.addEventListener === "function") {
    reducedMQ.addEventListener("change", function (e) { prefersReduced = e.matches; });
  }

  /* ---------- 主题：按时间自动切换明暗，可手动修改 ---------- */
  var themeBtns = document.querySelectorAll("[data-theme-toggle]");
  var SUN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>';
  var MOON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 14.2A8.8 8.8 0 0 1 9.8 3.4a8.8 8.8 0 1 0 10.8 10.8Z"/></svg>';
  var AUTO = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none"/></svg>';

  var THEME_KEY = "qt-theme";
  /* 判定规则与各页面 @sync:theme-boot 内联引导脚本保持一致（该脚本用于首帧防闪白） */
  var DAY_START_HOUR = 6;    /* 6:00 起为白天 */
  var NIGHT_START_HOUR = 18; /* 18:00 起为夜间 */

  /* mode：auto=按时间自动 / light、dark=手动锁定 */
  var memMode = null; /* localStorage 不可用时的内存兜底 */
  function getMode() {
    try {
      var v = localStorage.getItem(THEME_KEY);
      if (v === "auto" || v === "light" || v === "dark") return v;
    } catch (e) { /* 隐私模式 */ }
    return memMode || "auto";
  }
  function setMode(mode) {
    memMode = mode;
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* 隐私模式 */ }
  }
  function themeByTime() {
    var h = new Date().getHours();
    return h >= DAY_START_HOUR && h < NIGHT_START_HOUR ? "light" : "dark";
  }
  function effectiveTheme(mode) {
    return mode === "auto" ? themeByTime() : mode;
  }

  /* ?theme=dark|light 仅预览用，不覆盖本地偏好 */
  var urlTheme = (location.search.match(/[?&]theme=(dark|light)/) || [])[1];

  /* 用户一旦手动切换，URL 预览参数即失效：否则 renderTheme 始终被它压住，
     按钮点了没有反应，却还会弹"已切换"的误导提示 */
  function dropUrlTheme() {
    if (!urlTheme) return;
    urlTheme = null;
    try {
      var kept = [];
      location.search.replace(/^\?/, "").split("&").forEach(function (kv) {
        if (kv && !/^theme=(dark|light)$/.test(kv)) kept.push(kv);
      });
      var search = kept.length ? "?" + kept.join("&") : "";
      history.replaceState(null, "", location.pathname + search + location.hash);
    } catch (e) { /* file:// 等场景 replaceState 可能被拒：丢弃内存值即可 */ }
  }

  function renderTheme() {
    var mode = getMode();
    var theme = urlTheme || effectiveTheme(mode);
    document.documentElement.setAttribute("data-theme", theme);
    /* 图标示意"点击后将进入的模式"：自动→反向手动；手动=时间主题→恢复自动；否则→时间主题 */
    var timeTheme = themeByTime();
    var next = mode === "auto" ? (theme === "dark" ? "light" : "dark")
             : mode === timeTheme ? "auto" : timeTheme;
    var stateText = mode === "auto" ? "自动·" + (theme === "dark" ? "夜间" : "白天")
                  : mode === "dark" ? "手动·夜间" : "手动·白天";
    themeBtns.forEach(function (b) {
      b.innerHTML = next === "auto" ? AUTO : next === "dark" ? MOON : SUN;
      var label = "切换明暗主题（当前：" + stateText + "）";
      b.setAttribute("aria-label", label);
      b.title = label;
    });
    /* 浏览器主题色随实际主题同步 */
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
      m.setAttribute("content", theme === "dark" ? "#161618" : "#f7f7f8");
    });
  }
  renderTheme();

  themeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      dropUrlTheme();
      var mode = getMode();
      if (mode === "auto") {
        mode = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      } else if (mode === themeByTime()) {
        mode = "auto"; /* 手动模式与时间主题一致时，点击恢复自动 */
      } else {
        mode = themeByTime(); /* 手动反主题时，点击切到另一手动档 */
      }
      setMode(mode);
      renderTheme();
      if (window.qtToast) {
        window.qtToast(mode === "auto" ? "已恢复按时间自动切换"
          : mode === "dark" ? "已切换为夜间模式" : "已切换为白天模式");
      }
    });
  });

  /* 页面常开时，到 6:00 / 18:00 自动切换（仅自动模式；手动偏好不被覆盖） */
  var lastTimeTheme = themeByTime();
  setInterval(function () {
    if (getMode() !== "auto" || urlTheme) return; /* 预览参数固定主题时不做假切换 */
    var t = themeByTime();
    if (t !== lastTimeTheme) {
      lastTimeTheme = t;
      renderTheme();
      if (window.qtToast) {
        window.qtToast("已按时间自动切换为" + (t === "dark" ? "夜间" : "白天") + "模式");
      }
    }
  }, 30000);

  /* ---------- 菜单栏时钟（待办应用的时间感） ---------- */
  var clockEls = document.querySelectorAll("[data-clock]");
  if (clockEls.length) {
    var WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    var tick = function () {
      var d = new Date();
      var text =
        d.getMonth() + 1 + "月" + d.getDate() + "日 " + WEEK[d.getDay()] +
        ' <span>' + pad(d.getHours()) + ":" + pad(d.getMinutes()) + '</span><span class="sec">:' + pad(d.getSeconds()) + "</span>";
      clockEls.forEach(function (el) { el.innerHTML = text; });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 移动端菜单 ---------- */
  var menuBtn = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (menuBtn && mobileNav) {
    /* 所有关闭路径都必须复位 aria-expanded，否则读屏用户会被告知菜单仍处于展开状态 */
    var closeMenu = function () {
      mobileNav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    };
    menuBtn.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("click", function (e) {
      if (!mobileNav.contains(e.target) && !menuBtn.contains(e.target)) {
        closeMenu();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !mobileNav.classList.contains("open")) return;
      var inMenu = mobileNav.contains(document.activeElement);
      closeMenu();
      if (inMenu) menuBtn.focus(); /* 焦点原在菜单内时还给开合按钮 */
    });
  }

  /* ---------- 滚动显现 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });

    /* 兜底：锚点直达/观察器失效时，视口内及以上的元素直接显形 */
    var forceReveal = function () {
      revealEls.forEach(function (el) {
        if (el.classList.contains("in")) return;
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.15) el.classList.add("in");
      });
    };
    setTimeout(forceReveal, 350);
    setTimeout(forceReveal, 1200);
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Hero 视差 ---------- */
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    var hero = document.querySelector("[data-parallax]");
    if (hero) {
      var demo = hero.querySelector(".demo-window");
      var blobs = document.querySelectorAll(".blob");
      var raf = null;
      hero.addEventListener("pointermove", function (e) {
        if (prefersReduced || raf) return; /* 加载后才开启"减弱动态"也能立即停用视差 */
        raf = requestAnimationFrame(function () {
          var rect = hero.getBoundingClientRect();
          var px = (e.clientX - rect.left) / rect.width - 0.5;
          var py = (e.clientY - rect.top) / rect.height - 0.5;
          if (demo) {
            demo.style.setProperty("--tilt-y", (px * 3.2).toFixed(2) + "deg");
            demo.style.setProperty("--tilt-x", (-py * 2.6).toFixed(2) + "deg");
          }
          blobs.forEach(function (b, i) {
            var depth = (i + 1) * 7;
            b.style.marginLeft = (-px * depth).toFixed(1) + "px";
            b.style.marginTop = (-py * depth).toFixed(1) + "px";
          });
          raf = null;
        });
      });
      hero.addEventListener("pointerleave", function () {
        if (demo) {
          demo.style.setProperty("--tilt-y", "0deg");
          demo.style.setProperty("--tilt-x", "0deg");
        }
        blobs.forEach(function (b) { b.style.marginLeft = "0px"; b.style.marginTop = "0px"; });
      });
    }
  }

  /* ---------- 按钮涟漪 ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".btn");
    if (!btn || prefersReduced) return;
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var span = document.createElement("span");
    span.className = "ripple";
    span.style.width = span.style.height = size + "px";
    span.style.left = e.clientX - rect.left - size / 2 + "px";
    span.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(span);
    setTimeout(function () { span.remove(); }, 700);
  });

  /* ---------- Toast ---------- */
  var toastEl = null, toastTimer = null;
  window.qtToast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<span class="t-dot"></span>' + msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2800);
  };

  /* ---------- 下载按钮（未配置真实链接时） ---------- */
  document.querySelectorAll("[data-download]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var href = btn.getAttribute("href");
      if (href && href !== "#") return; /* 真实链接正常下载 */
      e.preventDefault();
      btn.classList.add("is-loading");
      setTimeout(function () {
        btn.classList.remove("is-loading");
        window.qtToast("下载通道即将开放，敬请期待");
      }, 1200);
    });
  });

  /* ---------- 「/」聚焦演示输入框 ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    var active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) return;
    var input = document.querySelector("[data-qt-demo] .demo-input");
    if (input) {
      e.preventDefault();
      input.focus();
      input.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
    }
  });

  /* ---------- 法律文档目录高亮 ---------- */
  var tocLinks = document.querySelectorAll(".doc-toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var heads = document.querySelectorAll(".doc h2[id]");
    var tocIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tocLinks.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    heads.forEach(function (h) { tocIO.observe(h); });
  }
})();
