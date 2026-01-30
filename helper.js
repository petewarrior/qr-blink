// Helper function to convert an ArrayBuffer to a hexadecimal string
export function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * 
 * @param {Uint32Array} bytes 
 * @returns 
 */
export function bytesInt32ToNumber(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return view.getUint32(0, false);
}

export function numberToBytesInt32(num) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, num, false);
    return new Uint8ClampedArray(buffer);
}

export function numberToBytesUint16(num) {
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer);
    view.setUint16(0, num, false); // big-endian
    return new Uint8ClampedArray(buffer);
}

export function bytesToNumberUint16(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return view.getUint16(0, false);
}

export const CHUNK_SIZE = 128;
export const DISPLAY_DURATION = 100;