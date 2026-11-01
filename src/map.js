// La mappa vista dall'alto, disegnata a mano su canvas: griglia di strade
// come una pianta di citta', percorso casa -> scuola proporzionale ai km.
// Nessuna tile, nessuna rete: la mappa e' schematica e offline.

const COL = {
  carta: '#eef1e9',
  isolato: '#e4e8de',
  strada: '#ffffff',
  bordo: '#d5dbd0',
  acqua: '#cfe3ee',
  parco: '#d8e7cf',
  percorso: '#d2622a',
  percorsoBordo: '#ffffff',
  inchiostro: '#22303a',
  tenue: 'rgba(34,48,58,.55)',
};

const COLS = 8;
const ROWS = 6;

function arrotonda(v, passo) {
  return Math.round(v / passo) * passo;
}

/** punti del percorso, allineati alla griglia stradale */
function percorso(km, w, h) {
  const gx = w / COLS;
  const gy = h / ROWS;

  const r = Math.min(1, Math.max(0, (km - 1) / 11)); // 1 km .. 12 km
  const dc = Math.max(1, Math.round((0.12 * w + 0.60 * w * r) / gx));
  const dr = Math.max(1, Math.round((0.16 * h + 0.40 * h * r) / gy));

  const c0 = 1;
  const r0 = 5;
  const c1 = Math.min(COLS - 1, c0 + Math.max(1, Math.floor(dc * 0.45)));
  const r1 = Math.max(1, r0 - Math.max(1, Math.floor(dr * 0.5)));
  const c2 = Math.min(COLS - 1, c0 + dc);
  const r2 = Math.max(0, r0 - dr);

  const p = (c, rr) => [c * gx, rr * gy];
  const punti = [p(c0, r0), p(c1, r0), p(c1, r1), p(c2, r1), p(c2, r2)];
  // se il percorso e' cortissimo evita segmenti sovrapposti
  const puliti = punti.filter((q, i) => i === 0 || q[0] !== punti[i - 1][0] || q[1] !== punti[i - 1][1]);
  return puliti;
}

function lunghezza(punti) {
  let L = 0;
  for (let i = 1; i < punti.length; i++) {
    L += Math.hypot(punti[i][0] - punti[i - 1][0], punti[i][1] - punti[i - 1][1]);
  }
  return L;
}

function puntoA(punti, d) {
  let resto = d;
  for (let i = 1; i < punti.length; i++) {
    const [x0, y0] = punti[i - 1];
    const [x1, y1] = punti[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    if (resto <= seg) {
      const k = seg === 0 ? 0 : resto / seg;
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
    }
    resto -= seg;
  }
  return punti[punti.length - 1];
}

function pinCasa(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = COL.inchiostro;
  ctx.lineWidth = Math.max(1.5, s * 0.1);
  ctx.beginPath();
  ctx.arc(0, 0, s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // tetto
  ctx.fillStyle = COL.inchiostro;
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, -s * 0.05);
  ctx.lineTo(0, -s * 0.55);
  ctx.lineTo(s * 0.5, -s * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-s * 0.34, -s * 0.06, s * 0.68, s * 0.42);
  ctx.restore();
}

function pinScuola(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = COL.percorso;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.5, s * 0.12);
  ctx.beginPath();
  ctx.arc(0, 0, s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-s * 0.45, -s * 0.22, s * 0.9, s * 0.62);
  ctx.fillStyle = COL.percorso;
  ctx.fillRect(-s * 0.08, -s * 0.22, s * 0.16, s * 0.62);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-s * 0.45, -s * 0.42, s * 0.9, s * 0.16);
  ctx.restore();
}

export function drawMap(canvas, {km, t, larghezza, altezza}) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = larghezza;
  const h = altezza;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  // carta
  ctx.fillStyle = COL.carta;
  ctx.fillRect(0, 0, w, h);

  const gx = w / COLS;
  const gy = h / ROWS;

  // isolati
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      ctx.fillStyle = COL.isolato;
      ctx.fillRect(c * gx + 2, r * gy + 2, gx - 4, gy - 4);
    }
  }

  // parco e acqua, fissi: danno l'idea di citta' vera
  ctx.fillStyle = COL.parco;
  ctx.beginPath();
  ctx.roundRect(w * 0.54, h * 0.06, w * 0.24, h * 0.22, 6);
  ctx.fill();
  ctx.fillStyle = COL.acqua;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.90);
  ctx.bezierCurveTo(w * 0.3, h * 0.84, w * 0.55, h * 0.98, w, h * 0.86);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // strade
  ctx.strokeStyle = COL.strada;
  ctx.lineWidth = Math.max(3, gx * 0.22);
  ctx.lineCap = 'round';
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * gx, 0);
    ctx.lineTo(c * gx, h);
    ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * gy);
    ctx.lineTo(w, r * gy);
    ctx.stroke();
  }

  // percorso
  const punti = percorso(km, w, h);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = COL.percorsoBordo;
  ctx.lineWidth = Math.max(8, gx * 0.5);
  ctx.beginPath();
  punti.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();

  ctx.strokeStyle = COL.percorso;
  ctx.lineWidth = Math.max(4, gx * 0.26);
  ctx.beginPath();
  punti.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();

  const L = lunghezza(punti);
  const d = ((t * 0.16) % 1) * L;

  // puntino che viaggia: collega la mappa alla scena 3D
  const [px, py] = puntoA(punti, d);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(px, py, Math.max(4, gx * 0.16), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COL.percorso;
  ctx.beginPath();
  ctx.arc(px, py, Math.max(2.5, gx * 0.1), 0, Math.PI * 2);
  ctx.fill();

  // segnaposti
  const s = Math.max(8, Math.min(gx, gy) * 0.30);
  pinCasa(ctx, punti[0][0], punti[0][1], s);
  const fine = punti[punti.length - 1];
  pinScuola(ctx, fine[0], fine[1], s);

  // etichette
  const fs = Math.max(10, Math.round(h * 0.055));
  ctx.font = `600 ${fs}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = COL.inchiostro;
  ctx.textAlign = 'center';
  ctx.fillText('Casa', punti[0][0], Math.min(h - 4, punti[0][1] + s + fs + 2));
  ctx.fillText('Scuola', fine[0], Math.max(fs, fine[1] - s - 6));
}
