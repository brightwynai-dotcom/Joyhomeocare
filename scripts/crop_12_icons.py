import cv2

img = cv2.imread('image copy 2.png')

xs = [372, 664, 938, 1216]
ys = [44, 370, 678]

# By looking at the image, the icon is in the top left corner of the card.
# It seems it has some padding. Let's say padding is 24px left, 24px top.
# The icon circle itself is maybe 80x80.
# Let's crop a 90x90 square and check.
for row in range(3):
    for col in range(4):
        i = row * 4 + col + 1
        x = xs[col]
        y = ys[row]
        
        # Adjust these offsets if needed.
        crop = img[y+18:y+108, x+18:x+108]
        cv2.imwrite(f'icon_{i}.png', crop)

print("Saved 12 icons")
