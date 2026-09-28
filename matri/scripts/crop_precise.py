from PIL import Image
from pathlib import Path

mockup = Path(r"C:\Users\Lenovo\.cursor\projects\d-matrimony-website\assets\c__Users_Lenovo_AppData_Roaming_Cursor_User_workspaceStorage_0db5acac0c0a0e5bd6a4b061d6d08e11_images_image-2a0e95a7-b52f-45f3-9ba7-70c7fbfa398d.png")
out = Path(r"D:\matrimony_website\matrimony\src\assets")
im = Image.open(mockup).convert("RGB")
w, h = im.size

def save(box, path, scale=4):
    crop = im.crop(box)
    crop = crop.resize((crop.width * scale, crop.height * scale), Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    crop.save(path, "JPEG", quality=93, optimize=True)
    print(f"{path.name}: {crop.size} {path.stat().st_size // 1024}KB")

# Community image areas (strip 10-11): y ~512 to ~585 (image only, before labels)
# Full cards: approx x from 40 to 642, 6 equal cards
y1, y2 = 512, 585
left, right = 38, 644
gap = 8
usable = right - left
card = usable // 6
names = ["hindu", "muslim", "christian", "sikh", "jain", "other"]
for i, name in enumerate(names):
    x1 = left + i * card + 4
    x2 = left + (i + 1) * card - 4
    save((x1, y1, x2, y2), out / "communities" / f"{name}.jpg", scale=4)

# Success story circular photos — strip 13-14
# Cards start ~ y 680, photos on left of each card
story_boxes = [
    ("arun-priya", (52, 688, 118, 754)),
    ("karthik-divya", (260, 688, 326, 754)),
    ("rahul-sneha", (468, 688, 534, 754)),
]
for name, box in story_boxes:
    save(box, out / "success-stories" / f"{name}.jpg", scale=5)

# CTA hands — left side of CTA banner ~ y 780-880
save((40, 780, 300, 900), out / "cta" / "hands-from-design.jpg", scale=3)

# Hero couple — right side
save((300, 55, 670, 300), out / "hero" / "couple-from-design.jpg", scale=3)

print("done")
