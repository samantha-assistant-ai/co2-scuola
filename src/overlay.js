// L'interfaccia per la classe: testo grande, italiano semplice, tre scelte.
// Pannelli chiari semitrasparenti: leggono su cielo, palazzi o strada.

const CSS = `
#ui { position: fixed; inset: 0; pointer-events: none; font-family: 'Inter', system-ui, sans-serif; color: #12202c; }
#ui .pannello {
  background: rgba(255,255,255,.82);
  backdrop-filter: blur(14px) saturate(1.1);
  border: 1px solid rgba(255,255,255,.85);
  box-shadow: 0 6px 26px rgba(18,32,44,.1);
  border-radius: 1.8vmin;
}

#ui .titolo { position: absolute; left: 4.2vmin; top: 3.6vmin; max-width: 48vmin; padding: 2.1vmin 2.5vmin; }
#ui .eyebrow { font-size: clamp(11px, 1.35vmin, 16px); letter-spacing: .18em; text-transform: uppercase; color: #c4561c; font-weight: 700; }
#ui h1 { font-size: clamp(22px, 3.5vmin, 44px); line-height: 1.05; margin: .6vmin 0 0; font-weight: 700; letter-spacing: -.02em; color: #0d1a24; }
#ui .domanda { margin-top: 1.4vmin; font-size: clamp(13px, 1.7vmin, 21px); color: rgba(18,32,44,.68); font-weight: 500; }

#ui .scheda { position: absolute; right: 4.2vmin; top: 4.2vmin; width: min(40vmin, 430px); padding: 2.2vmin 2.4vmin; text-align: right; }
#ui .numero .val { font-size: clamp(42px, 8.4vmin, 110px); font-weight: 800; letter-spacing: -.045em; line-height: .92; color: #0d1a24; }
#ui .numero .val small { font-size: .34em; font-weight: 700; letter-spacing: 0; margin-left: .12em; color: #c4561c; }
#ui .numero .cap { margin-top: .8vmin; font-size: clamp(12px, 1.45vmin, 18px); color: rgba(18,32,44,.7); }
#ui .numero .cap b { color: #0d1a24; font-weight: 600; }

#ui .barre { margin-top: 2vmin; }
#ui .barra { margin-top: 1.3vmin; }
#ui .barra .riga { display: flex; justify-content: space-between; font-size: clamp(11px, 1.3vmin, 16px); color: rgba(18,32,44,.72); margin-bottom: .45vmin; font-weight: 500; }
#ui .barra .riga b { color: #0d1a24; font-weight: 700; }
#ui .barra .track { height: 1.05vmin; border-radius: 99px; background: rgba(18,32,44,.12); overflow: hidden; }
#ui .barra .fill { height: 100%; border-radius: 99px; transition: width .35s cubic-bezier(.3,.7,.2,1); }

#ui .controlli {
  position: absolute; left: 4.2vmin; right: 4.2vmin; bottom: 3.2vmin;
  display: flex; gap: 2.2vmin; align-items: flex-end; pointer-events: auto;
  flex-wrap: wrap; padding: 1.6vmin 1.8vmin;
}
#ui .mezzi { display: flex; gap: 1.1vmin; }
#ui .mezzo {
  appearance: none; border: 1px solid rgba(18,32,44,.18); background: rgba(255,255,255,.92);
  color: #12202c; border-radius: 1.4vmin; padding: 1.4vmin 2.1vmin; cursor: pointer;
  font: inherit; font-size: clamp(13px, 1.65vmin, 20px); font-weight: 600; letter-spacing: -.01em;
  display: flex; align-items: center; gap: 1vmin; transition: border-color .15s, background .15s, transform .12s;
}
#ui .mezzo:hover { border-color: rgba(18,32,44,.42); background: #fff; }
#ui .mezzo:active { transform: translateY(1px); }
#ui .mezzo[aria-pressed='true'] { border-color: #c4561c; background: rgba(196,86,28,.14); }

#ui .distanza { flex: 1 1 260px; min-width: 220px; padding-bottom: .2vmin; }
#ui .distanza label { display: block; font-size: clamp(12px, 1.4vmin, 17px); color: rgba(18,32,44,.72); margin-bottom: .6vmin; font-weight: 500; }
#ui .distanza label b { color: #0d1a24; font-weight: 700; }
#ui input[type='range'] { width: 100%; height: 3.2vmin; accent-color: #c4561c; cursor: pointer; }

#ui .nota { position: absolute; left: 4.2vmin; bottom: 16.2vmin; font-size: clamp(10px, 1.2vmin, 14px); color: rgba(18,32,44,.62); max-width: 54vmin; font-weight: 500;
  background: rgba(255,255,255,.7); padding: .7vmin 1.1vmin; border-radius: 1vmin; backdrop-filter: blur(8px); }
#ui .tour { position: absolute; left: 50%; transform: translateX(-50%); bottom: 13.6vmin; font-size: clamp(11px, 1.3vmin, 16px); color: rgba(18,32,44,.62);
  background: rgba(255,255,255,.72); padding: .7vmin 1.4vmin; border-radius: 99px; backdrop-filter: blur(8px); opacity: 0; transition: opacity .4s; }
#ui .tour.on { opacity: 1; }
`;

const MEZZI = [
  {id: 'benzina', label: 'Benzina', ic: '⛽', colore: '#e8743a'},
  {id: 'diesel', label: 'Diesel', ic: '🛢️', colore: '#5b87b3'},
  {id: 'elettrica', label: 'Elettrica', ic: '⚡', colore: '#47b985'},
];

export function createOverlay({onMezzo, onKm, onCut}) {
  if (!document.getElementById('ui-style')) {
    const st = document.createElement('style');
    st.id = 'ui-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  const root = document.createElement('div');
  root.id = 'ui';
  root.innerHTML = `
    <div class="pannello titolo">
      <div class="eyebrow">La Scienza Merita · lezione</div>
      <h1>Il viaggio<br/>casa → scuola</h1>
      <div class="domanda">Quanta CO₂ finisce nell'aria?</div>
    </div>

    <div class="pannello scheda">
      <div class="numero">
        <div class="val"><span id="n">485</span><small>g</small></div>
        <div class="cap">di CO₂ per <b id="km-txt">3 km</b></div>
      </div>
      <div class="barre" id="barre"></div>
    </div>

    <div class="nota" id="nota"></div>
    <div class="tour" id="tour">modalità dimostrazione · tocca per provare</div>

    <div class="pannello controlli">
      <div class="mezzi" id="mezzi"></div>
      <div class="distanza">
        <label>Distanza: <b id="km-lab">3 km</b></label>
        <input id="slider" type="range" min="1" max="12" step="0.5" value="3" />
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const mezziBox = root.querySelector('#mezzi');
  const bottoni = {};
  for (const m of MEZZI) {
    const b = document.createElement('button');
    b.className = 'mezzo';
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span class="ic">${m.ic}</span><span>${m.label}</span>`;
    b.addEventListener('click', () => onMezzo(m.id));
    mezziBox.appendChild(b);
    bottoni[m.id] = b;
  }

  const slider = root.querySelector('#slider');
  slider.addEventListener('input', () => onKm(Number(slider.value)));

  const cut = document.createElement('button');
  cut.className = 'mezzo';
  cut.type = 'button';
  cut.setAttribute('aria-pressed', 'false');
  cut.innerHTML = '<span class="ic">🔧</span><span>Apri il motore</span>';
  cut.style.marginLeft = 'auto';
  cut.addEventListener('click', () => onCut());
  root.querySelector('.controlli').appendChild(cut);

  const barre = root.querySelector('#barre');
  const barreEl = {};
  for (const m of MEZZI) {
    const d = document.createElement('div');
    d.className = 'barra';
    d.innerHTML = `<div class="riga"><span>${m.label}</span><b>0 g</b></div>
      <div class="track"><div class="fill" style="width:0%;background:${m.colore}"></div></div>`;
    barre.appendChild(d);
    barreEl[m.id] = {riga: d.querySelector('b'), fill: d.querySelector('.fill')};
  }

  const n = root.querySelector('#n');
  const kmTxt = root.querySelector('#km-txt');
  const kmLab = root.querySelector('#km-lab');
  const nota = root.querySelector('#nota');
  const tour = root.querySelector('#tour');

  return {
    root,
    update(data) {
      n.textContent = data.totale >= 1000 ? (data.totale / 1000).toFixed(2) : Math.round(data.totale);
      root.querySelector('.numero small').textContent = data.totale >= 1000 ? 'kg' : 'g';
      kmTxt.textContent = `${data.km.toFixed(1).replace('.0', '')} km`;
      kmLab.textContent = `${data.km.toFixed(1).replace('.0', '')} km`;
      if (Number(slider.value) !== data.km) slider.value = data.km;
      for (const m of MEZZI) bottoni[m.id].setAttribute('aria-pressed', String(m.id === data.mezzo));

      const max = Math.max(...MEZZI.map((m) => data.valori[m.id]), 1);
      for (const m of MEZZI) {
        barreEl[m.id].fill.style.width = `${(data.valori[m.id] / max) * 100}%`;
        barreEl[m.id].riga.textContent =
          data.valori[m.id] >= 1000
            ? `${(data.valori[m.id] / 1000).toFixed(2)} kg`
            : `${Math.round(data.valori[m.id])} g`;
      }
      nota.textContent = data.nota;
      cut.setAttribute('aria-pressed', String(!!data.cutaway));
      tour.classList.toggle('on', !!data.tour);
    },
  };
}
