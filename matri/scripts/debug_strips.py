from PIL import Image
from pathlib import Path

mockup = Path(r"C:\Users\Lenovo\.cursor\projects\d-matrimony-website\assets\c__Users_Lenovo_AppData_Roaming_Cursor_User_workspaceStorage_0db5acac0c0a0e5bd6a4b061d6d08e11_images_image-2a0e95a7-b52f-45f3-9ba7-70c7fbfa398d.png")
debug = Path(r"D:\matrimony_website\matrimony\src\assets\_debug")
debug.mkdir(parents=True, exist_ok=True)
im = Image.open(mockup).convert("RGB")
w, h = im.size
print(f"{w}x{h}")

# Save horizontal strips every 5% to locate sections
for i in range(0, 20):
    y1 = int(h * i / 20)
    y2 = int(h * (i + 1) / 20)
    strip = im.crop((0, y1, w, y2))
    strip.save(debug / f"strip_{i:02d}_{int(i*5)}-{int((i+1)*5)}.jpg", quality=85)
    print(f"strip {i}: y={y1}-{y2}")
print("debug strips saved")
