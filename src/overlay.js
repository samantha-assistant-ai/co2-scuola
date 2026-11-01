// L'interfaccia per la classe: testo grande, italiano semplice, scelte a bottoni.
// Stile da manuale illustrato: carta, angoli morbidi, colori pieni.
import {drawMap} from './map.js';
import {MEZZI, MOTORI} from './model.js';
import {SCIENZA, ELEFANTE, STEMISTA, LUCA} from './assetimgs.js';

const CSS = `
#ui { position: fixed; inset: 0; pointer-events: none; font-family: 'Inter', system-ui, sans-serif; color: #1b2a4a; }
#ui .pannello {
  background: rgba(255,252,244,.92);
  backdrop-filter: blur(14px) saturate(1.1);
  border: 2px solid rgba(27,42,74,.9);
  box-shadow: 5px 5px 0 rgba(27,42,74,.14);
  border-radius: 2.2vmin;
}

/* --- titolo con i loghi --- */
#ui .titolo { position: absolute; left: 3.6vmin; top: 3.2vmin; max-width: 50vmin; padding: 1.8vmin 2.2vmin; transform: rotate(-.5deg); }
#ui .loghi { display: flex; gap: .8vmin; align-items: center; margin-bottom: 1.1vmin; flex-wrap: wrap; }
#ui .logo-chip { background: #fff; border: 1.5px solid rgba(27,42,74,.16); border-radius: 1vmin; padding: .45vmin .7vmin; display: flex; align-items: center; }
#ui .loghi img { height: 3.9vmin; width: auto; display: block; border-radius: .5vmin; }
#ui h1 { font-size: clamp(21px, 3.3vmin, 42px); line-height: 1.04; margin: 0; font-weight: 800; letter-spacing: -.025em; color: #1b2a4a; }
#ui h1 em { font-style: normal; color: #c8322a; }
#ui .domanda { margin-top: 1vmin; font-size: clamp(12px, 1.6vmin, 20px); color: rgba(27,42,74,.7); font-weight: 600; }

/* --- scheda numero --- */
#ui .scheda { position: absolute; right: 3.6vmin; top: 3.2vmin; width: min(40vmin, 430px); padding: 1.6vmin 2.1vmin 2vmin; text-align: right; transform: rotate(.5deg); }
#ui .scheda .testata {
  font-size: clamp(11px, 1.35vmin, 16px); letter-spacing: .16em; text-transform: uppercase;
  font-weight: 800; color: #c8322a; margin-bottom: .6vmin;
}
#ui .numero .val { font-size: clamp(40px, 8vmin, 104px); font-weight: 800; letter-spacing: -.045em; line-height: .92; color: #1b2a4a; }
#ui .numero .val small { font-size: .34em; font-weight: 800; letter-spacing: 0; margin-left: .1em; color: #e08a12; }
#ui .numero .cap { margin-top: .5vmin; font-size: clamp(11px, 1.4vmin, 17px); color: rgba(27,42,74,.72); font-weight: 600; }
#ui .numero .cap b { color: #1b2a4a; }

#ui .barre { margin-top: 1.6vmin; }
#ui .barra { margin-top: 1vmin; }
#ui .barra .riga { display: flex; justify-content: space-between; font-size: clamp(10px, 1.25vmin, 15px); color: rgba(27,42,74,.74); margin-bottom: .4vmin; font-weight: 700; }
#ui .barra .riga b { color: #1b2a4a; }
#ui .barra .track { height: 1vmin; border-radius: 99px; background: rgba(27,42,74,.12); overflow: hidden; }
#ui .barra .fill { height: 100%; border-radius: 99px; transition: width .4s cubic-bezier(.3,.7,.2,1); }
#ui .barra.attiva .riga { color: #1b2a4a; }

/* --- pannello annuale --- */
#ui .annuale { position: absolute; left: 3.6vmin; bottom: 22vmin; width: min(42vmin, 460px); padding: 1.6vmin 2.1vmin; transform: rotate(-.6deg); }
#ui .annuale .testa { font-size: clamp(11px, 1.3vmin, 15px); letter-spacing: .14em; text-transform: uppercase; color: #c8322a; font-weight: 800; }
#ui .annuale .righe { margin-top: .8vmin; }
#ui .annuale .r { display: flex; justify-content: space-between; gap: 1.5vmin; font-size: clamp(11px, 1.4vmin, 17px); color: rgba(27,42,74,.76); padding: .25vmin 0; font-weight: 600; }
#ui .annuale .r b { color: #1b2a4a; font-weight: 800; white-space: nowrap; }
#ui .annuale .tot { margin-top: .8vmin; display: flex; align-items: baseline; gap: .5vmin; }
#ui .annuale .tot span { font-size: clamp(26px, 4.6vmin, 58px); font-weight: 800; letter-spacing: -.04em; line-height: 1; color: #1b2a4a; }
#ui .annuale .tot small { font-size: clamp(13px, 1.9vmin, 24px); font-weight: 800; color: #e08a12; }
#ui .alberi {
  margin-top: 1.1vmin; padding-top: 1vmin; border-top: 2px dashed rgba(27,42,74,.2);
  display: flex; gap: .8vmin; align-items: flex-start;
  font-size: clamp(11px, 1.35vmin, 17px); color: rgba(27,42,74,.82); font-weight: 600; line-height: 1.35;
}
#ui .alberi .ico { font-size: 1.5em; line-height: 1; }
#ui .bosco { display: flex; flex-wrap: wrap; gap: .2vmin; margin-top: .6vmin; max-width: 100%; }
#ui .bosco svg { width: 2.1vmin; height: 2.6vmin; }
#ui .bosco .piu { font-size: clamp(10px, 1.2vmin, 15px); font-weight: 800; color: #2f6b34; align-self: flex-end; margin-left: .4vmin; }
#ui .classe { margin-top: .7vmin; font-size: clamp(10px, 1.25vmin, 16px); font-weight: 700; color: #1b2a4a;
  background: rgba(246,196,69,.38); border: 1.5px solid rgba(27,42,74,.18); border-radius: 1vmin; padding: .5vmin .8vmin; }
#ui .alberi b { color: #2f6b34; font-weight: 800; }
#ui .annuale .cap { margin-top: .5vmin; font-size: clamp(9px, 1.05vmin, 13px); color: rgba(27,42,74,.55); font-weight: 600; }

/* --- mappa --- */
#ui .mappa { position: absolute; right: 3.6vmin; bottom: 22vmin; width: min(36vmin, 400px); padding: 1vmin; transform: rotate(.6deg); }
#ui .mappa canvas { display: block; width: 100%; height: auto; border-radius: 1.4vmin; }
#ui .mappa .et { margin: .6vmin .4vmin .1vmin; font-size: clamp(9px, 1.1vmin, 13px); color: rgba(27,42,74,.6); font-weight: 700; }

/* --- Luca --- */
#ui .luca { position: absolute; left: 1.2vmin; top: 25.5vmin; height: 20.5vmin; width: auto;
  filter: drop-shadow(0 6px 14px rgba(27,42,74,.22)); transform: rotate(-1.5deg); }

/* --- controlli --- */
#ui .controlli {
  position: absolute; left: 3.6vmin; right: 3.6vmin; bottom: 2.8vmin;
  display: flex; flex-direction: column; gap: 1vmin; pointer-events: auto;
  padding: 1.3vmin 1.6vmin;
}
#ui .fila { display: flex; align-items: center; gap: 1.6vmin; flex-wrap: wrap; }
#ui .etichetta { font-size: clamp(10px, 1.2vmin, 15px); font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: rgba(27,42,74,.5); min-width: 9vmin; }
#ui .chips { display: flex; gap: .9vmin; flex-wrap: wrap; }
#ui .chip {
  appearance: none; border: 2px solid rgba(27,42,74,.28); background: #fffdf8;
  color: #1b2a4a; border-radius: 1.4vmin; padding: 1vmin 1.6vmin; cursor: pointer;
  font: inherit; font-size: clamp(12px, 1.5vmin, 19px); font-weight: 700; letter-spacing: -.01em;
  display: flex; align-items: center; gap: .7vmin; transition: transform .12s, border-color .15s, background .15s, box-shadow .15s;
}
#ui .chip:hover:not(:disabled) { border-color: rgba(27,42,74,.6); transform: translateY(-1px); }
#ui .chip[aria-pressed='true'] { border-color: #1b2a4a; background: #ffe9a8; box-shadow: 3px 3px 0 rgba(27,42,74,.18); }
#ui .chip:disabled { opacity: .35; cursor: not-allowed; }
#ui .chip .ic { font-size: 1.15em; line-height: 1; }

#ui .distanza { flex: 1 1 200px; min-width: 180px; }
#ui .distanza label { display: block; font-size: clamp(10px, 1.25vmin, 15px); color: rgba(27,42,74,.66); margin-bottom: .4vmin; font-weight: 700; }
#ui .distanza label b { color: #1b2a4a; }
#ui input[type='range'] { width: 100%; height: 2.6vmin; accent-color: #e08a12; cursor: pointer; }

#ui .tour { position: absolute; left: 50%; transform: translateX(-50%); bottom: 20.4vmin; font-size: clamp(10px, 1.2vmin, 15px); color: rgba(27,42,74,.6);
  background: rgba(255,252,244,.85); padding: .6vmin 1.3vmin; border-radius: 99px; border: 1px solid rgba(27,42,74,.15);
  font-weight: 700; opacity: 0; transition: opacity .4s; }
#ui .tour.on { opacity: 1; }
`;

const num = (v) => Math.round(v).toLocaleString('it-IT');

export function createOverlay({onMezzo, onMotore, onKm, onCut, onToggleAudio}) {
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
      <div class="loghi">
        <span class="logo-chip"><img src="${SCIENZA}" alt="La Scienza Merita" /></span>
        <span class="logo-chip"><img src="${STEMISTA}" alt="Stemista Ribelle" /></span>
        <span class="logo-chip"><img src="${ELEFANTE}" alt="L'Elefante Invisibile" /></span>
      </div>
      <h1>Il viaggio<br/>casa → scuola</h1>
      <div class="domanda">Quanta CO₂ finisce nell'aria?</div>
    </div>

    <img class="luca" src="${LUCA}" alt="Luca indica il risultato" />

    <div class="pannello scheda">
      <div class="testata">Un giorno a scuola</div>
      <div class="numero">
        <div class="val"><span id="n">485</span><small>g</small></div>
        <div class="cap">di CO₂ nel viaggio · <b id="km-txt">3 km</b></div>
      </div>
      <div class="barre" id="barre"></div>
    </div>

    <div class="pannello annuale">
      <div class="testa">In un anno di scuola</div>
      <div class="righe">
        <div class="r"><span>Andata e ritorno</span><b id="a-rt">6 km</b></div>
        <div class="r"><span>Giorni di scuola</span><b id="a-giorni">200</b></div>
        <div class="r"><span>Ogni giorno</span><b id="a-giorno">970 g</b></div>
      </div>
      <div class="tot"><span id="a-anno">194</span><small>kg</small></div>
      <div class="bosco" id="bosco"></div>
      <div class="alberi"><span class="ico">🌳</span><span>Per assorbirla servirebbero <b id="a-alberi">10</b> alberi adulti, per un anno intero.</span></div>
      <div class="classe" id="classe"></div>
      <div class="cap" id="a-cap"></div>
    </div>

    <div class="pannello mappa">
      <canvas id="map"></canvas>
      <div class="et">Il percorso visto dall'alto</div>
    </div>

    <div class="tour" id="tour">modalità dimostrazione · tocca per provare</div>

    <div class="pannello controlli">
      <div class="fila">
        <span class="etichetta">Mezzo</span>
        <div class="chips" id="mezzi"></div>
      </div>
      <div class="fila">
        <span class="etichetta">Motore</span>
        <div class="chips" id="motori"></div>
        <div class="distanza">
          <label>Distanza di sola andata: <b id="km-lab">3 km</b></label>
          <input id="slider" type="range" min="1" max="12" step="0.5" value="3" />
        </div>
        <button class="chip" id="cut" type="button" aria-pressed="false">🔧 <span>Apri il motore</span></button>
        <button class="chip" id="audio" type="button" aria-pressed="true">🔊 <span>Audio</span></button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const mezziBox = root.querySelector('#mezzi');
  const bottoniMezzo = {};
  for (const [id, m] of Object.entries(MEZZI)) {
    const b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span class="ic">${m.ic}</span><span>${m.nome}</span>`;
    b.addEventListener('click', () => onMezzo(id));
    mezziBox.appendChild(b);
    bottoniMezzo[id] = b;
  }

  const motoriBox = root.querySelector('#motori');
  const bottoniMotore = {};
  for (const [id, m] of Object.entries(MOTORI)) {
    const b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span>${m.nome}</span>`;
    b.addEventListener('click', () => onMotore(id));
    motoriBox.appendChild(b);
    bottoniMotore[id] = b;
  }

  const slider = root.querySelector('#slider');
  slider.addEventListener('input', () => onKm(Number(slider.value)));

  const cut = root.querySelector('#cut');
  cut.addEventListener('click', () => onCut());

  const audioBtn = root.querySelector('#audio');
  audioBtn.addEventListener('click', () => {
    const on = onToggleAudio ? onToggleAudio() : true;
    audioBtn.setAttribute('aria-pressed', String(on));
    audioBtn.innerHTML = `${on ? '🔊' : '🔇'} <span>Audio</span>`;
  });

  const barre = root.querySelector('#barre');
  const barreEl = {};
  for (const [id, m] of Object.entries(MEZZI)) {
    const d = document.createElement('div');
    d.className = 'barra';
    d.innerHTML = `<div class="riga"><span>${m.ic} ${m.nome}</span><b>0 g</b></div>
      <div class="track"><div class="fill" style="width:0%;background:#9aa4b2"></div></div>`;
    barre.appendChild(d);
    barreEl[id] = {riga: d.querySelector('b'), fill: d.querySelector('.fill'), box: d};
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
  const aAlberi = root.querySelector('#a-alberi');
  const bosco = root.querySelector('#bosco');
  const classe = root.querySelector('#classe');

  const ALBERO_SVG = '<svg viewBox="0 0 20 24" aria-hidden="true"><rect x="8.6" y="15" width="2.8" height="8" rx="1" fill="#8a6242"/><path d="M10 1.5 17.5 14h-15z" fill="#3f8a45"/><path d="M10 7 16 17H4z" fill="#4f9d52"/></svg>';
  let ultimiAlberi = -1;
  const aCap = root.querySelector('#a-cap');

  return {
    root,
    update(data) {
      const grande = data.totale >= 1000;
      n.textContent = grande ? (data.totale / 1000).toFixed(2).replace('.', ',') : num(data.totale);
      nUnit.textContent = grande ? 'kg' : 'g';
      kmTxt.textContent = `${String(data.km).replace('.', ',')} km`;
      kmLab.textContent = `${String(data.km).replace('.', ',')} km`;
      if (Number(slider.value) !== data.km) slider.value = data.km;

      for (const id of Object.keys(MEZZI)) {
        bottoniMezzo[id].setAttribute('aria-pressed', String(id === data.mezzo));
      }
      const disponibili = MEZZI[data.mezzo].motori;
      for (const id of Object.keys(MOTORI)) {
        const b = bottoniMotore[id];
        const ok = disponibili.includes(id);
        b.disabled = !ok;
        b.setAttribute('aria-pressed', String(ok && id === data.motore));
      }

      const max = Math.max(...Object.values(data.valori), 1);
      for (const [id, m] of Object.entries(MEZZI)) {
        const v = data.valori[id];
        barreEl[id].fill.style.width = `${v === 0 ? 0 : Math.max(2, (v / max) * 100)}%`;
        barreEl[id].fill.style.background = v === 0 ? '#47b985' : (id === data.mezzo ? '#e08a12' : '#9aa4b2');
        barreEl[id].riga.textContent = v >= 1000
          ? `${(v / 1000).toFixed(2).replace('.', ',')} kg`
          : `${num(v)} g`;
        barreEl[id].box.classList.toggle('attiva', id === data.mezzo);
      }

      const a = data.annuale;
      aRT.textContent = `${String(a.andataRitorno).replace('.', ',')} km`;
      aGiorni.textContent = String(data.giorni);
      aGiorno.textContent = a.ogniGiorno >= 1000
        ? `${(a.ogniGiorno / 1000).toFixed(2).replace('.', ',')} kg`
        : `${num(a.ogniGiorno)} g`;
      aAnno.textContent = num(a.anno);
      aAlberi.textContent = data.alberi === 0 ? '0' : num(data.alberi);

      if (data.alberi !== ultimiAlberi) {
        ultimiAlberi = data.alberi;
        const mostra = Math.min(data.alberi, 60);
        let html = ALBERO_SVG.repeat(mostra);
        if (data.alberi > mostra) html += `<span class="piu">+${num(data.alberi - mostra)}</span>`;
        bosco.innerHTML = html;
        classe.innerHTML = `E per tutta la classe? Con <b>20</b> ragazzi servirebbero <b>${num(data.alberiClasse)}</b> alberi.`;
      }
      aCap.textContent = `${data.giorni} giorni × ${String(a.andataRitorno).replace('.', ',')} km · ${data.nota}`;

      cut.setAttribute('aria-pressed', String(!!data.cutaway));
      tour.classList.toggle('on', !!data.tour);

      const w = mapCanvas.clientWidth;
      const h = Math.round(w * 0.66);
      if (w > 0) drawMap(mapCanvas, {km: data.km, t: data.t || 0, larghezza: w, altezza: h});
    },
  };
}
