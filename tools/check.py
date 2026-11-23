#!/usr/bin/env python3
"""Check the site: every page renders, every link goes to a real page, no banned words.

    python3 tools/check.py

Needs Python 3 and Google Chrome (set CHROME=/path/to/chrome if it is somewhere else).
"""
import os, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHROME = os.environ.get('CHROME', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
BANNED = ['dummy', 'legacy', 'paygate', 'enterprise', 'IGE', 'TODO']

def dom(route):
    r = subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--virtual-time-budget=3000', '--dump-dom',
                        f'file://{ROOT}/index.html#/{route}'], capture_output=True, text=True, timeout=60)
    return r.stdout

def main():
    problems = []
    home = dom('guide/welcome') + dom('gateway/start') + dom('auth/start') + dom('')
    routes = sorted(set(re.findall(r'href="#/([^"]+)"', home)) | {''})
    if len(routes) < 10: sys.exit('The menu did not render: open index.html and check the browser console.')
    seen = {}
    for r in routes:
        html = dom(r)
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', html)
        seen[r] = html
        if not h1: problems.append(f'{r}: page did not render')
    for r, html in seen.items():
        for link in set(re.findall(r'href="#/([^"]+)"', html)):
            if link not in seen and link.split('/')[0] in ('guide', 'gateway', 'auth'): problems.append(f'{r}: link to #/{link} goes nowhere')
        text = re.sub(r'<[^>]+>', ' ', html.split('id="app"')[-1])
        for w in BANNED:
            if re.search(r'\b' + re.escape(w) + r'\b', text, re.I if w.islower() else 0):
                problems.append(f'{r}: banned word "{w}"')
    for p in problems: print('  ' + p)
    print(f'{len(seen)} pages checked. ' + ('All checks passed.' if not problems else f'{len(problems)} problems.'))
    sys.exit(1 if problems else 0)

if __name__ == '__main__':
    main()
