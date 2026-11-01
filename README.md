# La Scienza Merita · Il viaggio casa → scuola

Simulatore 3D offline per lezioni sull'effetto serra, 2ª e 3ª media.
Progetto **La Scienza Merita**. Ambiente diurno, scenario cittadino.

**Una pagina sola, `index.html`, senza dipendenze**: si apre col doppio clic, funziona senza rete, si mette su qualsiasi hosting statico.

## Provarlo

Apri `index.html`, oppure servilo in locale:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## Cosa fa

- Auto 3D con motore a 4 cilindri apribile (carrozzeria trasparente, pistoni in movimento)
- Un numero grande: grammi di CO₂ del viaggio
- Tre scelte — benzina, diesel, elettrica — e uno slider per la distanza
- Barre di confronto sempre visibili
- Dimostrazione automatica quando nessuno tocca lo schermo

Tasti: `F` schermo intero (LIM), `H` nasconde l'interfaccia.

Link diretti per preparare i momenti della lezione:

```
index.html?mezzo=elettrica&km=5
index.html?mezzo=benzina&km=5&cut=1
```

## I numeri

Tutti in `src/model.js`:

| Mezzo | Consumo | Fattore |
|---|---|---|
| Benzina | 0,070 L/km | 2.310 g CO₂/L |
| Diesel | 0,055 L/km | 2.640 g CO₂/L |
| Elettrica | 0,160 kWh/km | 310 g CO₂/kWh |

`km × consumo × fattore`. Valori tipici arrotondati per la didattica: il punto
della lezione è il confronto, non la terza cifra decimale.

## Ricostruire

Il simulatore nasce dal progetto [teardown](https://github.com/elvarofficial/teardown).
`src/` è una copia di riferimento; il codice vivo sta nel checkout di teardown.

```bash
./sync.sh          # ricompila e aggiorna index.html + src/
```

## Stato

Versione di prova per la scuola. La pagina è `noindex`: non deve comparire nei
motori di ricerca prima del lancio sul sito del progetto.

## Crediti

Costruito su [teardown](https://github.com/elvarofficial/teardown) di elvarofficial
(MIT), a sua volta su claude-shared [claude-motion](https://github.com/whaleyxbt/claude-motion)
(MIT).
