#!/usr/bin/env bash
# Ricostruisce index.html dal checkout di teardown, poi rifinisce la pagina
# per la pubblicazione (lingua, titolo, noindex).
#
#   ./sync.sh
#
# TEARDOWN può puntare altrove:  TEARDOWN=~/altro/teardown ./sync.sh
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
TEARDOWN="${TEARDOWN:-$HOME/projects/teardown}"

cd "$TEARDOWN"
node sims/build.mjs auto-live

cp teardown-out/dist/auto-live.html "$HERE/index.html"
cp sims/auto-shared/model.js \
   sims/auto-shared/car.js \
   sims/auto-shared/overlay.js \
   sims/auto-shared/live.js \
   sims/auto-shared/README.md "$HERE/src/"

cd "$HERE"

python3 - <<'PY'
import re, pathlib
p = pathlib.Path('index.html')
s = p.read_text(encoding='utf-8')

s = s.replace('<html lang="en">', '<html lang="it">', 1)
s = re.sub(r'<title>.*?</title>', '<title>Il viaggio casa → scuola · CO₂</title>', s, count=1)

# La pagina resta fuori dai motori di ricerca finché non è il lancio ufficiale.
if 'name="robots"' not in s:
    s = s.replace('<head>', '<head><meta name="robots" content="noindex,nofollow">', 1)

desc = ('Simulatore per la scuola: quanta CO₂ produce il viaggio casa → scuola, '
        'a benzina, diesel o elettrica.')
if 'name="description"' not in s:
    s = s.replace('<meta charset="utf-8">',
                  f'<meta charset="utf-8">\n<meta name="description" content="{desc}">', 1)

p.write_text(s, encoding='utf-8')
print('index.html rifinito:', len(s), 'byte')
PY

echo "Fatto. Apri index.html per provarlo."
