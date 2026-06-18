const buffer = require("node:buffer");
const webStreams = require("node:stream/web");

globalThis.ReadableStream ||= webStreams.ReadableStream;
globalThis.WritableStream ||= webStreams.WritableStream;
globalThis.TransformStream ||= webStreams.TransformStream;
globalThis.Blob ||= buffer.Blob;

if (!buffer.File) {
  buffer.File = class File extends buffer.Blob {
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

if (!globalThis.File) {
  globalThis.File = buffer.File;
}

import("./index.js").catch((error) => {
  console.error(error);
  process.exit(1);
});
