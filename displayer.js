import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm';
import { CHUNK_SIZE } from './helper.js';

async function hashArrayBuffer(arrayBuffer) {
  // Use the subtle crypto API to perform a SHA-256 hash
  // The result is an ArrayBuffer containing the hash bytes
  const hashAsArrayBuffer = await crypto.subtle.digest("SHA-1", arrayBuffer);

  return hashAsArrayBuffer;

  // Convert the hash ArrayBuffer into a usable format (e.g., hexadecimal string)
  // const hashAsString = bufferToHex(hashAsArrayBuffer);
  // return hashAsString;
}

// Helper function to convert an ArrayBuffer to a hexadecimal string
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function numberToBytesInt32(num) {
  // Create an ArrayBuffer with a size of 4 bytes (32 bits)
  const buffer = new ArrayBuffer(4);
  // Create a DataView to interact with the buffer
  const view = new DataView(buffer);

  // Write the number as a 32-bit unsigned integer at byte offset 0, big-endian (false)
  view.setUint32(0, num, false); // 'false' specifies big-endian; 'true' would be little-endian

  // Return a Uint8Array view of the buffer
  return new Uint8ClampedArray(buffer);
}


const chunkSize = CHUNK_SIZE;

var canvas = document.getElementById('displayer');
var ctx = canvas.getContext('2d');

/** @type HTMLInputElement */
const fileInput = document.querySelector("#file");
const logger = document.querySelector("#log");

/** @type Array<Uint8ClampedArray> */
const chunks = [];

fileInput.addEventListener("input", async () => {
  const file = fileInput.files[0];
  const dataBuffer = await file.stream().getReader().read().then((r) => r.value);

  console.log(file.type, dataBuffer.byteLength);
  const fileSizeBytes = numberToBytesInt32(dataBuffer.byteLength);
  const hash = await hashArrayBuffer(dataBuffer);
  const chunkCount = Math.ceil(dataBuffer.byteLength / chunkSize);
  const chunkCountBytes = numberToBytesInt32(chunkCount);
  const hashBytes = new Uint8ClampedArray(hash);

  console.log(hash, fileSizeBytes, chunkCount);

  let chunkId = 0;
  for (let i = 0; i < dataBuffer.byteLength; i += chunkSize) {
    const chunk = new Uint8ClampedArray(32 + chunkSize);
    const idx = numberToBytesInt32(chunkId);
    chunkId++;
    chunk.set(idx, 0);
    chunk.set(chunkCountBytes, 4);
    chunk.set(hashBytes, 8);
    chunk.set(fileSizeBytes, 28);
    chunk.set(dataBuffer.slice(i, i + chunkSize), 32);
    chunks.push(chunk);
  }

  let chunk = chunks[0];
  const recoveredHash = chunk.subarray(8, 28);
  console.log('hashes match', bufferToHex(hash), bufferToHex(recoveredHash), new Uint8ClampedArray(hash).every((v, i) => v === recoveredHash[i]));

  let counter = 0;

  const timer = setInterval(() => {
    QRCode.toCanvas(canvas,
      [{ data: chunks[counter++ % chunkCount], mode: 'byte', errorCorrectionLevel: 'L' }],
      function (error) {
        if (error) console.error(error)
        console.log('success!');
      });

  }, 4000);
});

