// src/fileHandler.js
// Universal file handling for all 991 tools.
// Version: 0.9

export const FILE_HANDLER_VERSION = '0.9';

/**
 * Read a File as Uint8Array.
 */
export async function readFileAsBytes(file) {
    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
}

/**
 * Read a File as plain text.
 */
export async function readFileAsText(file) {
    return await file.text();
}

/**
 * Read multiple files as { name, file, data } records.
 */
export async function readFilesAsBuffers(fileList) {
    const results = [];
    for (const file of fileList) {
        const buffer = await file.arrayBuffer();
        results.push({ name: file.name, file, data: new Uint8Array(buffer) });
    }
    return results;
}

/**
 * Trigger a Blob download.
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Download binary data with a MIME type.
 */
export function downloadBytes(data, filename, mimeType = 'application/octet-stream') {
    const blob = new Blob([data], { type: mimeType });
    downloadBlob(blob, filename);
}

/**
 * Download a Uint8Array as a PDF file.
 */
export function downloadPdf(data, filename = 'document.pdf') {
    downloadBytes(data, filename, 'application/pdf');
}

/**
 * Convert a Blob to a File.
 */
export function blobToFile(blob, name, type) {
    return new File([blob], name, { type });
}

/**
 * Compare two File objects by name + size + lastModified.
 */
export function isSameFile(a, b) {
    return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

/**
 * Deduplicate an array of Files.
 */
export function dedupeFiles(files) {
    const seen = new Set();
    const result = [];
    for (const f of files) {
        const key = `${f.name}::${f.size}::${f.lastModified}`;
        if (!seen.has(key)) {
            seen.add(key);
            result.push(f);
        }
    }
    return result;
}

/**
 * Format a byte count as a human-readable string.
 */
export function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
}

/**
 * Open a native file picker and return the selected files.
 */
export function pickFiles(accept = '*/*', multiple = false) {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.multiple = multiple;
        input.style.display = 'none';
        document.body.appendChild(input);
        input.addEventListener('change', () => {
            const files = Array.from(input.files || []);
            input.remove();
            resolve(files);
        });
        input.click();
    });
}

/**
 * Move an item in an array from index `from` to index `to`.
 * Returns a new array.
 */
export function moveArrayItem(arr, from, to) {
    if (from === to) return arr.slice();
    if (from < 0 || from >= arr.length) return arr.slice();
    if (to < 0 || to >= arr.length) return arr.slice();
    const copy = arr.slice();
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
}