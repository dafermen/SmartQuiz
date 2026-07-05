from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(r"C:\Projects\SmartQuiz")
ANDROID_RES = ROOT / "android" / "app" / "src" / "main" / "res"
IOS_ASSETS = ROOT / "ios" / "App" / "App" / "Assets.xcassets"

PRIMARY = "#0f9f8f"
SECONDARY = "#162033"
ACCENT = "#f4b84a"
WHITE = "#ffffff"


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def draw_logo(draw, center, scale):
    cx, cy = center
    shield_w = int(190 * scale)
    shield_h = int(220 * scale)
    top = cy - shield_h // 2
    left = cx - shield_w // 2
    points = [
        (cx, top),
        (left + shield_w, top + int(42 * scale)),
        (left + int(160 * scale), top + int(170 * scale)),
        (cx, top + shield_h),
        (left + int(30 * scale), top + int(170 * scale)),
        (left, top + int(42 * scale)),
    ]
    draw.polygon(points, fill=WHITE)
    inset = int(18 * scale)
    inner = [
        (cx, top + inset),
        (left + shield_w - inset, top + int(50 * scale)),
        (left + int(146 * scale), top + int(160 * scale)),
        (cx, top + shield_h - int(24 * scale)),
        (left + int(44 * scale), top + int(160 * scale)),
        (left + inset, top + int(50 * scale)),
    ]
    draw.polygon(inner, fill=PRIMARY)
    check = [
        (cx - int(55 * scale), cy + int(8 * scale)),
        (cx - int(16 * scale), cy + int(48 * scale)),
        (cx + int(64 * scale), cy - int(54 * scale)),
    ]
    draw.line(check, fill=ACCENT, width=max(8, int(18 * scale)), joint="curve")


def make_icon(size):
    img = Image.new("RGBA", (size, size), SECONDARY)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle(
        [int(size * 0.08), int(size * 0.08), int(size * 0.92), int(size * 0.92)],
        radius=int(size * 0.2),
        fill=SECONDARY,
    )
    draw.ellipse(
        [int(size * 0.58), int(size * 0.08), int(size * 1.08), int(size * 0.58)],
        fill=PRIMARY,
    )
    draw_logo(draw, (size // 2, int(size * 0.48)), size / 512)
    text = "SQ"
    text_font = font(max(22, int(size * 0.11)), bold=True)
    bbox = draw.textbbox((0, 0), text, font=text_font)
    draw.text(
        ((size - (bbox[2] - bbox[0])) / 2, int(size * 0.72)),
        text,
        font=text_font,
        fill=WHITE,
    )
    return img


def make_splash(size):
    img = Image.new("RGB", (size, size), WHITE)
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, size, size], fill=WHITE)
    draw.ellipse([int(size * 0.62), int(size * 0.08), int(size * 1.08), int(size * 0.54)], fill="#e8f8f6")
    draw.ellipse([int(size * -0.12), int(size * 0.64), int(size * 0.28), int(size * 1.04)], fill="#fff4d8")
    badge = int(size * 0.22)
    draw.rounded_rectangle(
        [size // 2 - badge, size // 2 - badge, size // 2 + badge, size // 2 + badge],
        radius=int(size * 0.08),
        fill=SECONDARY,
    )
    draw_logo(draw, (size // 2, int(size * 0.47)), size / 1600)
    title_font = font(int(size * 0.06), bold=True)
    subtitle_font = font(int(size * 0.026))
    title = "SmartQuiz"
    subtitle = "Local exam practice"
    title_box = draw.textbbox((0, 0), title, font=title_font)
    subtitle_box = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    draw.text(((size - (title_box[2] - title_box[0])) / 2, int(size * 0.68)), title, fill=SECONDARY, font=title_font)
    draw.text(((size - (subtitle_box[2] - subtitle_box[0])) / 2, int(size * 0.745)), subtitle, fill="#64748b", font=subtitle_font)
    return img


def save_android_icons():
    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    for folder, size in sizes.items():
        target = ANDROID_RES / folder
        icon = make_icon(size)
        icon.save(target / "ic_launcher.png")
        icon.save(target / "ic_launcher_round.png")
        make_icon(size * 2).resize((size, size), Image.LANCZOS).save(target / "ic_launcher_foreground.png")


def save_android_splash():
    splash = make_splash(2732)
    targets = [
        "drawable",
        "drawable-land-hdpi",
        "drawable-land-mdpi",
        "drawable-land-xhdpi",
        "drawable-land-xxhdpi",
        "drawable-land-xxxhdpi",
        "drawable-port-hdpi",
        "drawable-port-mdpi",
        "drawable-port-xhdpi",
        "drawable-port-xxhdpi",
        "drawable-port-xxxhdpi",
    ]
    for folder in targets:
        (ANDROID_RES / folder).mkdir(parents=True, exist_ok=True)
        splash.save(ANDROID_RES / folder / "splash.png")


def save_ios_assets():
    iconset = IOS_ASSETS / "AppIcon.appiconset"
    splashset = IOS_ASSETS / "Splash.imageset"
    iconset.mkdir(parents=True, exist_ok=True)
    splashset.mkdir(parents=True, exist_ok=True)
    make_icon(1024).save(iconset / "AppIcon-512@2x.png")
    splash = make_splash(2732)
    for name in ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]:
      splash.save(splashset / name)


if __name__ == "__main__":
    save_android_icons()
    save_android_splash()
    save_ios_assets()
    print("Generated SmartQuiz mobile icons and splash assets.")
