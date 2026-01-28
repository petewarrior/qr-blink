import QrScanner from '/vendor/qr-scanner.min.js';
import { bufferToHex, bytesInt32ToNumber, CHUNK_SIZE } from './helper.js';


const power = document.getElementById('switch');
const chunks = document.getElementById('chunks');
const videoElem = document.getElementById('videoEl');
const resultElem = document.getElementById('result');

let hash = null;

let fileSize = 0;

let started = false;

let result;

power.addEventListener('click', () => {
    if (!started) {
        qrScanner.start();
        started = true;
    } else {
        qrScanner.stop();
        started = false;
    }
});

const qrScanner = new QrScanner(
    videoElem,
    res => {
        console.log('result', res);

        const chunk = res.binaryData;
        if (chunks.children.length == 0) {
            // get chunk count
            const chunkCount = bytesInt32ToNumber(chunk.subarray(4, 8));
            for (let i = 0; i < chunkCount; i++) {
                const child = document.createElement('div')
                child.classList.add('chunk');
                chunks.appendChild(child);
            }
            // get size
            fileSize = bytesInt32ToNumber(chunk.subarray(28, 32));
            result = new Uint8ClampedArray(fileSize);
            // get hash
            const hashArray = chunk.subarray(8, 28);
            hash = bufferToHex(hashArray);
        }

        // get chunk index
        const index = bytesInt32ToNumber(chunk.subarray(0, 4));
        console.log('index', index);
        const chunkEl = chunks.children.item(index);
        chunkEl.classList.add('received');

        const content = chunk.subarray(32);
        const offset = index * CHUNK_SIZE;
        const remainingBytes = result.length - offset;
        const bytesToWrite = Math.min(content.length, remainingBytes);
        result.set(content.subarray(0, bytesToWrite), offset);


        for (let i = 0; i < chunks.children.length; i++) {
            const child = chunks.children.item(i);
            if (!child.classList.contains('received')) {
                return;
            }
        }

        const blob = new Blob([result], { type: 'application/octet-stream' });
        const text = new TextDecoder('utf-8').decode(result);
        resultElem.value = text;

    },
    { highlightScanRegion: true }
);
