import json
import re

nb = json.load(open(r'c:\Users\yssin\Downloads\MVP 2\noisecleaner_pipeline.ipynb', encoding='utf-8'))
src = ''.join(sum([c.get('source', []) for c in nb['cells']], []))
m = re.search(r'MODEL_NAME\s*=\s*[\'"](.*?)[\'"]', src)
if m:
    print(m.group(1))
else:
    print("Not found")
