from PIL import Image
from pathlib import Path

mockup = Path(r"C:\Users\Lenovo\.cursor\projects\d-matrimony-website\assets\c__Users_Lenovo_AppData_Roaming_Cursor_User_workspaceStorage_0db5acac0c0a0e5bd6a4b061d6d08e11_images_image-2a0e95a7-b52f-45f3-9ba7-70c7fbfa398d.png")
out_dir = Path(r"D:\matrimony_website\matrimony\src\assets")
im = Image.open(mockup).convert("RGB")
w, h = im.size
print(f"mockup size: {w}x{h}")

# Approximate crop regions based on full-page mockup proportions.
# These will be refined after inspecting strip previews.

def save_crop(box, path, scale=2):
    crop = im.crop(box)
    if scale != 1:
        crop = crop.resize((crop.width * scale, crop.height * scale), Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    crop.save(path, "JPEG", quality=92, optimize=True)
    print(f"saved {path.name}: {crop.size} ({path.stat().st_size // 1024} KB)")

# Hero couple area (right side of hero)
save_crop((int(w * 0.42), int(h * 0.055), int(w * 0.98), int(h * 0.285)), out_dir / "hero" / "couple-from-design.jpg", scale=2)

# Community cards row - six equal cards roughly
cy1, cy2 = int(h * 0.355), int(h * 0.455)
pad = int(w * 0.05)
usable = w - 2 * pad
card_w = usable // 6
names = ["hindu", "muslim", "christian", "sikh", "jain", "other"]
for i, name in enumerate(names):
    x1 = pad + i * card_w + 6
    x2 = pad + (i + 1) * card_w - 6
    # crop image area only (exclude label)
    save_crop((x1, cy1, x2, int(cy1 + (cy2 - cy1) * 0.72)), out_dir / "communities" / f"{name}.jpg", scale=3)

# Success story circular photos - approximate
sy1, sy2 = int(h * 0.545), int(h * 0.635)
story_names = ["arun-priya", "karthik-divya", "rahul-sneha"]
story_xs = [0.10, 0.40, 0.70]
for name, xs in zip(story_names, story_xs):
    x1 = int(w * xs)
    x2 = int(w * (xs + 0.12))
    save_crop((x1, sy1, x2, sy2), out_dir / "success-stories" / f"{name}.jpg", scale=3)

# CTA hands area
save_crop((int(w * 0.04), int(h * 0.70), int(w * 0.42), int(h * 0.86)), out_dir / "cta" / "hands.jpg", scale=2)

print("done")
