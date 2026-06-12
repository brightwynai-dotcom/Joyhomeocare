import cv2
import numpy as np
import os

img = cv2.imread('image copy 2.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# blur
blur = cv2.medianBlur(gray, 5)

# find circles
circles = cv2.HoughCircles(blur, cv2.HOUGH_GRADIENT, 1.2, 100, param1=50, param2=30, minRadius=20, maxRadius=60)

if circles is not None:
    circles = np.round(circles[0, :]).astype("int")
    
    # Sort circles by Y, then by X to get them in reading order
    # Group by rows:
    # First, sort by Y
    circles = sorted(circles, key=lambda x: x[1])
    
    # Assuming 3 rows of 4 columns
    rows = []
    if len(circles) >= 12:
        for i in range(3):
            row = circles[i*4:(i+1)*4]
            row = sorted(row, key=lambda x: x[0])
            rows.extend(row)
        circles = rows[:12]
        
    print(f"Found {len(circles)} circles")
    
    for i, (x, y, r) in enumerate(circles):
        # We want to crop a square around the circle
        # Let's crop a bounding box of size 100x100
        size = 80
        x1, y1 = max(0, x - size), max(0, y - size)
        x2, y2 = min(img.shape[1], x + size), min(img.shape[0], y + size)
        
        crop = img[y1:y2, x1:x2]
        filename = f'extracted_icon_{i+1}.png'
        cv2.imwrite(filename, crop)
        print(f"Saved {filename} from center ({x},{y})")
else:
    print("No circles found.")
