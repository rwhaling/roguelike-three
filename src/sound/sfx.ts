import { SoundEffect } from "jsfxr";

export const sfx = {
    "rubber": (new SoundEffect("5EoyNVaezhPnpFZjpkcJkF8FNCioPncLoztbSHU4u9wDQ8W3P7puffRWvGMnrLRdHa61kGcwhZK3RdoDRitmtwn4JjrQsZCZBmDQgkP5uGUGk863wbpRi1xdA")).generate().getAudio(),
    "step": (new SoundEffect("34T6PkwiBPcxMGrK7aegATo5WTMWoP17BTc6pwXbwqRvndwRjGYXx6rG758rLSU5suu35ZTkRCs1K2NAqyrTZbiJUHQmra9qvbBrSdbBbJ7JvmyBFVDo6eiVD")).generate().getAudio(),
    "choice": (new SoundEffect("34T6PkzXyyB6jHiwFztCFWEWsogkzrhzAH3FH2d97BCuFhqmZgfuXG3xtz8YYSKMzn95yyX8xZXJyesKmpcjpEL3dPP5h2e8mt5MmhExAksyqZyqgavBgsWMd")).generate().getAudio(),
    "hide": (new SoundEffect("34T6PkzXyyB6jHiwFztCFWEniygA1GJtjsQuGxcd38JLDquhRqTB28dQgigseMjQSjSY14Z3aBmAtzz9KWcJZ2o9S1oCcgqQY4dxTAXikS7qCs3QJ3KuWJUyD")).generate().getAudio(),
    "empty": (new SoundEffect("111112RrwhZ2Q7NGcdAP21KUHHKNQa3AhmK4Xea8mbiXfzkxr9aX41M8XYt5xYaaLeo9iZdUKUVL3u2N6XASue2wPv2wCCDy6W6TeFiUjk3dXSzFcBY7kTAM")).generate().getAudio(),
    "hit": (new SoundEffect("34T6Pks4nddGzchAFWpSTRAKitwuQsfX8bfzRpJx5eDR7NSqxeeLMEkLjcuwvTCDS1ve7amXBg4eipzDdgKWoYnJBsQVESZh2X1DFV2GWybY5bAihB2EdHsbd")).generate().getAudio(),
    "miss": (new SoundEffect("8R25jogvbp3Qy6A4GTPxRP4aT2SywwsAgoJ2pKmxUFMExgNashjgd311MnmZ2ThwrPQz71LA53QCfFmYQLHaXo6SocUv4zcfNAU5SFocZnoQSDCovnjpioNz3")).generate().getAudio(),
    "win": (new SoundEffect("34T6Pkv34QJsqDqEa8aV4iwF2LnASMc3683oFUPKZic6kVUHvwjUQi6rz8qNRUHRs34cu37P5iQzz2AzipW3DHMoG5h4BZgDmZnyLhsXgPKsq2r4Fb2eBFVuR")).generate().getAudio(),
    "lose": (new SoundEffect("7BMHBGHKKnn7bgcmGprqiBmpuRaTytcd4JS9eRNDzUTRuQy8BTBzs5g8XzS7rrp4C9cNeSaqAtWR9qdvXvtnWVTmTC8GXgDuCXD2KyHJNXzfUahbZrce8ibuy")).generate().getAudio(),
    "kill": (new SoundEffect("7BMHBGKMhg8NZkxKcJxNfTWXKtMPiZVNsLR4aPEAghCSpz5ZxpjS5k4j4ZQpJ65UZnHSr4R2d7ALCHJe41pAS2ZPjauM7SveudhDGAxw2dhXpiNwEhG8xUYkX")).generate().getAudio(),
  }

// // here we are turning the sfxr sound codes into
// // audio objects that can be played with `sfx[name].play()`
// for (let s in sfx) {
//     sfx[s] = (new SoundEffect(sfx[s])).generate().getAudio();
// }

// export sfx;

