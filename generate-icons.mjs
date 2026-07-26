import { createWriteStream } from 'fs'
import { deflateSync, crc32 } from 'zlib'

function makePNG(size, r, g, b) {
  // PNG signature
  const sig = Buffer.from([137,80,78,71,13,10,26,10])

  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const crc = Buffer.alloc(4)
    const typeData = Buffer.concat([Buffer.from(type), data])
    const c = deflateSync(typeData).readUInt32BE(0) // placeholder, need real crc32
    // Use Node crc32 via checksums
    const crcVal = crcBuf(Buffer.concat([Buffer.from(type), data]))
    crc.writeInt32BE(crcVal)
    return Buffer.concat([len, Buffer.from(type), data, crc])
  }

  function crcBuf(buf) {
    let c = 0xFFFFFFFF
    for (const byte of buf) {
      c ^= byte
      for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    }
    return (c ^ 0xFFFFFFFF) | 0
  }

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // Raw image data
  const row = Buffer.alloc(1 + size * 3)
  row[0] = 0 // filter none
  for (let x = 0; x < size; x++) {
    row[1 + x*3] = r
    row[1 + x*3 + 1] = g
    row[1 + x*3 + 2] = b
  }
  const rawData = Buffer.concat(Array(size).fill(row))
  const idat = deflateSync(rawData)

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// Green #4caf7d = rgb(76, 175, 125)
const png192 = makePNG(192, 76, 175, 125)
const png512 = makePNG(512, 76, 175, 125)

import { writeFileSync, mkdirSync } from 'fs'
mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', png192)
writeFileSync('public/icons/icon-512.png', png512)
console.log('Icons generated: public/icons/icon-192.png, public/icons/icon-512.png')
