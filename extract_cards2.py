import cv2

img = cv2.imread('image copy 2.png')

# The grid is 4 columns x 3 rows.
# Let's try to find the circles again by looking for the green circles.
# The circles have a specific green color. Let's filter by color.
# The stroke is dark green: approx #2D6A4F (R:79, G:106, B:45) -> wait, BGR is (79, 106, 45)
# Actually, let's just find the cards by edge detection

edges = cv2.Canny(img, 50, 150)
contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

cards = []
for cnt in contours:
    x, y, w, h = cv2.boundingRect(cnt)
    if 200 < w < 350 and 200 < h < 400:  # Card size
        cards.append((x, y, w, h))

# sort by Y, then X
cards = sorted(cards, key=lambda b: ((b[1] // 100) * 100, b[0]))
print(f"Found {len(cards)} cards by edges")
for i, (x, y, w, h) in enumerate(cards):
    print(f"Card {i+1}: {x}, {y}, {w}, {h}")
    icon_crop = img[y+10:y+120, x+20:x+130] # guess icon location
    cv2.imwrite(f'icon_{i+1}.png', icon_crop)
