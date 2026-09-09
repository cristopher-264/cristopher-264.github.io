// Renders any .pdf-viewer[data-pdf="..."] element on the page as a scrollable
// stack of slide images, using PDF.js (loaded separately via CDN script tag).
(function () {
  if (typeof pdfjsLib === "undefined") return;

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  document.querySelectorAll(".pdf-viewer[data-pdf]").forEach(function (container) {
    var url = container.getAttribute("data-pdf");
    var loading = container.querySelector(".pdf-loading");

    pdfjsLib
      .getDocument(url)
      .promise.then(function (pdf) {
        if (loading) loading.remove();

        function renderPage(pageNum) {
          pdf.getPage(pageNum).then(function (page) {
            var containerWidth = container.clientWidth;
            var unscaledViewport = page.getViewport({ scale: 1 });
            var scale = containerWidth / unscaledViewport.width;
            var viewport = page.getViewport({ scale: scale });

            var canvas = document.createElement("canvas");
            canvas.className = "pdf-page";
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            container.appendChild(canvas);

            var context = canvas.getContext("2d");
            page.render({ canvasContext: context, viewport: viewport });

            if (pageNum < pdf.numPages) renderPage(pageNum + 1);
          });
        }

        renderPage(1);
      })
      .catch(function (err) {
        if (loading) {
          loading.textContent = "Could not load the presentation — use the link below instead.";
        }
        console.error("PDF viewer error:", err);
      });
  });
})();
