# Local webfonts

These are the blog's existing Google Fonts families and weights, vendored
unchanged as Latin WOFF2 files on October 12, 2026. The Latin subset includes
Brazilian Portuguese accents; other scripts use the browser's fallback fonts.
The combined files are 265,048 bytes. Only the faces used by a page are loaded.

`assets/css/fonts.css` declares the faces with `font-display: optional`, so a
slow font does not replace text that has already been painted. The head
preloads PT Serif regular, Fjalla One, and Barlow Condensed 400/500. Relative
stylesheet URLs and baseURL-aware preload URLs also work under PR subpaths.

There are no build-time downloads. Versioned filenames must change when their
bytes change. Preserve the copyright notices and SIL OFL 1.1 in `OFL.txt`.

Sources: the Google Fonts CSS2 API and the versioned binaries below. Upstream
license notices: `google/fonts`' `ofl/{barlowcondensed,firamono,fjallaone,ptserif}/OFL.txt`.

| File | Source | SHA-256 |
| --- | --- | --- |
| barlow-condensed-v13-latin-400.woff2 | https://fonts.gstatic.com/s/barlowcondensed/v13/HTx3L3I-JCGChYJ8VI-L6OO_au7B6xHT2g.woff2 | 7fff1bb22e5773f0d1a55d3093068b6dac4539e8bb3ac23fb9f0a729df2c7bb4 |
| barlow-condensed-v13-latin-500.woff2 | https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B4-Lwz3bWuQ.woff2 | 460f141ec8f6c9a1516bfd2bd9fe71656246d7a9d04a0955faf53158d8970c4c |
| fira-mono-v16-latin-400.woff2 | https://fonts.gstatic.com/s/firamono/v16/N0bX2SlFPv1weGeLZDtgJv7S.woff2 | 8d1e753569ea7964a3beacda126450f8469b70c14c161ae8062cf4c12835e947 |
| fira-mono-v16-latin-500.woff2 | https://fonts.gstatic.com/s/firamono/v16/N0bS2SlFPv1weGeLZDto1d3HnvfU.woff2 | 291f90e3f0baf1f357ece7b82634b8bcd6c080def7648694894548af3d28af26 |
| fira-mono-v16-latin-700.woff2 | https://fonts.gstatic.com/s/firamono/v16/N0bS2SlFPv1weGeLZDtondvHnvfU.woff2 | f08b65965da9f065bea1bb354a374fe6b19e100904861840c0bd5d6b2dc79c93 |
| fjalla-one-v16-latin-400.woff2 | https://fonts.gstatic.com/s/fjallaone/v16/Yq6R-LCAWCX3-6Ky7FAFrOF6kg.woff2 | 96bbdb37b0db8ffc26756924566453f5fdcdf58ada20262cd75071b540361b12 |
| pt-serif-v19-latin-400-italic.woff2 | https://fonts.gstatic.com/s/ptserif/v19/EJRTQgYoZZY2vCFuvAFT_r21cg.woff2 | cb373bde18855c82a0ebf2946ea661ebd0be58a7fbabdf20f7744ecd9c0a9cfd |
| pt-serif-v19-latin-700-italic.woff2 | https://fonts.gstatic.com/s/ptserif/v19/EJRQQgYoZZY2vCFuvAFT9gaQZynfoA.woff2 | 3cb3cfab3c562cbbb5a53accf433f65ed1cd0403ea3bdd6ceeb73bf87f23521c |
| pt-serif-v19-latin-400.woff2 | https://fonts.gstatic.com/s/ptserif/v19/EJRVQgYoZZY2vCFuvAFWzr8.woff2 | 4271064a37f3ffc0aac5f3806db8a72acc23e19447d1804e4e80d8796cbf6330 |
| pt-serif-v19-latin-700.woff2 | https://fonts.gstatic.com/s/ptserif/v19/EJRSQgYoZZY2vCFuvAnt66qSVys.woff2 | bf23a7a4eebedbb87d4084a69496b29815914a18e339a00f5dc73a03c9c9328f |
