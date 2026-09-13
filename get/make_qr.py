"""KOKOS branded QR -> standalone SVG (true vector, logo embedded).

Regenerate with:   python3 get/make_qr.py get/KOKOS_dapp_QR.svg   (run from repo root)

Styling was decode-tested (see notes): softly rounded data modules are safe, but the
three finder eyes MUST stay square — rounding them breaks detection outright.
Config below scored 54/54 across scale / blur / rotation, same as a plain QR.
"""
import qrcode, base64, io, sys
from PIL import Image

URL    = "https://kokosicecream.com/get/"
INK    = "#11483d"                      # KOKOS deep green
PAPER  = "#FFFAF7"                      # KOKOS cream
LOGO   = "Customer_dapp/KOKOS_SKOOP.png"
S      = 10                             # svg units per module
BORDER = 4                              # quiet zone, in modules (spec minimum)
INSET  = 0.12 * S                       # hairline gap between modules
RADIUS = 0.28 * S                       # module corner radius
KO     = 9                              # centre knockout, in modules

q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=BORDER)
q.add_data(URL); q.make(fit=True)
m = q.get_matrix(); N = len(m); size = N * S; inner = N - 2*BORDER
eyes = ((0, 0), (0, inner-7), (inner-7, 0))

def in_finder(r, c):
    r -= BORDER; c -= BORDER
    if not (0 <= r < inner and 0 <= c < inner): return True
    return any(a <= r < a+7 and b <= c < b+7 for a, b in eyes)

lo = (N - KO) // 2
p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">',
     f'<rect width="{size}" height="{size}" fill="{PAPER}"/>', f'<g fill="{INK}">']

for r in range(N):
    for c in range(N):
        if not m[r][c] or in_finder(r, c) or (lo <= r < lo+KO and lo <= c < lo+KO): continue
        p.append(f'<rect x="{c*S+INSET:g}" y="{r*S+INSET:g}" width="{S-2*INSET:g}" '
                 f'height="{S-2*INSET:g}" rx="{RADIUS:g}"/>')
p.append('</g>')

for a, b in eyes:                        # square rings: ring / gap / pip
    x, y = (b+BORDER)*S, (a+BORDER)*S
    p.append(f'<path fill="{INK}" fill-rule="evenodd" d="M{x} {y}h{7*S}v{7*S}h{-7*S}z'
             f'M{x+S} {y+S}v{5*S}h{5*S}v{-5*S}z"/>'
             f'<rect x="{x+2*S}" y="{y+2*S}" width="{3*S}" height="{3*S}" fill="{INK}"/>')

# The badge prints at ~0.3in and shows at ~60px on screen, so downsample it —
# embedding the 347KB original would balloon the SVG to half a megabyte. It gets
# clipped to a circle below, so its alpha channel is expendable: flatten onto the
# paper colour and use JPEG, which suits this artwork far better than PNG.
_src = Image.open(LOGO).convert('RGBA').resize((240, 240), Image.LANCZOS)
_flat = Image.new('RGB', _src.size, PAPER)
_flat.paste(_src, mask=_src.split()[3])
_buf = io.BytesIO(); _flat.save(_buf, 'JPEG', quality=90, optimize=True)
b64 = base64.b64encode(_buf.getvalue()).decode()
cx = size/2; rad = KO*S/2
p.append(f'<circle cx="{cx:g}" cy="{cx:g}" r="{rad:g}" fill="{PAPER}"/>'
         f'<clipPath id="kokosBadge"><circle cx="{cx:g}" cy="{cx:g}" r="{rad*0.9:g}"/></clipPath>'
         f'<image href="data:image/jpeg;base64,{b64}" x="{cx-rad*0.9:g}" y="{cx-rad*0.9:g}" '
         f'width="{rad*1.8:g}" height="{rad*1.8:g}" clip-path="url(#kokosBadge)"/>')
p.append('</svg>')
open(sys.argv[1], 'w').write('\n'.join(p))
print(f"{URL}  version {q.version}  {inner}x{inner} modules  -> {sys.argv[1]}")
