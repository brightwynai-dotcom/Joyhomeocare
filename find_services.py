import json
import re

log_path = r'C:\Users\hp\.gemini\antigravity-ide\brain\f80e99a4-61bd-413a-afed-83fd8d32aeef\.system_generated\logs\transcript.jsonl'
out = []

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'services-new-wrap' in line:
            try:
                data = json.loads(line)
                if data.get('type') == 'PLANNER_RESPONSE':
                    for tc in data.get('tool_calls', []):
                        if tc['name'] in ['replace_file_content', 'multi_replace_file_content', 'write_to_file']:
                            out.append(json.dumps(tc['args'], indent=2))
            except:
                pass

with open('services_reconstruct.txt', 'w', encoding='utf-8') as f:
    f.write("\n\n---\n\n".join(out))
