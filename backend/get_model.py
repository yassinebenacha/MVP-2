import json
import re
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
nb = json.load(open(os.path.join(BASE_DIR, 'noisecleaner_pipeline.ipynb'), encoding='utf-8'))
src = ''.join(sum([c.get('source', []) for c in nb['cells']], []))
m = re.search(r'MODEL_NAME\s*=\s*[\'"](.*?)[\'"]', src)
if m:
    print(m.group(1))
else:
    print("Not found")
