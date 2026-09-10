// Renders any .pdf-viewer[data-pdf="..."] element as a one-slide-at-a-time
// viewer with Prev/Next controls, using PDF.js (loaded via CDN script tag).
//
// - Renders at the device pixel ratio so slides are crisp on retina screens
// - Re-renders when the container is resized
// - Keyboard (arrow keys, Home/End) and touch-swipe navigation
// - Shows download progress while the deck loads
(function () {
  if (typeof pdfjsLib === "undefined") return;

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  document.querySelectorAll(".pdf-viewer[data-pdf]").forEach(function (container) {
    var url = container.getAttribute("data-pdf");
    var loading = container.querySelector(".pdf-loading");
    var loadingText = loading ? loading.textContent : "Loading slides…";

    var pdfDoc = null;
    var currentPage = 1;
    var rendering = false;
    var pendingPage = null;
    var stage, canvas, counter, prevBtn, nextBtn;

    function iconSvg(path) {
      return (
        '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="' +
        path +
        '" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      );
    }

    function buildUI() {
      container.innerHTML = "";

      stage = document.createElement("div");
      stage.className = "pdf-stage";
      canvas = document.createElement("canvas");
      canvas.className = "pdf-page";
      stage.appendChild(canvas);
      container.appendChild(stage);

      var controls = document.createElement("div");
      controls.className = "pdf-controls";

      prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "pdf-nav-btn";
      prevBtn.setAttribute("aria-label", "Previous slide");
      prevBtn.innerHTML = iconSvg("M10 3 5 8l5 5");

      counter = document.createElement("span");
      counter.className = "pdf-counter";
      counter.setAttribute("aria-live", "polite");

      nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "pdf-nav-btn";
      nextBtn.setAttribute("aria-label", "Next slide");
      nextBtn.innerHTML = iconSvg("M6 3l5 5-5 5");

      controls.appendChild(prevBtn);
      controls.appendChild(counter);
      controls.appendChild(nextBtn);
      container.appendChild(controls);

      prevBtn.addEventListener("click", function () { goToPage(currentPage - 1); });
      nextBtn.addEventListener("click", function () { goToPage(currentPage + 1); });

      container.setAttribute("tabindex", "0");
      container.setAttribute("role", "region");
      container.setAttribute("aria-label", "Slide deck");
      container.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { e.preventDefault(); goToPage(currentPage - 1); }
        else if (e.key === "ArrowRight") { e.preventDefault(); goToPage(currentPage + 1); }
        else if (e.key === "Home") { e.preventDefault(); goToPage(1); }
        else if (e.key === "End") { e.preventDefault(); goToPage(pdfDoc.numPages); }
      });

      // Touch swipe
      var touchStartX = null;
      stage.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });
      stage.addEventListener("touchend", function (e) {
        if (touchStartX === null) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(dx) < 40) return;
        goToPage(dx < 0 ? currentPage + 1 : currentPage - 1);
      }, { passive: true });

      // Re-render on resize (debounced)
      var resizeTimer = null;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { queueRender(currentPage); }, 150);
      });
    }

    function goToPage(num) {
      if (!pdfDoc) return;
      if (num < 1 || num > pdfDoc.numPages) return;
      currentPage = num;
      queueRender(num);
    }

    function queueRender(num) {
      if (rendering) { pendingPage = num; return; }
      renderPage(num);
    }

    function renderPage(num) {
      rendering = true;
      pdfDoc.getPage(num).then(function (page) {
        var dpr = window.devicePixelRatio || 1;
        var containerWidth = stage.clientWidth || container.clientWidth;
        var unscaledViewport = page.getViewport({ scale: 1 });
        var cssScale = containerWidth / unscaledViewport.width;
        var viewport = page.getViewport({ scale: cssScale * dpr });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = containerWidth + "px";
        canvas.style.height = Math.floor(viewport.height / dpr) + "px";

        var context = canvas.getContext("2d");
        return page.render({ canvasContext: context, viewport: viewport }).promise;
      }).then(function () {
        rendering = false;
        updateControls();
        if (pendingPage !== null) {
          var next = pendingPage;
          pendingPage = null;
          renderPage(next);
        }
      }).catch(function (err) {
        rendering = false;
        console.error("PDF render error:", err);
      });
    }

    function updateControls() {
      counter.textContent = currentPage + " / " + pdfDoc.numPages;
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage === pdfDoc.numPages;
    }

    var task = pdfjsLib.getDocument(url);
    task.onProgress = function (p) {
      if (loading && p.total) {
        loading.textContent = loadingText + " " + Math.round((p.loaded / p.total) * 100) + "%";
      }
    };
    task.promise.then(function (pdf) {
      pdfDoc = pdf;
      buildUI();
      renderPage(1);
    }).catch(function (err) {
      if (loading) {
        loading.textContent = "Could not load the presentation — use the link below instead.";
      }
      console.error("PDF viewer error:", err);
    });
  });
})();
