import json
log_path = r'C:\Users\hp\.gemini\antigravity-ide\brain\f80e99a4-61bd-413a-afed-83fd8d32aeef\.system_generated\logs\transcript.jsonl'
out = ''
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'expertise-accordion' in line:
            try:
                data = json.loads(line)
                if data.get('type') == 'PLANNER_RESPONSE':
                    for tc in data.get('tool_calls', []):
                        if tc['name'] in ['replace_file_content', 'multi_replace_file_content']:
                            if 'index.html' in str(tc['args']):
                                out = str(tc['args'])
            except:
                pass
with open('extract.txt', 'w', encoding='utf-8') as f:
    f.write(out)
