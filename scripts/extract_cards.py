import cv2
import numpy as np

img = cv2.imread('image copy 2.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# The cards are white on a light green background.
# Thresholding
_, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)

# Find contours
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

cards = []
for cnt in contours:
    x, y, w, h = cv2.boundingRect(cnt)
    # Cards should be relatively large, maybe 200x300
    if w > 100 and h > 100 and w < 500 and h < 500:
        cards.append((x, y, w, h))

# sort by Y then X
cards = sorted(cards, key=lambda b: (b[1] // 100, b[0]))

print(f"Found {len(cards)} cards")
for i, (x, y, w, h) in enumerate(cards):
    print(f"Card {i+1}: {x}, {y}, {w}, {h}")
    # The icon is at the top of the card. Let's crop the top part.
    icon_crop = img[y:y+120, x:x+w]
    cv2.imwrite(f'card_{i+1}_top.png', icon_crop)

