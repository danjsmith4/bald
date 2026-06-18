import * as buffer from "node:buffer";

const webStreams = await import("node:stream/web");

if (!globalThis.ReadableStream) {
  globalThis.ReadableStream = webStreams.ReadableStream;
}

if (!globalThis.WritableStream) {
  globalThis.WritableStream = webStreams.WritableStream;
}

if (!globalThis.TransformStream) {
  globalThis.TransformStream = webStreams.TransformStream;
}

if (!globalThis.Blob) {
  globalThis.Blob = buffer.Blob;
}

if (!globalThis.File) {
  globalThis.File = buffer.File ?? class File extends buffer.Blob {
    constructor(fileBits, fileName, options = {}) {
      super(fileBits, options);
      this.name = String(fileName);
      this.lastModified = options.lastModified ?? Date.now();
    }

    get [Symbol.toStringTag]() {
      return "File";
    }
  };
}
