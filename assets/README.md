encryption commands
-------------------

```
openssl aes-256-cbc -in tiny_dungeon_world_3.png -out tiny_dungeon_world_3.png.enc
<enter password>
base64 < tiny_dungeon_world_3.png.enc > tiny_dungeon_world_3.png.enc.b64
```

at build time:
```
export ASSET_KEY=<password>
npm run build
npm run serve
```
sources:
- https://stackoverflow.com/questions/19826009/decryption-a-picture-using-cryptojs-and-inserting-it-into-a-page
- https://webpack.js.org/plugins/environment-plugin/