import json
from pathlib import Path
from PIL import Image, ImageOps
root=Path(__file__).resolve().parents[1]
config=json.loads((root/'offers/pages.json').read_text())
out=[]
for p in config.get('pages',[]):
    url=p.get('image','')
    if not p.get('enabled',True) or not url.startswith('/media/') or '..' in url: continue
    src=root/url.lstrip('/')
    if not src.is_file(): continue
    target=src.with_name(src.stem+'.offer-preview.webp')
    if not target.exists():
        with Image.open(src) as im:
            im=ImageOps.exif_transpose(im).convert('RGB')
            im.thumbnail((750,1000),Image.Resampling.LANCZOS)
            im.save(target,'WEBP',quality=80,method=6)
    out.append({'image':url,'preview':'/'+target.relative_to(root).as_posix()})
(root/'_data').mkdir(exist_ok=True)
(root/'_data/offer_previews.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
