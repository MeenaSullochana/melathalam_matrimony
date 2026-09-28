import urllib.request
from pathlib import Path

out = Path(r"D:\matrimony_website\matrimony\src\assets")

# Wikimedia Commons / reliable direct image URLs (known stable)
downloads = {
    out / "communities" / "hindu.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Brihadisvara_Temple%2C_Thanjavur%2C_India.jpg/1280px-Brihadisvara_Temple%2C_Thanjavur%2C_India.jpg",
    out / "communities" / "muslim.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Blue_Mosque_Courtyard_Istanbul.JPG/1280px-Blue_Mosque_Courtyard_Istanbul.JPG",
    out / "communities" / "christian.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Notre-Dame_de_Paris%2C_4_October_2017.jpg/1280px-Notre-Dame_de_Paris%2C_4_October_2017.jpg",
    out / "communities" / "sikh.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Golden_Temple_reflection.jpg/1280px-Golden_Temple_reflection.jpg",
    out / "communities" / "jain.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Dilwara_Temples%2C_Mount_Abu.jpg/1280px-Dilwara_Temples%2C_Mount_Abu.jpg",
    out / "communities" / "other.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Family_portrait.jpg/800px-Family_portrait.jpg",
    out / "cta" / "hands.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Indian_wedding_hands_with_henna.jpg/1280px-Indian_wedding_hands_with_henna.jpg",
}

opener = urllib.request.build_opener()
opener.addheaders = [("User-Agent", "ForeverMineMatrimony/1.0 (local dev; educational)")]
urllib.request.install_opener(opener)

for path, url in downloads.items():
    try:
        print(f"GET {path.name} ...")
        urllib.request.urlretrieve(url, path)
        print(f"  OK {path.stat().st_size // 1024} KB")
    except Exception as e:
        print(f"  FAIL {e}")
