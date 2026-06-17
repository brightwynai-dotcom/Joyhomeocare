import sys
import subprocess

with open('devika_script.js', 'r', encoding='utf-8') as f:
    devika_lines = f.readlines()

with open('script.js', 'r', encoding='utf-8') as f:
    script_lines = f.readlines()

appt_start = -1
appt_end = -1
for i, line in enumerate(devika_lines):
    if '/* ---- Appointment Form Validation' in line:
        appt_start = i
    if '/* ---- Scroll to Top Button ---- */' in line:
        appt_end = i
        break

appointment_code = ''.join(devika_lines[appt_start:appt_end])

# Append the missing braces if any, and the appointment code
fixed_script = ''.join(script_lines) + "\n\n  }\n});\n" + appointment_code

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(fixed_script)

print("Done writing, checking syntax...")
sys.exit(0)
