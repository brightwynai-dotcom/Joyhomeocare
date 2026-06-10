import json
log_path = r'C:\Users\hp\.gemini\antigravity-ide\brain\f80e99a4-61bd-413a-afed-83fd8d32aeef\.system_generated\logs\transcript.jsonl'
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'Respiratory Health' in line and 'accordion-item' in line:
            print("FOUND ACCORDION HTML in transcript!")
            break
