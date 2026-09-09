// Renders any .pdf-viewer[data-pdf="..."] element as a one-slide-at-a-time
// viewer with Prev/Next controls, using PDF.js (loaded via CDN script tag).
(function () {
  if (typeof pdfjsLib === "undefined") return;

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  document.querySelectorAll(".pdf-viewer[data-pdf]").forEach(function (container) {
    var url = container.getAttribute("data-pdf");
    var loading = container.querySelector(".pdf-loading");

    var pdfDoc = null;
    var currentPage = 1;
    var rendering = false;
    var stage, canvas, counter, prevBtn, nextBtn;

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
      prevBtn.innerHTML =
        '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      counter = document.createElement("span");
      counter.className = "pdf-counter";

      nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "pdf-nav-btn";
      nextBtn.setAttribute("aria-label", "Next slide");
      nextBtn.innerHTML =
        '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      controls.appendChild(prevBtn);
      controls.appendChild(counter);
      controls.appendChild(nextBtn);
      container.appendChild(controls);

      prevBtn.addEventListener("click", function () {
        goToPage(currentPage - 1);
      });
      nextBtn.addEventListener("click", function () {
        goToPage(currentPage + 1);
      });

      container.setAttribute("tabindex", "0");
      container.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") goToPage(currentPage - 1);
        if (e.key === "ArrowRight") goToPage(currentPage + 1);
      });
    }

    function goToPage(num) {
      if (!pdfDoc || rendering) return;
      if (num < 1 || num > pdfDoc.numPages) return;
      currentPage = num;
      renderCurrentPage();
    }

    function renderCurrentPage() {
      rendering = true;
      pdfDoc.getPage(currentPage).then(function (page) {
        var containerWidth = stage.clientWidth;
        var unscaledViewport = page.getViewport({ scale: 1 });
        var scale = containerWidth / unscaledViewport.width;
        var viewport = page.getViewport({ scale: scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        var context = canvas.getContext("2d");
        page.render({ canvasContext: context, viewport: viewport }).promise.then(
          function () {
            rendering = false;
          }
        );

        counter.textContent = currentPage + " / " + pdfDoc.numPages;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === pdfDoc.numPages;
      });
    }

    pdfjsLib
      .getDocument(url)
      .promise.then(function (pdf) {
        pdfDoc = pdf;
        buildUI();
        renderCurrentPage();
      })
      .catch(function (err) {
        if (loading) {
          loading.textContent = "Could not load the presentation — use the link below instead.";
        }
        console.error("PDF viewer error:", err);
      });
  });
})();
