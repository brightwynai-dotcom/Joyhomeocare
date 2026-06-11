import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the <svg ...>...</svg> inside <div class="spec-icon-circle"> with an <img> tag.
# Let's find all <div class="spec-icon-circle">...</div> blocks.
pattern = re.compile(r'(<div class="spec-icon-circle">)\s*<svg.*?</svg>\s*(</div>)', re.DOTALL)

matches = pattern.findall(content)
print(f"Found {len(matches)} spec-icon-circle blocks")

def replacer(match):
    global count
    count += 1
    return f'{match.group(1)}\n              <img src="icon_{count}.png" alt="Specialisation Icon" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />\n            {match.group(2)}'

count = 0
new_content = pattern.sub(replacer, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Replaced {count} icons.")
