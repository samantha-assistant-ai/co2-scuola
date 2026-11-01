import * as THREE from 'three';

// Un'auto stilizzata, costruita da codice: silhouette estrusa, ruote, e un
// motore che si puo' aprire. Dentro ci sono un papa' e un bambino.
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

/** una persona seduta: busto + testa, pochi poligoni */
function persona({ pelle, maglia, altezza = 1, z, x }) {
  const g = new THREE.Group();
  const matPelle = new THREE.MeshStandardMaterial({color: pelle, roughness: 0.75});
  const matMaglia = new THREE.MeshStandardMaterial({color: maglia, roughness: 0.85});

  const busto = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.15 * altezza, 0.20 * altezza, 6, 12),
    matMaglia,
  );
  busto.position.y = 0.19 * altezza;
  g.add(busto);

  const testa = new THREE.Mesh(new THREE.SphereGeometry(0.105 * altezza, 16, 14), matPelle);
  testa.position.y = 0.40 * altezza;
  testa.castShadow = true;
  g.add(testa);

  g.position.set(x, 0, z);
  return g;
}

export function createCar() {
  const root = new THREE.Group();

  const guscio = new THREE.Group();
  root.add(guscio);

  const vetro = new THREE.MeshPhysicalMaterial({
    color: 0xa8c8dd,
    roughness: 0.08,
    metalness: 0,
    transparent: true,
    opacity: 0.34,
    clearcoat: 1,
    side: THREE.DoubleSide,
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

  // Fari e fanali
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
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.28), stopMat);
    st.position.set(-2.03, 0.64, z);
    guscio.add(st);
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

  // ---- passeggeri ----
  const papa = persona({pelle: 0xd9a97f, maglia: 0x3f6285, altezza: 1.0, x: 0.10, z: 0.40});
  const bimbo = persona({pelle: 0xe0b48c, maglia: 0xd2622a, altezza: 0.72, x: -0.62, z: 0.40});
  papa.position.y = 0.72;
  bimbo.position.y = 0.70;
  root.add(papa, bimbo);

  // ---- motore ----
  const motore = new THREE.Group();
  motore.position.set(1.32, 0.44, 0);
  root.add(motore);

  const alluminio = new THREE.MeshStandardMaterial({
    color: 0xb7bfc7,
    roughness: 0.48,
    metalness: 0.45,
  });
  const vetroCilindro = new THREE.MeshPhysicalMaterial({
    color: 0xaad4ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.2,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const pistoneMat = new THREE.MeshStandardMaterial({
    color: 0xe8e2d2,
    roughness: 0.25,
    metalness: 0.8,
  });
  const rame = new THREE.MeshStandardMaterial({color: 0xc8763a, roughness: 0.4, metalness: 0.8});

  const R = 0.05; // raggio di manovella
  const L = 0.15; // lunghezza biella
  const zs = [-0.27, -0.09, 0.09, 0.27];

  const combustione = new THREE.Group();
  motore.add(combustione);

  const blocco = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.10, 0.50), alluminio);
  blocco.position.y = -0.02;
  combustione.add(blocco);

  const pistoni = [];
  const bielle = [];
  const scoppi = [];
  const manovelle = [];

  zs.forEach((z) => {
    const liner = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.24, 24, 1, true), vetroCilindro);
    liner.position.set(0, 0.13, z);
    combustione.add(liner);

    const testa = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.03, 24), alluminio);
    testa.position.set(0, 0.26, z);
    combustione.add(testa);

    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.075, 24), pistoneMat);
    p.position.set(0, 0.10, z);
    combustione.add(p);
    pistoni.push(p);

    const biella = new THREE.Mesh(new THREE.BoxGeometry(0.018, L, 0.016), alluminio);
    biella.position.set(0, 0.0, z);
    combustione.add(biella);
    bielle.push(biella);

    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 12),
      new THREE.MeshBasicMaterial({color: 0xffb066, transparent: true, opacity: 0}),
    );
    s.position.set(0, 0.245, z);
    combustione.add(s);
    scoppi.push(s);

    // manovella: disco con perno eccentrico, cosi' il moto si vede
    const g = new THREE.Group();
    g.position.set(0, -0.085, z);
    const disco = new THREE.CylinderGeometry(0.052, 0.052, 0.02, 20);
    disco.rotateX(Math.PI / 2);
    const d = new THREE.Mesh(disco, alluminio);
    g.add(d);
    const perno = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.034, 12), pistoneMat);
    perno.geometry.rotateX(Math.PI / 2);
    perno.position.y = R;
    g.add(perno);
    combustione.add(g);
    manovelle.push(g);
  });

  const albero = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.72, 16), alluminio);
  albero.geometry.rotateX(Math.PI / 2);
  albero.position.y = -0.085;
  combustione.add(albero);

  // ventola davanti: gira sempre, si vede subito che il motore e' acceso
  const ventola = new THREE.Group();
  ventola.position.set(-0.26, 0.08, 0);
  for (let i = 0; i < 5; i++) {
    const pala = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.09, 0.035), alluminio);
    pala.position.y = 0.055;
    pala.rotation.z = (i * Math.PI * 2) / 5;
    const holder = new THREE.Group();
    holder.rotation.x = (i * Math.PI * 2) / 5;
    holder.add(pala);
    ventola.add(holder);
  }
  ventola.rotation.x = Math.PI / 2;
  combustione.add(ventola);

  // ---- motore elettrico ----
  const elettrico = new THREE.Group();
  elettrico.visible = false;
  const statoreGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.34, 24);
  statoreGeo.rotateX(Math.PI / 2);
  const statore = new THREE.Mesh(statoreGeo, alluminio);
  statore.position.set(0, 0.12, 0);
  elettrico.add(statore);

  const rotoreGeo = new THREE.CylinderGeometry(0.062, 0.062, 0.37, 20);
  rotoreGeo.rotateX(Math.PI / 2);
  const rotore = new THREE.Mesh(rotoreGeo, rame);
  rotore.position.set(0, 0.12, 0);
  elettrico.add(rotore);

  // alette del rotore, per vedere la rotazione
  for (let i = 0; i < 6; i++) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.115, 0.02), pistoneMat);
    a.position.set(0, 0.12, 0);
    a.rotation.z = (i * Math.PI) / 3;
    elettrico.add(a);
    rotore.userData.alette = rotore.userData.alette || [];
    rotore.userData.alette.push(a);
  }
  motore.add(elettrico);

  const stato = {cutaway: 0, colore: 'benzina', mezzo: 'benzina'};

  function setCutaway(k) {
    stato.cutaway = k;
    carrozzeria.transparent = k > 0.01;
    carrozzeria.opacity = 1 - 0.86 * k;
    carrozzeria.needsUpdate = true;
    vetro.opacity = 0.34 * (1 - k) + 0.05 * k;
    guscio.visible = k < 0.98;
    // vista esplosa: il motore sale e si ingrandisce
    motore.scale.setScalar(1 + 0.1 * k);
    motore.position.y = 0.44 + 0.3 * k;
  }

  function setColore(mezzo) {
    stato.colore = mezzo;
    carrozzeria.color.setHex(COLORE_CARROZZERIA[mezzo] ?? COLORE_CARROZZERIA.benzina);
  }

  function setMotore(mezzo) {
    stato.mezzo = mezzo;
    const elettrica = mezzo === 'elettrica';
    combustione.visible = !elettrica;
    elettrico.visible = elettrica;
  }

  /** angolo di manovella in radianti */
  function update(angolo) {
    if (stato.mezzo === 'elettrica') {
      rotore.rotation.z = angolo;
      for (const a of rotore.userData.alette || []) a.rotation.z = angolo + (a.userData.base ?? 0);
      return;
    }
    for (let i = 0; i < 4; i++) {
      const th = angolo + (i * Math.PI) / 2;
      const y = R * Math.cos(th) + Math.sqrt(L * L - (R * Math.sin(th)) ** 2);
      const py = 0.13 + (y - (L + R)) - 0.02;
      pistoni[i].position.y = py;
      bielle[i].position.y = py - 0.055;
      manovelle[i].rotation.z = th;
      const fase = Math.max(0, Math.cos(th - 0.5));
      scoppi[i].material.opacity = Math.pow(fase, 18) * 0.9;
    }
    albero.rotation.z = angolo;
    ventola.rotation.z = angolo * 1.6;
  }

  function giraRuote(vel) {
    for (const r of ruote) r.rotation.z -= vel;
  }

  return {root, motore, guscio, update, setCutaway, setColore, setMotore, giraRuote, stato, pistoni};
}
