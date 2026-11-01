# Il viaggio casa → scuola

Simulatore per lezioni sull'effetto serra, 2ª e 3ª media.

## Cos'è

Una pagina HTML singola, offline: si apre col doppio clic, funziona senza
internet, anche da chiavetta USB. Dentro c'è un'auto 3D (three.js) con un
motore a 4 cilindri che si può aprire, e un'unica domanda: **quanta CO₂
produce il viaggio?**

## Come si usa

- Tre pulsanti: Benzina, Diesel, Elettrica. Cambiano il numero grande.
- Slider: distanza da 1 a 12 km.
- "Apri il motore": la carrozzeria diventa trasparente e si vede il motore
  che gira (pistoni, albero motore, scoppi).
- Se nessuno tocca niente per 20 secondi parte la dimostrazione automatica.
- `F` = schermo intero (per la LIM), `H` = nascondi l'interfaccia.

## Link diretti per la lezione

Si possono passare parametri nell'URL, utili per preparare dei momenti:

```
auto-live.html?mezzo=elettrica&km=5
auto-live.html?mezzo=benzina&km=5&cut=1
```

## Da dove vengono i numeri

Tutto in `sims/auto-shared/model.js`, in un posto solo:

| Mezzo | Consumo | Fattore |
|---|---|---|
| Benzina | 0,070 L/km | 2.310 g CO₂/L |
| Diesel | 0,055 L/km | 2.640 g CO₂/L |
| Elettrica | 0,160 kWh/km | 310 g CO₂/kWh |

Formula: `km × consumo × fattore`.

Sono valori tipici arrotondati per la didattica, non un dato di omologazione.
Il punto della lezione è il **confronto**, non la terza cifra decimale.

## Ricompilare

```bash
cd ~/projects/teardown
node sims/build.mjs auto-live
# → teardown-out/dist/auto-live.html
```

## Struttura

```
sims/auto-shared/model.js     i numeri e le formule
sims/auto-shared/car.js       l'auto e il motore, costruiti da codice
sims/auto-shared/overlay.js   l'interfaccia in italiano
sims/auto-shared/live.js      scena, luci, strada, interazione
sims/auto-live/main.js        punto d'ingresso
```

## Crediti

Costruito su [teardown](https://github.com/elvarofficial/teardown) di
elvarofficial (MIT), a sua volta su claude-motion (MIT).
