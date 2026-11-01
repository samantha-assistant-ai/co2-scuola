#!/usr/bin/env bash
# Ricostruisce la pagina del simulatore dal checkout di teardown, poi rifinisce
# i file per la pubblicazione. index.html e' la pagina di benvenuto.
#
#   ./sync.sh
#
# TEARDOWN può puntare altrove:  TEARDOWN=~/altro/teardown ./sync.sh
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
TEARDOWN="${TEARDOWN:-$HOME/projects/teardown}"

cd "$TEARDOWN"
node sims/build.mjs auto-live

cp teardown-out/dist/auto-live.html "$HERE/sim.html"
cp sims/auto-shared/model.js \
   sims/auto-shared/car.js \
   sims/auto-shared/overlay.js \
   sims/auto-shared/live.js \
   sims/auto-shared/map.js \
   sims/auto-shared/assetimgs.js \
   sims/auto-shared/README.md "$HERE/src/"

cd "$HERE"

python3 - <<'PY'
import re, pathlib

p = pathlib.Path('sim.html')
s = p.read_text(encoding='utf-8')
s = s.replace('<html lang="en">', '<html lang="it">', 1)
s = re.sub(r'<title>.*?</title>', '<title>Un giorno a scuola · La Scienza Merita</title>', s, count=1)
if 'name="robots"' not in s:
    s = s.replace('<head>', '<head><meta name="robots" content="noindex,nofollow">', 1)
desc = ('Simulazione interattiva: quanta CO2 produce il viaggio casa-scuola, '
        'a seconda del mezzo e del motore.')
if 'name="description"' not in s:
    s = s.replace('<meta charset="utf-8">',
                  f'<meta charset="utf-8">\n<meta name="description" content="{desc}">', 1)
p.write_text(s, encoding='utf-8')
print('sim.html rifinito:', len(s), 'byte')

# la pagina di benvenuto diventa l'ingresso
w = pathlib.Path('welcome.html')
pathlib.Path('index.html').write_text(w.read_text(encoding='utf-8'), encoding='utf-8')
print('index.html = pagina di benvenuto')
PY

echo "Fatto. Apri index.html per la copertina, sim.html per il simulatore."
