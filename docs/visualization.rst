Visualization
=============

Attack Flow offers several tools for visualizing sequences of behaviors. The :doc:`Attack Flow Builder
<builder>` is a great option, offers easy navigation of large flows, and exports to PNG format. We also have
several :ref:`command line visualizations <cli_viz>` as well as some `experimental visualizations
<https://observablehq.com/@mehaase/attack-flow-business>`__.

ATT&CK Navigator
----------------

On this page, you can visualize an Attack Flow drawn on top of an ATT&CK Navigator matrix. First, choose a
Navigator base layer or supply your own. Then upload an Attack Flow. Finally, preview and download the
resulting visualization.

.. raw:: html

    <style>
    #preview {
        border: 1px solid black;
        background-color: white;
        height: 30rem;
        position: relative;
        overflow: scroll;
    }

    #preview button {
        position: absolute;
        bottom: 5px;
        right: 5px;
    }

    #preview p {
        color: #bebebe;
        margin-top: 14em;
        text-align: center;
    }

    #preview svg {
        display: block;
        width: 100%;
        height: auto;
    }

    @media all and (display-mode: fullscreen) {
        #preview svg {
            max-width: 100vw;
            max-height: 100vh;
        }
    }

    #previewError {
        color: var(--me-ext-cranberry-dark);
        background-color: #f3bacf;
        border: 1px solid var(--me-ext-cranberry-dark);
        margin: 1em 0;
        padding: 1em;
        display: none;
    }
    </style>

    <div id="preview">
        <button class="btn btn-secondary btn-sm" onclick="toggleFullscreen()">
            <i class="fa fa-arrows-alt"></i>
            Full Screen
        </button>
        <p>
            Preview: select a Navigator layer and an Attack Flow.
        </p>
    </div>

    <div id="previewError">
        <strong>Error:</strong> <span></span>
    </div>

    <div style="display: flex; margin-top: 1em;">
        <div style="flex-grow: 1;">
            <label for="layerSelect">
                Select or upload base layer:
            </label>
            <select id="layerSelect" onchange="selectBaseLayer(this)">
                <option value=""></option>
                <option value="enterprise-blank">Enterprise Techniques</option>
                <option value="enterprise-subs-blank">Enterprise Techniques and Subtechniques</option>
                <option value="mobile-blank">Mobile Techniques</option>
                <option value="mobile-subs-blank">Mobile Techniques and Subtechniques</option>
                <option value="ics-blank">ICS Techniques</option>
                <option value="upload">Upload (.svg)</option>
            </select>
            <br>
            <input id="baseLayerUpload" type="file" onchange="uploadBaseLayer(this)"
                accept=".svg" style="margin-top: 0.5em; visibility: hidden;">
        </div>
        <div style="flex-grow: 1;">
            <label for="uploadFlow">
                Upload an Attack Flow (*.json):
            </label>
            <input id="uploadFlow" type="file" onchange="uploadAttackFlow(this)" accept=".json">
        </div>
    </div>

    <div style="margin-bottom: 3em;">
        <button class="btn btn-primary" onclick="generatePreview()">
            <i class="fa fa-search"></i>
            Generate Preview
        </button>
        <button id="downloadSvg" class="btn btn-primary" onclick="downloadSvg()" disabled>
            <i class="fa fa-download"></i>
            Download
        </button>
    </div>

    <script src="../matrix/matrix.js"></script>

    <script>
    let layerSrc = null;
    let flowSrc = null;
    let svgSrc = null;

    function selectBaseLayer(el) {
        if (el.value === "upload") {
            document.querySelector("#baseLayerUpload").click();
        } else if (el.value !== "") {
            const url = `../matrix/${el.value}.svg`;
            fetch(url).then((response) => response.text())
            .then((data) => {
                layerSrc = data;
            })
            .catch((err) => showError(`Cannot download base layer: ${url}`));
        }
    }

    function uploadBaseLayer(fileInput) {
        const fr = new FileReader();
        fr.onload = () => layerSrc = fr.result;
        fr.readAsText(fileInput.files[0]);
    }

    function uploadAttackFlow(fileInput) {
        const fr = new FileReader();
        fr.onload = () => flowSrc = fr.result;
        fr.readAsText(fileInput.files[0]);
    }

    function toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.querySelector("#preview").requestFullscreen();
        }
    }

    function generatePreview() {
        if (!layerSrc) {
            showError("Select or upload a base layer before previewing.");
            return;
        }

        if (!flowSrc) {
            showError("Upload an Attack Flow (.json) before previewing.");
            return;
        }

        try {
            for (const el of document.querySelectorAll("#preview svg")) {
                el.remove();
            }
            svgSrc = render(layerSrc, flowSrc);
            const container = document.createElement("div");
            container.innerHTML = svgSrc;
            const svg = container.querySelector("svg");
            const svgWidth = svg.getAttribute("width");
            const svgHeight = svg.getAttribute("height");
            svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
            container.removeChild(svg);
            document.querySelector("#preview").appendChild(svg);
            document.querySelector("#preview p").style.display = "none";
            document.querySelector("#downloadSvg").disabled = false;
            hideError();
        } catch (e) {
            showError(`Cannot generate preview: ${e}`);
            throw e;
        }
    }

    function downloadSvg() {
        const file = document.querySelector("#uploadFlow").files[0];
        const fileName = file.name.replace(".json", ".svg");
        let data = '<?xml version="1.0" standalone="no"?>\n';
        data += svgSrc;
        const blob = new Blob([data], {type:"image/svg+xml"});
        const anchor = document.createElement("a");
        anchor.download = fileName;
        anchor.href = URL.createObjectURL(blob);
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        setTimeout(function () {
            document.body.removeChild(anchor);
            URL.revokeObjectURL(anchor.href);
        }, 500);
    }

    function showError(txt) {
        const errorDiv = document.querySelector("#previewError");
        const errorSpan = errorDiv.querySelector("span");
        errorSpan.innerText = txt;
        errorDiv.style.display = "block";
    }

    function hideError() {
        document.querySelector("#previewError").style.display = "none";
    }
    </script>
