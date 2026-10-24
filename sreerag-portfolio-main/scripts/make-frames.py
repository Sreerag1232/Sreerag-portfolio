#!/usr/bin/env python3
"""Build every hero frame from the original showreel video.

Usage: python3 scripts/make-frames.py path/to/source.mp4
Needs: ffmpeg on PATH, pip install pillow

Writes tempp/sree.0001.webp ... sree.0121.webp (full frames, used by desktop and
tablets) and tempp/m/ (every 2nd frame, cropped to the slice a portrait phone
shows). After running it, bump FRAME_VERSION in script.js and the ?v= number in
the two hero <link rel="preload"> tags in index.html so visitors fetch the new files.
CROP_X / CROP_W must match the same constants in script.js.
"""
import os
import subprocess
import sys
import tempfile
from PIL import Image

CROP_X, CROP_W = 470, 850
QUALITY = 88
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tempp')

if len(sys.argv) != 2:
    sys.exit(__doc__)

os.makedirs(os.path.join(ROOT, 'm'), exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-vsync', '0',
                    '-pix_fmt', 'rgb24', os.path.join(tmp, '%04d.png')], check=True)
    names = sorted(os.listdir(tmp))
    if len(names) != 121:
        sys.exit(f'expected 121 frames, got {len(names)}; update TOTAL_FRAMES in script.js too')
    full = mobile = 0
    for i, name in enumerate(names, start=1):
        im = Image.open(os.path.join(tmp, name)).convert('RGB')
        if im.size != (1916, 1080):
            sys.exit(f'expected 1916x1080 frames, got {im.size}')
        out = f'sree.{i:04d}.webp'
        path = os.path.join(ROOT, out)
        im.save(path, 'WEBP', quality=QUALITY, method=6)
        full += os.path.getsize(path)
        if i % 2 == 1:  # 1, 3, ... 121
            path = os.path.join(ROOT, 'm', out)
            im.crop((CROP_X, 0, CROP_X + CROP_W, 1080)).save(path, 'WEBP', quality=QUALITY, method=6)
            mobile += os.path.getsize(path)
print(f'full frames: {full / 1e6:.2f} MB, phone frames: {mobile / 1e6:.2f} MB')
