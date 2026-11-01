// L'interfaccia per la classe: testo grande, italiano semplice, tre scelte.
// Pannelli chiari semitrasparenti: leggono su cielo, palazzi o strada.
import {drawMap} from './map.js';

const CSS = `
#ui { position: fixed; inset: 0; pointer-events: none; font-family: 'Inter', system-ui, sans-serif; color: #12202c; }
#ui .pannello {
  background: rgba(255,255,255,.84);
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

/* pannello annuale */
#ui .annuale { position: absolute; left: 4.2vmin; bottom: 15.4vmin; width: min(42vmin, 450px); padding: 2vmin 2.2vmin; }
#ui .annuale .testa { font-size: clamp(11px, 1.3vmin, 16px); letter-spacing: .14em; text-transform: uppercase; color: #c4561c; font-weight: 700; }
#ui .annuale .righe { margin-top: 1.2vmin; }
#ui .annuale .r { display: flex; justify-content: space-between; gap: 1.5vmin; font-size: clamp(12px, 1.45vmin, 18px); color: rgba(18,32,44,.72); padding: .35vmin 0; }
#ui .annuale .r b { color: #0d1a24; font-weight: 700; white-space: nowrap; }
#ui .annuale .tot { margin-top: 1.2vmin; display: flex; align-items: baseline; gap: .5vmin; }
#ui .annuale .tot span { font-size: clamp(28px, 5vmin, 64px); font-weight: 800; letter-spacing: -.04em; line-height: 1; color: #0d1a24; }
#ui .annuale .tot small { font-size: clamp(14px, 2vmin, 26px); font-weight: 700; color: #c4561c; }
#ui .annuale .cap { margin-top: .4vmin; font-size: clamp(10px, 1.15vmin, 14px); color: rgba(18,32,44,.6); font-weight: 500; }

/* mappa */
#ui .mappa { position: absolute; right: 4.2vmin; bottom: 15.4vmin; width: min(38vmin, 410px); padding: 1.1vmin; }
#ui .mappa canvas { display: block; width: 100%; height: auto; border-radius: 1.2vmin; }
#ui .mappa .et { margin: .7vmin .4vmin .2vmin; font-size: clamp(10px, 1.15vmin, 14px); color: rgba(18,32,44,.62); font-weight: 500; }

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

#ui .distanza { flex: 1 1 240px; min-width: 200px; padding-bottom: .2vmin; }
#ui .distanza label { display: block; font-size: clamp(12px, 1.4vmin, 17px); color: rgba(18,32,44,.72); margin-bottom: .6vmin; font-weight: 500; }
#ui .distanza label b { color: #0d1a24; font-weight: 700; }
#ui input[type='range'] { width: 100%; height: 3.2vmin; accent-color: #c4561c; cursor: pointer; }

#ui .tour { position: absolute; left: 50%; transform: translateX(-50%); bottom: 13.6vmin; font-size: clamp(11px, 1.3vmin, 16px); color: rgba(18,32,44,.62);
  background: rgba(255,255,255,.72); padding: .7vmin 1.4vmin; border-radius: 99px; backdrop-filter: blur(8px); opacity: 0; transition: opacity .4s; }
#ui .tour.on { opacity: 1; }
`;

const MEZZI = [
  {id: 'benzina', label: 'Benzina', ic: '⛽', colore: '#e8743a'},
  {id: 'diesel', label: 'Diesel', ic: '🛢️', colore: '#5b87b3'},
  {id: 'elettrica', label: 'Elettrica', ic: '⚡', colore: '#47b985'},
];

const num = (v) => Math.round(v).toLocaleString('it-IT');

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
        <div class="cap">di CO₂ andando a scuola · <b id="km-txt">3 km</b></div>
      </div>
      <div class="barre" id="barre"></div>
    </div>

    <div class="pannello annuale">
      <div class="testa">In un anno di scuola</div>
      <div class="righe">
        <div class="r"><span>Andata e ritorno</span><b id="a-rt">6 km</b></div>
        <div class="r"><span>Giorni di scuola</span><b id="a-giorni">200</b></div>
        <div class="r"><span>Ogni giorno</span><b id="a-giorno">2,9 kg</b></div>
      </div>
      <div class="tot"><span id="a-anno">582</span><small>kg</small></div>
      <div class="cap" id="a-cap">di CO₂ in un anno scolastico</div>
    </div>

    <div class="pannello mappa">
      <canvas id="map"></canvas>
      <div class="et">Il percorso visto dall'alto</div>
    </div>

    <div class="tour" id="tour">modalità dimostrazione · tocca per provare</div>

    <div class="pannello controlli">
      <div class="mezzi" id="mezzi"></div>
      <div class="distanza">
        <label>Distanza di sola andata: <b id="km-lab">3 km</b></label>
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
  const nUnit = root.querySelector('.numero small');
  const kmTxt = root.querySelector('#km-txt');
  const kmLab = root.querySelector('#km-lab');
  const tour = root.querySelector('#tour');
  const mapCanvas = root.querySelector('#map');

  const aRT = root.querySelector('#a-rt');
  const aGiorni = root.querySelector('#a-giorni');
  const aGiorno = root.querySelector('#a-giorno');
  const aAnno = root.querySelector('#a-anno');
  const aCap = root.querySelector('#a-cap');

  return {
    root,
    update(data) {
      n.textContent = data.totale >= 1000 ? (data.totale / 1000).toFixed(2).replace('.', ',') : num(data.totale);
      nUnit.textContent = data.totale >= 1000 ? 'kg' : 'g';
      kmTxt.textContent = `${String(data.km).replace('.', ',')} km`;
      kmLab.textContent = `${String(data.km).replace('.', ',')} km`;
      if (Number(slider.value) !== data.km) slider.value = data.km;
      for (const m of MEZZI) bottoni[m.id].setAttribute('aria-pressed', String(m.id === data.mezzo));

      const max = Math.max(...MEZZI.map((m) => data.valori[m.id]), 1);
      for (const m of MEZZI) {
        barreEl[m.id].fill.style.width = `${(data.valori[m.id] / max) * 100}%`;
        barreEl[m.id].riga.textContent =
          data.valori[m.id] >= 1000
            ? `${(data.valori[m.id] / 1000).toFixed(2).replace('.', ',')} kg`
            : `${num(data.valori[m.id])} g`;
      }

      const a = data.annuale;
      aRT.textContent = `${String(a.andataRitorno).replace('.', ',')} km`;
      aGiorni.textContent = String(data.giorni);
      aGiorno.textContent = a.ogniGiorno >= 1000
        ? `${(a.ogniGiorno / 1000).toFixed(2).replace('.', ',')} kg`
        : `${num(a.ogniGiorno)} g`;
      aAnno.textContent = num(a.anno);
      aCap.textContent = `${data.giorni} giorni × ${String(a.andataRitorno).replace('.', ',')} km · ${data.nota}`;

      cut.setAttribute('aria-pressed', String(!!data.cutaway));
      tour.classList.toggle('on', !!data.tour);

      const w = mapCanvas.clientWidth;
      const h = Math.round(w * 0.66);
      if (w > 0) drawMap(mapCanvas, {km: data.km, t: data.t || 0, larghezza: w, altezza: h});
    },
  };
}
