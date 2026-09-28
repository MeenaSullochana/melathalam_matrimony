from PIL import Image
from pathlib import Path

mockup = Path(r"C:\Users\Lenovo\.cursor\projects\d-matrimony-website\assets\c__Users_Lenovo_AppData_Roaming_Cursor_User_workspaceStorage_0db5acac0c0a0e5bd6a4b061d6d08e11_images_image-2a0e95a7-b52f-45f3-9ba7-70c7fbfa398d.png")
out = Path(r"D:\matrimony_website\matrimony\src\assets\success-stories")
im = Image.open(mockup).convert("RGB")

# Circular photos only inside each story card (approx from strip analysis)
# Card row ~ y 690-760; photo circles left of each card
boxes = {
    "arun-priya.jpg": (55, 700, 112, 757),
    "karthik-divya.jpg": (263, 700, 320, 757),
    "rahul-sneha.jpg": (471, 700, 528, 757),
}

for name, box in boxes.items():
    crop = im.crop(box)
    # upscale for clearer circular avatars
    crop = crop.resize((crop.width * 6, crop.height * 6), Image.Resampling.LANCZOS)
    path = out / name
    crop.save(path, "JPEG", quality=92, optimize=True)
    print(f"{name}: {crop.size} {path.stat().st_size // 1024}KB")
