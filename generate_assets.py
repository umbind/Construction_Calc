"""
Plan & BuildMetric - Visual Asset & Icon Generator
Creates:
1. og-image.png (1200x630) - Social preview card for OpenGraph & Twitter
2. logo.png (512x512) - High-res brand logo for Schema.org & PWA
3. apple-touch-icon.png (180x180) - iOS touch icon
4. favicon.ico (16x16, 32x32, 48x48) - Browser tab icon
5. favicon.png (64x64) - Web icon
"""

import os
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def create_gradient(width, height, start_color, end_color):
    """Creates a smooth linear vertical/diagonal gradient image."""
    base = Image.new('RGBA', (width, height), start_color)
    top = Image.new('RGBA', (width, height), end_color)
    mask = Image.new('L', (width, height))
    mask_data = []
    for y in range(height):
        for x in range(width):
            # Diagonal gradient factor
            factor = (x / width * 0.4) + (y / height * 0.6)
            mask_data.append(int(255 * factor))
    mask.putdata(mask_data)
    base.paste(top, (0, 0), mask)
    return base

def generate_logo(size=512):
    """Generates a crisp high-res 512x512 PBM logo."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Rounded badge background
    pad = int(size * 0.08)
    radius = int(size * 0.22)
    badge_box = [pad, pad, size - pad, size - pad]
    
    # Outer amber glow
    glow_box = [pad - 8, pad - 8, size - pad + 8, size - pad + 8]
    draw.rounded_rectangle(glow_box, radius=radius + 4, fill=(245, 158, 11, 60))
    
    # Badge body gradient approximation
    draw.rounded_rectangle(badge_box, radius=radius, fill=(245, 158, 11, 255), outline=(251, 191, 36, 255), width=int(size * 0.02))
    
    # Inner border
    inner_pad = pad + int(size * 0.03)
    draw.rounded_rectangle([inner_pad, inner_pad, size - inner_pad, size - inner_pad], radius=radius - 8, outline=(217, 119, 6, 180), width=int(size * 0.015))
    
    # PBM Monogram text
    try:
        font = ImageFont.truetype("arialbd.ttf", int(size * 0.32))
    except Exception:
        font = ImageFont.load_default()
        
    text = "PBM"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    text_x = (size - text_w) / 2
    text_y = (size - text_h) / 2 - int(size * 0.03)
    
    # Text shadow
    draw.text((text_x + 3, text_y + 4), text, fill=(120, 53, 15, 200), font=font)
    # Text main
    draw.text((text_x, text_y), text, fill=(11, 15, 25, 255), font=font)
    
    # Subtitle bar
    sub_text = "ESTIMATOR"
    try:
        sub_font = ImageFont.truetype("arialbd.ttf", int(size * 0.08))
    except Exception:
        sub_font = ImageFont.load_default()
    sub_bbox = draw.textbbox((0, 0), sub_text, font=sub_font)
    sub_w = sub_bbox[2] - sub_bbox[0]
    sub_x = (size - sub_w) / 2
    sub_y = text_y + text_h + int(size * 0.06)
    draw.text((sub_x, sub_y), sub_text, fill=(15, 23, 42, 230), font=sub_font)
    
    return img

def generate_og_image(width=1200, height=630):
    """Generates a high-converting 1200x630 OpenGraph social preview card."""
    img = create_gradient(width, height, (11, 15, 25, 255), (30, 41, 59, 255))
    draw = ImageDraw.Draw(img)
    
    # Top banner line
    draw.rectangle([0, 0, width, 10], fill=(245, 158, 11, 255))
    
    # Draw decorative blueprint grid dots in top right
    for gx in range(width - 400, width - 40, 30):
        for gy in range(40, 300, 30):
            draw.ellipse([gx, gy, gx + 3, gy + 3], fill=(245, 158, 11, 40))
            
    # Paste Logo
    logo = generate_logo(160)
    img.paste(logo, (80, 80), logo)
    
    # Brand Name Text
    try:
        brand_font = ImageFont.truetype("arialbd.ttf", 46)
        tagline_font = ImageFont.truetype("arialbd.ttf", 36)
        body_font = ImageFont.truetype("arial.ttf", 22)
        badge_font = ImageFont.truetype("arialbd.ttf", 18)
    except Exception:
        brand_font = ImageFont.load_default()
        tagline_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
        badge_font = ImageFont.load_default()
        
    draw.text((270, 95), "Plan & BuildMetric", fill=(255, 255, 255, 255), font=brand_font)
    draw.text((270, 160), "India's #1 Construction Takeoff & Real Estate Engine", fill=(245, 158, 11, 255), font=tagline_font)
    
    # Divider line
    draw.line([80, 270, width - 80, 270], fill=(51, 65, 85, 255), width=2)
    
    # 3 Feature Pillars
    pillars = [
        ("🇮🇳 IS 456 Material Takeoff", "Concrete m3, Brass, 50kg Bags, AAC Blocks, TMT Steel, Tiles & Paint."),
        ("📊 Indian Real Estate & Taxes", "Cap Rate, Home Loan EMI (Sec 24b/80C), Budget 2024 12.5% LTCG."),
        ("🌐 10 Regional Languages", "Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Odia & more.")
    ]
    
    card_w = 320
    card_gap = 40
    start_x = 80
    
    for i, (p_title, p_desc) in enumerate(pillars):
        cx = start_x + (i * (card_w + card_gap))
        cy = 310
        # Card body
        draw.rounded_rectangle([cx, cy, cx + card_w, cy + 180], radius=16, fill=(15, 23, 42, 220), outline=(51, 65, 85, 200), width=2)
        draw.rounded_rectangle([cx, cy, cx + card_w, cy + 6], radius=6, fill=(245, 158, 11, 200))
        # Text
        draw.text((cx + 18, cy + 24), p_title, fill=(254, 243, 199, 255), font=badge_font)
        
        # Word wrap desc
        words = p_desc.split(" ")
        line1 = " ".join(words[:5])
        line2 = " ".join(words[5:10])
        line3 = " ".join(words[10:])
        draw.text((cx + 18, cy + 65), line1, fill=(203, 213, 225, 255), font=body_font)
        draw.text((cx + 18, cy + 95), line2, fill=(203, 213, 225, 255), font=body_font)
        if line3:
            draw.text((cx + 18, cy + 125), line3, fill=(203, 213, 225, 255), font=body_font)
            
    # Bottom footer strip
    draw.rounded_rectangle([80, 525, width - 80, 580], radius=12, fill=(245, 158, 11, 30), outline=(245, 158, 11, 100))
    draw.text((105, 542), "⚡ Live at: https://planandbuildmetric.netlify.app/", fill=(251, 191, 36, 255), font=badge_font)
    draw.text((width - 340, 542), "100% Free & Private Client-Side", fill=(226, 232, 240, 255), font=badge_font)
    
    return img

def main():
    print("Generating Plan & BuildMetric Visual Assets...")
    
    # 1. logo.png (512x512)
    logo_512 = generate_logo(512)
    logo_path = os.path.join(BASE_DIR, "logo.png")
    logo_512.save(logo_path, "PNG", optimize=True)
    print(f"  [SAVED] {logo_path} (512x512)")
    
    # 2. apple-touch-icon.png (180x180)
    logo_180 = generate_logo(180)
    apple_icon_path = os.path.join(BASE_DIR, "apple-touch-icon.png")
    logo_180.save(apple_icon_path, "PNG", optimize=True)
    print(f"  [SAVED] {apple_icon_path} (180x180)")
    
    # 3. favicon.png (64x64)
    logo_64 = generate_logo(64)
    favicon_png_path = os.path.join(BASE_DIR, "favicon.png")
    logo_64.save(favicon_png_path, "PNG", optimize=True)
    print(f"  [SAVED] {favicon_png_path} (64x64)")
    
    # 4. favicon.ico (multi-size ICO 16, 32, 48)
    favicon_ico_path = os.path.join(BASE_DIR, "favicon.ico")
    logo_512.save(favicon_ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"  [SAVED] {favicon_ico_path} (Multi-size ICO 16/32/48)")
    
    # 5. og-image.png (1200x630)
    og_img = generate_og_image(1200, 630)
    og_path = os.path.join(BASE_DIR, "og-image.png")
    og_img.save(og_path, "PNG", optimize=True)
    print(f"  [SAVED] {og_path} (1200x630 High-Res OpenGraph Card)")
    
    print("[SUCCESS] All visual assets generated successfully!")

if __name__ == "__main__":
    main()
