import * as THREE from 'three';

// Un'auto stilizzata, costruita da codice: silhouette estrusa, ruote, e un
// motore a 4 cilindri che si puo' aprire per la lezione.
// Unita': metri. +X = davanti, +Y = su, +Z = destra.

const COLORE_CARROZZERIA = {
  benzina: 0xd8622a,
  diesel: 0x4a6b8a,
  elettrica: 0x3f9c6b,
};

const profilo = () => {
  const p = new THREE.Shape();
  p.moveTo(2.02, 0.28);
  p.lineTo(2.02, 0.66);
  p.lineTo(1.62, 0.80);
  p.lineTo(0.86, 0.84);
  p.lineTo(0.42, 1.30);
  p.lineTo(-0.95, 1.34);
  p.lineTo(-1.52, 1.18);
  p.lineTo(-1.58, 0.92);
  p.lineTo(-1.72, 0.72);
  p.lineTo(-2.02, 0.66);
  p.lineTo(-2.02, 0.28);
  p.closePath();
  return p;
};

export function createCar() {
  const root = new THREE.Group();

  const guscio = new THREE.Group();
  root.add(guscio);

  const vetro = new THREE.MeshPhysicalMaterial({
    color: 0x0a1016,
    roughness: 0.15,
    metalness: 0,
    transparent: true,
    opacity: 0.85,
    clearcoat: 1,
  });

  const carrozzeria = new THREE.MeshPhysicalMaterial({
    color: COLORE_CARROZZERIA.benzina,
    roughness: 0.42,
    metalness: 0.15,
    clearcoat: 0.7,
  });

  const forma = new THREE.ExtrudeGeometry(profilo(), {
    depth: 1.62,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.06,
    bevelSegments: 3,
    curveSegments: 2,
  });
  forma.translate(0, 0, -0.81);
  const corpo = new THREE.Mesh(forma, carrozzeria);
  corpo.castShadow = true;
  guscio.add(corpo);

  // Cristalli laterali: due sagome piatte che seguono la linea del tetto.
  const vetroLato = new THREE.Shape();
  vetroLato.moveTo(-1.18, 0.99);
  vetroLato.lineTo(0.44, 0.99);
  vetroLato.lineTo(0.16, 1.27);
  vetroLato.lineTo(-0.90, 1.29);
  vetroLato.closePath();
  const vg = new THREE.ShapeGeometry(vetroLato);
  for (const z of [-0.876, 0.876]) {
    const m = new THREE.Mesh(vg, vetro);
    m.position.z = z;
    if (z < 0) m.rotation.y = Math.PI;
    guscio.add(m);
  }

  // Fari e fanali: due piccoli blocchi emissivi.
  const faroMat = new THREE.MeshStandardMaterial({
    color: 0xfff6d8,
    emissive: 0xfff0c0,
    emissiveIntensity: 0.5,
  });
  for (const z of [-0.55, 0.55]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.26), faroMat);
    f.position.set(2.03, 0.60, z);
    guscio.add(f);
  }
  const stopMat = new THREE.MeshStandardMaterial({
    color: 0xff3320,
    emissive: 0xff2a12,
    emissiveIntensity: 0.45,
  });
  for (const z of [-0.55, 0.55]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.28), stopMat);
    s.position.set(-2.03, 0.64, z);
    guscio.add(s);
  }

  // Ruote
  const gomma = new THREE.MeshStandardMaterial({color: 0x14161a, roughness: 0.9});
  const cerchio = new THREE.MeshStandardMaterial({color: 0xb9bec6, roughness: 0.35, metalness: 0.85});
  const ruote = [];
  for (const x of [1.35, -1.35]) {
    for (const z of [-0.86, 0.86]) {
      const w = new THREE.Group();
      const g = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 28), gomma);
      g.rotation.x = Math.PI / 2;
      g.castShadow = true;
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.25, 20), cerchio);
      c.rotation.x = Math.PI / 2;
      // razze per far vedere che gira
      for (let i = 0; i < 5; i++) {
        const raggio = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.30, 0.26), cerchio);
        raggio.rotation.z = (i * Math.PI) / 5;
        w.add(raggio);
      }
      w.add(g, c);
      w.position.set(x, 0.34, z);
      root.add(w);
      ruote.push(w);
    }
  }

  // ---- Motore ----
  const motore = new THREE.Group();
  motore.position.set(1.32, 0.44, 0);
  root.add(motore);

  const alluminio = new THREE.MeshStandardMaterial({
    color: 0x9aa3ad,
    roughness: 0.35,
    metalness: 0.9,
  });
  const vetroCilindro = new THREE.MeshPhysicalMaterial({
    color: 0xaad4ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.22,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const pistoneMat = new THREE.MeshStandardMaterial({
    color: 0xe8e2d2,
    roughness: 0.25,
    metalness: 0.8,
  });

  const R = 0.045; // raggio di manovella
  const L = 0.14; // lunghezza biella
  const corsaMax = 0.09;

  // blocco
  const blocco = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.10, 0.50), alluminio);
  blocco.position.y = -0.02;
  motore.add(blocco);

  const cilindri = [];
  const pistoni = [];
  const bielle = [];
  const scoppi = [];
  const zs = [-0.27, -0.09, 0.09, 0.27];
  zs.forEach((z, i) => {
    const liner = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.24, 24, 1, true), vetroCilindro);
    liner.position.set(0, 0.13, z);
    motore.add(liner);
    cilindri.push(liner);

    const testa = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.03, 24), alluminio);
    testa.position.set(0, 0.26, z);
    motore.add(testa);

    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.075, 24), pistoneMat);
    p.position.set(0, 0.10, z);
    motore.add(p);
    pistoni.push(p);

    const biella = new THREE.Mesh(new THREE.BoxGeometry(0.018, L, 0.016), alluminio);
    biella.position.set(0, 0.0, z);
    motore.add(biella);
    bielle.push(biella);

    // flash di scoppio: sfera emissiva che pulsa
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 12),
      new THREE.MeshBasicMaterial({color: 0xffb066, transparent: true, opacity: 0}),
    );
    s.position.set(0, 0.245, z);
    motore.add(s);
    scoppi.push(s);
  });

  // albero motore lungo Z
  const albero = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.72, 16), alluminio);
  albero.rotation.x = Math.PI / 2;
  albero.position.y = -0.085;
  motore.add(albero);
  const manovelle = [];
  for (const z of zs) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.10, 0.03), alluminio);
    m.position.set(0, -0.085, z);
    motore.add(m);
    manovelle.push(m);
  }

  // ordine di scoppio 1-3-4-2
  const FASI = [0, 2, 1, 3].map((n) => {
    const order = [0, 2, 1, 3];
    return (order.indexOf(n) * Math.PI) / 2;
  });

  const stato = {cutaway: 0, colore: 'benzina', acceso: true};

  function setCutaway(k) {
    stato.cutaway = k;
    const opacity = 1 - 0.86 * k;
    carrozzeria.transparent = k > 0.01;
    carrozzeria.opacity = opacity;
    carrozzeria.needsUpdate = true;
    vetro.opacity = 0.85 * (1 - k) + 0.05 * k;
    guscio.visible = k < 0.98;
    motore.scale.setScalar(1 + 0.22 * k);
    motore.position.y = 0.44 + 0.06 * k;
  }

  function setColore(mezzo) {
    stato.colore = mezzo;
    carrozzeria.color.setHex(COLORE_CARROZZERIA[mezzo] ?? COLORE_CARROZZERIA.benzina);
  }

  /** angolo di manovella in radianti */
  function update(angolo, t) {
    // pistoni: cinematica di biella-manovella
    for (let i = 0; i < 4; i++) {
      const th = angolo + (i * Math.PI) / 2;
      const y = R * Math.cos(th) + Math.sqrt(L * L - (R * Math.sin(th)) ** 2);
      const py = 0.13 + (y - (L + R)) - 0.02;
      pistoni[i].position.y = py;
      const dy = 0.13 - py;
      bielle[i].position.set(0, py - 0.04 - dy * 0.5 + 0.0, zs[i]);
      manovelle[i].rotation.z = th;
      // scoppio poco dopo il PMS
      const fase = Math.max(0, Math.cos(th - 0.5));
      scoppi[i].material.opacity = Math.pow(fase, 18) * 0.9;
    }
    albero.rotation.z = angolo;
  }

  function giraRuote(vel) {
    for (const r of ruote) r.rotation.z -= vel;
  }

  return {root, motore, guscio, update, setCutaway, setColore, giraRuote, stato, pistoni};
}
