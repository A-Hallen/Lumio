"""Genera los iconos de Lumio desde assets/icon-src/*.svg (el icono es obra del usuario).
Requiere Google Chrome y Pillow. Uso: python3 -I tools/make-icons.py"""
import subprocess, tempfile, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'icon-src')
OUT = os.path.join(ROOT, 'assets')

def render(svg, width, height):
    """SVG -> PNG con transparencia, usando Chrome sin interfaz."""
    with tempfile.TemporaryDirectory() as d:
        html = os.path.join(d, 'r.html'); png = os.path.join(d, 'r.png')
        open(html, 'w').write(f'<body style="margin:0;background:transparent"><img src="file://{svg}" style="display:block;width:{width}px;height:{height}px"></body>')
        subprocess.run(['google-chrome', '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
                        '--default-background-color=00000000', f'--window-size={max(width, 500)},{max(height, 200)}',
                        f'--screenshot={png}', f'file://{html}'], check=True, capture_output=True, timeout=90)
        im = Image.open(png).convert('RGBA')
        return im.crop((0, 0, width, height))

FG_W, FG_H = 315, 391.348          # medidas del foreground.svg
FULL = 493                          # medidas del icon-full.svg
S = 1024 / FULL

# icon.png: bombilla sobre cuadrado blanco a sangre (Android/stores aplican su propia mascara)
fg = render(os.path.join(SRC, 'foreground.svg'), round(FG_W * S), round(FG_H * S))
icon = Image.new('RGBA', (1024, 1024), 'white')
icon.alpha_composite(fg, (round(89 * S), round(50.698 * S)))
icon.convert('RGB').save(os.path.join(OUT, 'icon.png'))

# adaptive-icon.png: solo la bombilla, dentro de la zona segura (el fondo blanco lo pone app.json)
h = round(1024 * 0.54); w = round(h * FG_W / FG_H)
fg2 = render(os.path.join(SRC, 'foreground.svg'), w, h)
adaptive = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
adaptive.alpha_composite(fg2, ((1024 - w) // 2, (1024 - h) // 2))
adaptive.save(os.path.join(OUT, 'adaptive-icon.png'))

# monochrome para iconos tematicos de Android 13+: la bombilla en una sola tinta, el cristal interior queda vacio
mono = Image.new('RGBA', adaptive.size, (0, 0, 0, 0))
px, mp = adaptive.load(), mono.load()
for y in range(adaptive.height):
    for x in range(adaptive.width):
        r, g, b, a = px[x, y]
        if a:
            k = max(0.0, min(1.0, (255 - b) / 155))   # blanco -> transparente, amarillo/naranja -> opaco
            mp[x, y] = (0, 0, 0, round(a * k))
mono.save(os.path.join(OUT, 'adaptive-icon-monochrome.png'))

# splash: el icono completo (cuadrado redondeado) sobre fondo oscuro, configurado en app.json
render(os.path.join(SRC, 'icon-full.svg'), 800, 800).save(os.path.join(OUT, 'splash-icon.png'))

# favicon
icon.convert('RGB').resize((48, 48), Image.LANCZOS).save(os.path.join(OUT, 'favicon.png'))
print('iconos listos')
