export function buildBufferChunk(obj) {
    return Buffer.from(JSON.stringify(obj))
}