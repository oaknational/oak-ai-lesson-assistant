import { webcrypto as crypto } from "node:crypto";

const urlAlphabet: string =
  "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

const POOL_SIZE_MULTIPLIER: number = 128;
let pool: Buffer | undefined;
let poolOffset: number;

function fillPool(bytes: number): void {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    crypto.getRandomValues(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    crypto.getRandomValues(pool);
    poolOffset = 0;
  }
  poolOffset += bytes;
}

export function random(bytes: number): Buffer {
  fillPool(bytes);
  return pool!.subarray(poolOffset - bytes, poolOffset);
}

export function customRandom(
  alphabet: string,
  defaultSize: number,
  getRandom: (bytes: number) => Buffer,
): (size?: number) => string {
  const mask: number = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;
  const step: number = Math.ceil((1.6 * mask * defaultSize) / alphabet.length);

  return (size: number = defaultSize): string => {
    let id: string = "";
    while (true) {
      const bytes: Buffer = getRandom(step);
      let i: number = step;
      while (i--) {
        const b = bytes[i];
        id += (b && alphabet[b & mask]) || "";
        if (id.length === size) return id;
      }
    }
  };
}

export function customAlphabet(
  alphabet: string,
  size: number = 21,
): () => string {
  return customRandom(alphabet, size, random);
}

export function nanoid(size: number = 21): string {
  fillPool(size);
  let id: string = "";
  for (let i: number = poolOffset - size; i < poolOffset; i++) {
    if (pool) {
      const p = pool[i];
      if (p) {
        id += urlAlphabet[p & 63];
      }
    }
  }
  return id;
}
