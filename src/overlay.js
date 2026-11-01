// L'interfaccia per la classe: testo grande, italiano semplice, tre scelte.
// Niente gergo tecnico: chi ha 12 anni deve capire in tre secondi.

const CSS = `
#ui { position: fixed; inset: 0; pointer-events: none; font-family: 'Inter', system-ui, sans-serif; color: #f4f1ea; }
#ui .titolo { position: absolute; left: 4.2vmin; top: 3.6vmin; max-width: 46vmin; }
#ui .eyebrow { font-size: clamp(11px, 1.35vmin, 16px); letter-spacing: .18em; text-transform: uppercase; color: #ffb27a; font-weight: 600; }
#ui h1 { font-size: clamp(22px, 3.6vmin, 46px); line-height: 1.05; margin: .6vmin 0 0; font-weight: 700; letter-spacing: -.02em; }
#ui .domanda { margin-top: 1.4vmin; font-size: clamp(13px, 1.75vmin, 22px); color: rgba(244,241,234,.68); font-weight: 400; }

#ui .numero {
  position: absolute; right: 4.2vmin; top: 6vmin; text-align: right;
}
#ui .numero .val { font-size: clamp(42px, 9vmin, 118px); font-weight: 800; letter-spacing: -.045em; line-height: .92; color: #fff; }
#ui .numero .val small { font-size: .34em; font-weight: 600; letter-spacing: 0; margin-left: .12em; color: #ffb27a; }
#ui .numero .cap { margin-top: 1vmin; font-size: clamp(12px, 1.5vmin, 18px); color: rgba(244,241,234,.72); }
#ui .numero .cap b { color: #fff; font-weight: 600; }

#ui .controlli {
  position: absolute; left: 4.2vmin; right: 4.2vmin; bottom: 3.4vmin;
  display: flex; gap: 2.4vmin; align-items: flex-end; pointer-events: auto;
  flex-wrap: wrap;
}
#ui .mezzi { display: flex; gap: 1.2vmin; }
#ui .mezzo {
  appearance: none; border: 1px solid rgba(244,241,234,.22); background: rgba(12,14,18,.72);
  color: #f4f1ea; border-radius: 1.6vmin; padding: 1.5vmin 2.2vmin; cursor: pointer;
  font: inherit; font-size: clamp(13px, 1.7vmin, 21px); font-weight: 600; letter-spacing: -.01em;
  display: flex; align-items: center; gap: 1vmin; transition: border-color .15s, background .15s, transform .12s;
  backdrop-filter: blur(8px);
}
#ui .mezzo:hover { border-color: rgba(244,241,234,.45); }
#ui .mezzo:active { transform: translateY(1px); }
#ui .mezzo[aria-pressed='true'] { border-color: #ffb27a; background: rgba(255,178,122,.16); }
#ui .mezzo .ic { font-size: 1.25em; line-height: 1; }

#ui .distanza { flex: 1 1 260px; min-width: 220px; }
#ui .distanza label { display: block; font-size: clamp(12px, 1.5vmin, 18px); color: rgba(244,241,234,.72); margin-bottom: .8vmin; }
#ui .distanza label b { color: #fff; }
#ui input[type='range'] { width: 100%; height: 3.6vmin; accent-color: #ffb27a; cursor: pointer; }

#ui .barre { position: absolute; right: 4.2vmin; top: 26vmin; width: min(34vmin, 380px); pointer-events: none; }
#ui .barra { margin-bottom: 1.5vmin; }
#ui .barra .riga { display: flex; justify-content: space-between; font-size: clamp(11px, 1.35vmin, 16px); color: rgba(244,241,234,.66); margin-bottom: .5vmin; }
#ui .barra .riga b { color: #fff; font-weight: 600; }
#ui .barra .track { height: 1.1vmin; border-radius: 99px; background: rgba(244,241,234,.12); overflow: hidden; }
#ui .barra .fill { height: 100%; border-radius: 99px; transition: width .35s cubic-bezier(.3,.7,.2,1); }

#ui .nota { position: absolute; left: 4.2vmin; bottom: 15.5vmin; font-size: clamp(10px, 1.2vmin, 14px); color: rgba(244,241,234,.42); max-width: 52vmin; }
#ui .tour { position: absolute; left: 50%; transform: translateX(-50%); bottom: 13.2vmin; font-size: clamp(11px, 1.3vmin, 16px); color: rgba(244,241,234,.5); opacity: 0; transition: opacity .4s; }
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
    <div class="titolo">
      <div class="eyebrow">Lezione · effetto serra</div>
      <h1>Il viaggio<br/>casa → scuola</h1>
      <div class="domanda">Quanta CO₂ finisce nell'aria?</div>
    </div>
    <div class="numero">
      <div class="val"><span id="n">486</span><small>g</small></div>
      <div class="cap">di CO₂ per <b id="km-txt">3 km</b></div>
    </div>
    <div class="barre" id="barre"></div>
    <div class="nota" id="nota"></div>
    <div class="tour" id="tour">modalità dimostrazione · tocca per provare</div>
    <div class="controlli">
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
