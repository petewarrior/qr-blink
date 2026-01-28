
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

export const CHUNK_SIZE = 200;