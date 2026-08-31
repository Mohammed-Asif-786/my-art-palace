from PIL import Image

src = r"c:\Users\ELCOT\Desktop\Asif's Art Palace\assets\logo.jpeg"
out = r"c:\Users\ELCOT\Desktop\Asif's Art Palace\assets\logo-transparent.png"

img = Image.open(src).convert("RGBA")
new_pixels = []
for r, g, b, a in img.getdata():
    if r > 245 and g > 245 and b > 245:
        new_pixels.append((255, 255, 255, 0))
    else:
        new_pixels.append((r, g, b, 255))
img.putdata(new_pixels)
img.save(out)
print(out)
