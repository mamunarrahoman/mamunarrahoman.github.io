const viewerContainer = document.getElementById("codeViewerContainer");
const fileURL = viewerContainer ? viewerContainer.getAttribute("data-src") : null;

if (fileURL) {
    document.getElementById("sourceUrl").textContent = fileURL;
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
}

function highlight(text) {
    const lines = text.split("\n");
    
    const keywords = [
        "set", "proc", "if", "else", "foreach", "for", "while",
        "module", "endmodule", "assign", "always", "begin", "end",
        "input", "output", "wire", "reg", "logic", "parameter"
    ];

    function processLine(line) {
        let safe = escapeHTML(line);
        let commentStart = safe.length;

        const i1 = safe.indexOf("#");
        const i2 = safe.indexOf("//");
        const i3 = safe.indexOf("--");

        const arr = [i1, i2, i3].filter(i => i !== -1);

        if (arr.length > 0) {
            commentStart = Math.min(...arr);
        }

        let code = safe.substring(0, commentStart);
        let comment = safe.substring(commentStart);

        keywords.forEach(k => {
            const r = new RegExp("\\b" + k + "\\b", "g");
            code = code.replace(r, `<span class="kw">${k}</span>`);
        });

        if (commentStart !== safe.length) {
            comment = `<span class="com">${comment}</span>`;
        } else {
            comment = "";
        }

        return code + comment;
    }

    return lines.map(processLine).join("\n");
}

async function loadFile() {
    const contentEl = document.getElementById("content");
    const statusEl = document.getElementById("status");

    if (!fileURL) {
        if (contentEl) contentEl.textContent = "Error: No source file provided in data-src attribute.";
        if (statusEl) statusEl.textContent = "Failed";
        return;
    }

    try {
        if (statusEl) statusEl.textContent = "Loading source file...";

        const res = await fetch(fileURL);
        if (!res.ok) throw new Error("Network response was not ok");
        
        const text = await res.text();

        if (contentEl) contentEl.innerHTML = highlight(text);
        if (statusEl) statusEl.textContent = "Loaded successfully";
    } catch (e) {
        if (contentEl) contentEl.textContent = "Error loading file. Please verify the URL or network connection.";
        if (statusEl) statusEl.textContent = "Failed to load";
    }
}

loadFile();