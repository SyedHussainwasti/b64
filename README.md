# Base64 Tool

Encode text to Base64 and decode it back — with correct UTF-8 handling
(emoji-safe) and an optional URL-safe alphabet.

## How to use

Open `index.html`. Type text and hit **Encode →**, or paste Base64 and hit
**← Decode**. Tick **URL-safe** for the `-_` alphabet without padding
(handy for URLs and filenames). **Copy** grabs the result.

## How it works

- Encoding: `TextEncoder` → UTF-8 bytes → chunked `btoa` (chunking avoids
  stack overflows on large inputs; naive `btoa(unicode)` would corrupt it).
- Decoding: strict validation (alphabet + length multiple of 4) → `atob` →
  `TextDecoder` in fatal mode, so bad input fails with a clear error instead
  of silent mojibake.
- 100% client-side, zero network requests.
