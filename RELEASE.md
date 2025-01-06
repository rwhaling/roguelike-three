```
rm -rf package/
mkdir package
cp bg.png colored_tilemap_packed.png barrow_2_v1_town_bounce_1.mp3 barrow_2_v3_bounce_3.mp3 *.html *.css tiny_dungeon_world_3_dark_test_7.png.enc.b64 riffwave.jspackage
cp dist/app.js package/dist
zip -rXq barrow_2.zip package
```