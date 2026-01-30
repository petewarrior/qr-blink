import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm';
import { CHUNK_SIZE, numberToBytesInt32, numberToBytesUint16, bufferToHex } from './helper.js';

async function hashArrayBuffer(arrayBuffer) {
  // Use the subtle crypto API to perform a SHA-1 hash
  const hashAsArrayBuffer = await crypto.subtle.digest("SHA-1", arrayBuffer);
  return hashAsArrayBuffer;
}

function getDisplayType(mimeType) {
    if (mimeType.startsWith('text/')) {
        return 0; // Text
    } else if (mimeType.startsWith('image/')) {
        return 1; // Image
    } else {
        return 2; // File
    }
}

const chunkSize = CHUNK_SIZE;
const headerSize = 132;

var canvas = document.getElementById('displayer');

/** @type HTMLInputElement */
const fileInput = document.querySelector("#file");

/** @type Array<Uint8ClampedArray> */
let chunks = [];
let timer = null;

fileInput.addEventListener("input", async () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    chunks = [];

    const file = fileInput.files[0];
    if (!file) {
        return;
    }

    const dataBuffer = await file.arrayBuffer();

    const fileSizeBytes = numberToBytesInt32(dataBuffer.byteLength);
    const hash = await hashArrayBuffer(dataBuffer);
    const chunkCount = Math.ceil(dataBuffer.byteLength / chunkSize);
    const chunkCountBytes = numberToBytesInt32(chunkCount);
    const hashBytes = new Uint8ClampedArray(hash);
    const mimeBytes = new TextEncoder().encode(file.type.padEnd(100, '\0'));


    let chunkId = 0;
    for (let i = 0; i < dataBuffer.byteLength; i += chunkSize) {
        const chunk = new Uint8ClampedArray(headerSize + chunkSize);

        // Header
        chunk.set(numberToBytesInt32(chunkId), 0);
        chunk.set(chunkCountBytes, 4);
        chunk.set(hashBytes, 8);
        chunk.set(fileSizeBytes, 28);
        chunk.set(mimeBytes, 32);

        // Data
        const dataSlice = dataBuffer.slice(i, i + chunkSize);
        chunk.set(new Uint8Array(dataSlice), headerSize);

        chunks.push(chunk);
        chunkId++;
    }

    // Verification log
    const firstChunk = chunks[0];
    const recoveredHash = firstChunk.subarray(8, 28);
    console.log('Hashes match:', bufferToHex(hash), bufferToHex(recoveredHash));

    let counter = 0;
    timer = setInterval(() => {
        const chunkIndex = counter++ % chunkCount;
        QRCode.toCanvas(canvas,
            [{ data: chunks[chunkIndex], mode: 'byte', errorCorrectionLevel: 'M' }],
            { width: 200 },
            function (error) {
                if (error) {
                    console.error(error);
                } else {
                    // console.log(`Displayed chunk ${chunkIndex + 1}/${chunkCount}`);
                }
            });
    }, 500); // Faster interval for quicker scanning
});