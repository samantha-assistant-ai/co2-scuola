import * as THREE from 'three';

// Auto costruita da codice. Tre carrozzerie distinte (utilitaria, media, SUV),
// motore apribile con la scritta sul cofano, passeggeri seduti, fumo dallo scarico.
// Unita': metri. +X = davanti, +Y = su, +Z = destra.

const COLORE_CARROZZERIA = {
  benzina: 0xd8622a,
  diesel: 0x4a6b8a,
  ibrido: 0x7a63b8,
  elettrica: 0x3f9c6b,
};

// ---- sagome ----
// punti in sezione (x = lunghezza, y = altezza), estrusi lungo z
const SAGOME = {
  utilitaria: {
    profondita: 1.56,
    punti: [
      [1.58, 0.34], [1.58, 0.74], [1.42, 0.94], [0.92, 0.98],
      [0.58, 1.52], [-0.74, 1.54], [-1.28, 1.38], [-1.34, 0.76],
      [-1.58, 0.70], [-1.58, 0.34],
    ],
    vetro: [[-1.24, 1.02], [0.60, 1.02], [0.34, 1.46], [-0.86, 1.48]],
    ruote: {x: 1.12, z: 0.74, r: 0.30},
    cofano: [1.02, 1.02, 0],
  },
  media: {
    profondita: 1.62,
    punti: [
      [2.02, 0.28], [2.02, 0.66], [1.62, 0.80], [0.86, 0.84],
      [0.42, 1.30], [-0.95, 1.34], [-1.52, 1.18], [-1.58, 0.92],
      [-1.72, 0.72], [-2.02, 0.66], [-2.02, 0.28],
    ],
    vetro: [[-1.18, 0.99], [0.44, 0.99], [0.16, 1.27], [-0.90, 1.29]],
    ruote: {x: 1.35, z: 0.86, r: 0.34},
    cofano: [1.30, 0.92, 0],
  },
  suv: {
    profondita: 1.88,
    punti: [
      [2.26, 0.52], [2.26, 1.00], [2.02, 1.16], [0.98, 1.18],
      [0.66, 1.76], [-1.06, 1.80], [-1.62, 1.62], [-1.72, 1.12],
      [-2.18, 1.06], [-2.26, 0.88], [-2.26, 0.52],
    ],
    vetro: [[-1.36, 1.28], [0.88, 1.24], [0.62, 1.70], [-0.98, 1.72]],
    ruote: {x: 1.52, z: 0.92, r: 0.38},
    cofano: [1.66, 1.26, 0],
  },
};

function formaDaPunti(punti) {
  const s = new THREE.Shape();
  s.moveTo(punti[0][0], punti[0][1]);
  for (let i = 1; i < punti.length; i++) s.lineTo(punti[i][0], punti[i][1]);
  s.closePath();
  return s;
}

/** una persona seduta: testa con capelli, spalle, busto, braccia */
function persona({pelle, maglia, capelli, altezza = 1, x = 0, z = 0}) {
  const g = new THREE.Group();

  const mPelle = new THREE.MeshStandardMaterial({color: pelle, roughness: 0.72});
  const mMaglia = new THREE.MeshStandardMaterial({color: maglia, roughness: 0.86});
  const mCapelli = new THREE.MeshStandardMaterial({color: capelli, roughness: 0.92});

  // busto leggermente svasato
  const busto = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * altezza, 0.17 * altezza, 0.46 * altezza, 14), mMaglia);
  busto.position.y = 0.23 * altezza;
  g.add(busto);

  // spalle
  const spalle = new THREE.Mesh(new THREE.SphereGeometry(0.16 * altezza, 14, 10), mMaglia);
  spalle.scale.set(1.15, 0.62, 0.8);
  spalle.position.y = 0.44 * altezza;
  g.add(spalle);

  // braccia appoggiate avanti
  for (const lato of [-1, 1]) {
    const braccio = new THREE.Mesh(new THREE.CapsuleGeometry(0.035 * altezza, 0.26 * altezza, 4, 8), mMaglia);
    braccio.position.set(0.07 * altezza, 0.36 * altezza, lato * 0.12 * altezza);
    braccio.rotation.x = lato * 0.42;
    braccio.rotation.z = -0.5;
    g.add(braccio);
  }

  // collo
  const collo = new THREE.Mesh(new THREE.CylinderGeometry(0.045 * altezza, 0.05 * altezza, 0.06 * altezza, 10), mPelle);
  collo.position.y = 0.5 * altezza;
  g.add(collo);

  // testa
  const testa = new THREE.Mesh(new THREE.SphereGeometry(0.095 * altezza, 18, 14), mPelle);
  testa.scale.set(0.92, 1.05, 0.95);
  testa.position.y = 0.59 * altezza;
  testa.castShadow = true;
  g.add(testa);

  // capelli: calotta leggermente piu' grande, abbassata sul retro
  const chioma = new THREE.Mesh(new THREE.SphereGeometry(0.101 * altezza, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), mCapelli);
  chioma.scale.set(1.0, 1.0, 1.0);
  chioma.position.set(-0.008 * altezza, 0.605 * altezza, 0);
  chioma.rotation.z = -0.18;
  g.add(chioma);

  g.position.set(x, 0, z);
  return g;
}

export function createCar() {
  const root = new THREE.Group();

  const autoCompleta = new THREE.Group();
  root.add(autoCompleta);

  const guscio = new THREE.Group();
  autoCompleta.add(guscio);

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

  // ---- le tre carrozzerie ----
  const corpi = {};
  for (const [tipo, cfg] of Object.entries(SAGOME)) {
    const gruppo = new THREE.Group();
    gruppo.visible = false;

    const geo = new THREE.ExtrudeGeometry(formaDaPunti(cfg.punti), {
      depth: cfg.profondita,
      bevelEnabled: true,
      bevelSize: 0.05,
      bevelThickness: 0.05,
      bevelSegments: 2,
      curveSegments: 2,
    });
    geo.translate(0, 0, -cfg.profondita / 2);
    const corpo = new THREE.Mesh(geo, carrozzeria);
    corpo.castShadow = true;
    gruppo.add(corpo);

    const vetroGeo = new THREE.ShapeGeometry(formaDaPunti(cfg.vetro));
    for (const z of [-cfg.profondita / 2 - 0.008, cfg.profondita / 2 + 0.008]) {
      const m = new THREE.Mesh(vetroGeo, vetro);
      m.position.z = z;
      if (z < 0) m.rotation.y = Math.PI;
      gruppo.add(m);
    }

    corpi[tipo] = gruppo;
    guscio.add(gruppo);
  }

  // fari e fanali comuni (seguono la sagoma grande)
  const faroMat = new THREE.MeshStandardMaterial({color: 0xfff6d8, emissive: 0xfff0c0, emissiveIntensity: 0.5});
  const stopMat = new THREE.MeshStandardMaterial({color: 0xff3320, emissive: 0xff2a12, emissiveIntensity: 0.45});
  const luci = [];
  for (const z of [-0.5, 0.5]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.24), faroMat);
    f.position.set(2.0, 0.62, z);
    guscio.add(f);
    luci.push(f);
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.26), stopMat);
    s.position.set(-2.0, 0.66, z);
    guscio.add(s);
    luci.push(s);
  }

  // ---- ruote ----
  const gomma = new THREE.MeshStandardMaterial({color: 0x14161a, roughness: 0.9});
  const cerchio = new THREE.MeshStandardMaterial({color: 0xb9bec6, roughness: 0.35, metalness: 0.85});
  const ruote = [];
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      const w = new THREE.Group();
      const g = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 26), gomma);
      g.rotation.x = Math.PI / 2;
      g.castShadow = true;
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.25, 20), cerchio);
      c.rotation.x = Math.PI / 2;
      for (let i = 0; i < 5; i++) {
        const raggio = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.3, 0.26), cerchio);
        raggio.rotation.z = (i * Math.PI) / 5;
        w.add(raggio);
      }
      w.add(g, c);
      w.userData.sx = sx;
      w.userData.sz = sz;
      autoCompleta.add(w);
      ruote.push(w);
    }
  }

  // ---- passeggeri ----
  const papa = persona({pelle: 0xd9a97f, maglia: 0x3f6285, capelli: 0x3a2a20, altezza: 1.0, x: 0.06, z: 0.38});
  const bimbo = persona({pelle: 0xe0b48c, maglia: 0xd2622a, capelli: 0x2b2118, altezza: 0.74, x: -0.62, z: 0.38});
  papa.position.y = 0.72;
  bimbo.position.y = 0.72;
  autoCompleta.add(papa, bimbo);

  // ---- scritta sul cofano ----
  const targaCanvas = document.createElement('canvas');
  targaCanvas.width = 512;
  targaCanvas.height = 160;
  const targaCtx = targaCanvas.getContext('2d');
  const targaTex = new THREE.CanvasTexture(targaCanvas);
  targaTex.colorSpace = THREE.SRGBColorSpace;

  const targhe = [];
  for (const lato of [1, -1]) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1.34, 0.42),
      new THREE.MeshBasicMaterial({map: targaTex, transparent: true, depthWrite: false, side: THREE.DoubleSide}),
    );
    if (lato < 0) m.rotation.y = Math.PI;
    guscio.add(m);
    targhe.push(m);
  }

  function scriviTarga(testo) {
    const c = targaCtx;
    c.clearRect(0, 0, 512, 160);
    c.fillStyle = 'rgba(255,255,255,0.94)';
    c.beginPath();
    c.roundRect(6, 26, 500, 108, 26);
    c.fill();
    c.strokeStyle = '#1b2a4a';
    c.lineWidth = 6;
    c.stroke();
    c.fillStyle = '#1b2a4a';
    c.font = 'bold 76px Inter, system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(testo.toUpperCase(), 256, 82);
    targaTex.needsUpdate = true;
  }
  scriviTarga('benzina');

  // ---- scarico ----
  const tubo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.18, 10),
    new THREE.MeshStandardMaterial({color: 0x8b8f95, roughness: 0.5, metalness: 0.7}),
  );
  tubo.geometry.rotateZ(Math.PI / 2);
  tubo.position.set(-2.05, 0.3, 0.46);
  autoCompleta.add(tubo);

  const textureFumo = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,0.92)');
    grd.addColorStop(0.45, 'rgba(255,255,255,0.34)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();

  const NUVOLE = 16;
  const nuvole = [];
  for (let i = 0; i < NUVOLE; i++) {
    const m = new THREE.SpriteMaterial({map: textureFumo, color: 0xa8a8a8, transparent: true, opacity: 0, depthWrite: false});
    const sp = new THREE.Sprite(m);
    sp.position.set(-2.1, 0.3, 0.46);
    sp.scale.setScalar(0.2);
    root.add(sp);
    nuvole.push(sp);
  }

  const scarico = {attivo: true, intensita: 0.46, colore: 0xa8a8a8, base: [-2.12, 0.30, 0.46]};

  function setScarico(mezzo, tipoFumo = 'normale') {
    if (tipoFumo === 'nessuno') {
      scarico.attivo = false;
      scarico.intensita = 0;
      for (const n of nuvole) n.material.opacity = 0;
      return;
    }
    scarico.attivo = true;
    if (tipoFumo === 'denso') {
      scarico.colore = 0x2a2a2a;
      scarico.intensita = 1.0;
    } else if (tipoFumo === 'leggero') {
      scarico.colore = 0x8d8d8d;
      scarico.intensita = 0.45;
    } else {
      scarico.colore = 0x5c5c5c;
      scarico.intensita = 0.86;
    }
    for (const n of nuvole) n.material.color.setHex(scarico.colore);
  }

  function aggiornaFumo(t) {
    const CICLO = 2.4;
    for (let i = 0; i < NUVOLE; i++) {
      const sp = nuvole[i];
      if (!scarico.attivo) continue;
      const fase = (t / CICLO + i / NUVOLE) % 1;
      sp.position.set(
        scarico.base[0] - fase * 2.7,
        scarico.base[1] + 0.04 + fase * 1.85 + Math.sin(i * 7.3) * 0.06,
        scarico.base[2] + Math.sin(i * 3.1) * 0.13 * (0.3 + fase),
      );
      const s = 0.26 + fase * 0.9;
      sp.scale.set(s, s, s);
      sp.material.opacity = scarico.intensita * 0.75 * Math.pow(1 - fase, 1.05);
    }
  }

  // ---- motore ----
  const motore = new THREE.Group();
  motore.position.set(1.32, 0.44, 0);
  autoCompleta.add(motore);

  const alluminio = new THREE.MeshStandardMaterial({color: 0xb7bfc7, roughness: 0.48, metalness: 0.45});
  const vetroCilindro = new THREE.MeshPhysicalMaterial({
    color: 0xaad4ff, roughness: 0.05, transparent: true, opacity: 0.2, metalness: 0, side: THREE.DoubleSide,
  });
  const pistoneMat = new THREE.MeshStandardMaterial({color: 0xe8e2d2, roughness: 0.25, metalness: 0.8});
  const rame = new THREE.MeshStandardMaterial({color: 0xc8763a, roughness: 0.4, metalness: 0.8});

  const R = 0.05;
  const L = 0.15;
  const zs = [-0.27, -0.09, 0.09, 0.27];

  const combustione = new THREE.Group();
  motore.add(combustione);

  const blocco = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.5), alluminio);
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
    p.position.set(0, 0.1, z);
    combustione.add(p);
    pistoni.push(p);

    const biella = new THREE.Mesh(new THREE.BoxGeometry(0.018, L, 0.016), alluminio);
    biella.position.set(0, 0, z);
    combustione.add(biella);
    bielle.push(biella);

    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 12),
      new THREE.MeshBasicMaterial({color: 0xffb066, transparent: true, opacity: 0}),
    );
    s.position.set(0, 0.245, z);
    combustione.add(s);
    scoppi.push(s);

    const g = new THREE.Group();
    g.position.set(0, -0.085, z);
    const disco = new THREE.CylinderGeometry(0.052, 0.052, 0.02, 20);
    disco.rotateX(Math.PI / 2);
    g.add(new THREE.Mesh(disco, alluminio));
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

  const ventola = new THREE.Group();
  ventola.position.set(-0.26, 0.08, 0);
  for (let i = 0; i < 5; i++) {
    const pala = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.09, 0.035), alluminio);
    pala.position.y = 0.055;
    const holder = new THREE.Group();
    holder.rotation.x = (i * Math.PI * 2) / 5;
    holder.add(pala);
    ventola.add(holder);
  }
  ventola.rotation.x = Math.PI / 2;
  combustione.add(ventola);

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

  for (let i = 0; i < 6; i++) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.115, 0.02), pistoneMat);
    a.position.set(0, 0.12, 0);
    a.rotation.z = (i * Math.PI) / 3;
    elettrico.add(a);
    rotore.userData.alette = rotore.userData.alette || [];
    rotore.userData.alette.push(a);
  }
  motore.add(elettrico);

  // ---- autobus scolastico ----
  const bus = new THREE.Group();
  bus.visible = false;
  {
    const giallo = new THREE.MeshStandardMaterial({color: 0xf6c331, roughness: 0.45, metalness: 0.15});
    const scuro = new THREE.MeshStandardMaterial({color: 0x2b3442, roughness: 0.35, metalness: 0.3});
    const vetroBus = new THREE.MeshPhysicalMaterial({
      color: 0x9fc4dd, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.4,
    });
    const nero = new THREE.MeshStandardMaterial({color: 0x14161a, roughness: 0.85});
    const cromo = new THREE.MeshStandardMaterial({color: 0xb9bec6, roughness: 0.35, metalness: 0.85});

    // scocca a pannelli: sotto e sopra i finestrini, piu' tetto, pavimento, muso e coda
    for (const lato of [-1, 1]) {
      const basso = new THREE.Mesh(new THREE.BoxGeometry(8.4, 1.05, 0.1), giallo);
      basso.position.set(0, 1.08, lato * 1.2);
      basso.castShadow = true;
      bus.add(basso);

      const alto = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.36, 0.1), giallo);
      alto.position.set(0, 2.36, lato * 1.2);
      alto.castShadow = true;
      bus.add(alto);
    }

    const tetto = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.12, 2.44), giallo);
    tetto.position.y = 2.56;
    tetto.castShadow = true;
    bus.add(tetto);

    const pavimento = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.12, 2.44), scuro);
    pavimento.position.y = 0.56;
    bus.add(pavimento);

    const muso = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.0, 2.44), giallo);
    muso.position.set(4.2, 1.55, 0);
    bus.add(muso);

    const coda = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.0, 2.44), giallo);
    coda.position.set(-4.2, 1.55, 0);
    bus.add(coda);

    const striscia = new THREE.Mesh(new THREE.BoxGeometry(8.42, 0.14, 2.46), scuro);
    striscia.position.set(0, 1.06, 0);
    bus.add(striscia);

    // finestrini laterali con montanti
    for (const lato of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.78, 0.04), vetroBus);
        w.position.set(2.6 - i * 1.14, 1.72, lato * 1.19);
        bus.add(w);
        const mont = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.07), giallo);
        mont.position.set(3.14 - i * 1.14, 1.76, lato * 1.225);
        bus.add(mont);
      }
    }

    const para = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.98, 2.1), vetroBus);
    para.position.set(4.21, 1.78, 0);
    bus.add(para);
    const luno = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.82, 2.0), vetroBus);
    luno.position.set(-4.21, 1.76, 0);
    bus.add(luno);

    // bambini dietro i finestrini
    const pelli = [0xe7b48f, 0xd29a6f, 0xc98a5c, 0xe8c3a0, 0xb97a50, 0xefc9a8];
    const maglie = [0x3f6285, 0xd2622a, 0x4f8a45, 0x7a63b8, 0xc8322a, 0x3a6ea5];
    for (const lato of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        if ((i + (lato > 0 ? 0 : 1)) % 3 === 2) continue;
        const x = 2.6 - i * 1.14;
        const testa = new THREE.Mesh(
          new THREE.SphereGeometry(0.175, 14, 12),
          new THREE.MeshStandardMaterial({color: pelli[(i + (lato > 0 ? 0 : 2)) % pelli.length], roughness: 0.8}),
        );
        testa.position.set(x, 1.72, lato * 0.92);
        bus.add(testa);
        const busto = new THREE.Mesh(
          new THREE.CylinderGeometry(0.135, 0.175, 0.52, 12),
          new THREE.MeshStandardMaterial({color: maglie[(i + (lato > 0 ? 1 : 0)) % maglie.length], roughness: 0.86}),
        );
        busto.position.set(x, 1.34, lato * 0.92);
        bus.add(busto);
      }
    }

    // paraurti, fari, luci di ingombro
    const paraurti = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 2.5), scuro);
    paraurti.position.set(4.22, 0.7, 0);
    bus.add(paraurti);
    const dietro = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 2.45), scuro);
    dietro.position.set(-4.22, 0.72, 0);
    bus.add(dietro);

    for (const z of [-0.78, 0.78]) {
      const f = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.24, 0.34),
        new THREE.MeshStandardMaterial({color: 0xfff3cf, emissive: 0xffe9b0, emissiveIntensity: 0.7}),
      );
      f.position.set(4.2, 1.02, z);
      bus.add(f);
      const r = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.2, 0.3),
        new THREE.MeshStandardMaterial({color: 0xff5540, emissive: 0xff2a12, emissiveIntensity: 0.6}),
      );
      r.position.set(-4.2, 1.02, z);
      bus.add(r);
    }

    for (const z of [-0.62, 0, 0.62]) {
      const l = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.14, 0.24),
        new THREE.MeshStandardMaterial({color: 0xff9a2a, emissive: 0xff7a10, emissiveIntensity: 0.85}),
      );
      l.position.set(4.0, 2.62, z);
      bus.add(l);
    }

    // specchietti
    for (const z of [-1.4, 1.4]) {
      const braccio = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.34), scuro);
      braccio.position.set(4.05, 2.12, z);
      bus.add(braccio);
      const vetroS = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.18), scuro);
      vetroS.position.set(4.05, 2.12, z + Math.sign(z) * 0.2);
      bus.add(vetroS);
    }

    // portiera sul lato destro
    const portiera = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 1.0), scuro);
    portiera.position.set(3.35, 1.2, 1.24);
    bus.add(portiera);

    // ruote con cerchi
    for (const x of [2.7, -2.5]) {
      for (const z of [-1.2, 1.2]) {
        const g = new THREE.Mesh(new THREE.CylinderGeometry(0.53, 0.53, 0.34, 22), nero);
        g.rotation.x = Math.PI / 2;
        g.position.set(x, 0.53, z);
        g.castShadow = true;
        bus.add(g);
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.36, 18), cromo);
        c.rotation.x = Math.PI / 2;
        c.position.set(x, 0.53, z);
        bus.add(c);
      }
    }
  }
  root.add(bus);

  // ---- bicicletta ----
  const bici = new THREE.Group();
  bici.visible = false;
  {
    const telaioMat = new THREE.MeshStandardMaterial({color: 0x3a6ea5, roughness: 0.35, metalness: 0.7});
    const gommaMat = new THREE.MeshStandardMaterial({color: 0x18181a, roughness: 0.85});
    for (const x of [0.52, -0.52]) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.032, 8, 26), gommaMat);
      r.position.set(x, 0.33, 0);
      bici.add(r);
    }
    const tuboB = (x1, y1, x2, y2) => {
      const len = Math.hypot(x2 - x1, y2 - y1);
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.045, 0.045), telaioMat);
      m.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0);
      m.rotation.z = Math.atan2(y2 - y1, x2 - x1);
      bici.add(m);
    };
    tuboB(-0.52, 0.33, 0.1, 0.72);
    tuboB(0.1, 0.72, 0.52, 0.33);
    tuboB(-0.52, 0.33, 0.1, 0.33);
    tuboB(0.1, 0.33, 0.1, 0.72);
    tuboB(0.1, 0.72, 0.45, 0.78);
    const sellino = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.1), telaioMat);
    sellino.position.set(-0.02, 0.78, 0);
    bici.add(sellino);
  }
  root.add(bici);

  const stato = {cutaway: 0, colore: 'benzina', mezzo: 'benzina', veicolo: 'media'};

  function aggiornaVisibilita() {
    const isBus = stato.veicolo === 'autobus';
    const isBici = stato.veicolo === 'bicicletta';
    bus.visible = isBus;
    bici.visible = isBici;
    autoCompleta.visible = !isBus && !isBici;
    guscio.visible = !isBus && !isBici;
    motore.visible = !isBici;
    combustione.visible = !isBici && stato.mezzo !== 'elettrica' && !isBus;
    elettrico.visible = !isBici && stato.mezzo === 'elettrica' && !isBus;
    papa.visible = !isBus && !isBici;
    bimbo.visible = !isBus && !isBici;
    for (const [tipo, g] of Object.entries(corpi)) g.visible = tipo === stato.veicolo && !isBus && !isBici;
  }

  function setVeicolo(tipo, scala = 1) {
    stato.veicolo = tipo;
    scarico.base = tipo === 'autobus' ? [-3.85, 0.55, 0.95] : [-2.12, 0.3, 0.46];
    root.scale.setScalar(scala);

    const spec = SAGOME[tipo];
    if (spec) {
      for (const w of ruote) {
        w.position.set(w.userData.sx * spec.ruote.x, spec.ruote.r, w.userData.sz * spec.ruote.z);
        w.scale.setScalar(spec.ruote.r / 0.34);
      }
      for (const m of targhe) {
        m.position.set(-0.02, 0.72, (spec.profondita / 2 + 0.06) * (m.rotation.y === 0 ? 1 : -1));
      }
      for (const l of luci) l.position.x = Math.sign(l.position.x) * (spec.punti[0][0] - 0.02);
      papa.position.x = tipo === 'utilitaria' ? -0.02 : 0.06;
      bimbo.position.x = tipo === 'utilitaria' ? -0.62 : -0.62;
    }

    aggiornaVisibilita();
    setCutaway(stato.cutaway);
  }

  function setCutaway(k) {
    stato.cutaway = k;
    carrozzeria.transparent = k > 0.01;
    carrozzeria.opacity = 1 - 0.85 * k;
    carrozzeria.depthWrite = k < 0.35;
    carrozzeria.needsUpdate = true;
    vetro.opacity = 0.34 * (1 - k) + 0.05 * k;
    aggiornaVisibilita();
    motore.scale.setScalar(1 + 0.1 * k);
    motore.position.y = 0.44 + 0.3 * k;
  }

  function setColore(mezzo) {
    stato.colore = mezzo;
    carrozzeria.color.setHex(COLORE_CARROZZERIA[mezzo] ?? COLORE_CARROZZERIA.benzina);
  }

  function setMotore(mezzo, etichetta) {
    stato.mezzo = mezzo;
    if (etichetta) scriviTarga(etichetta);
    aggiornaVisibilita();
  }

  function update(angolo, t) {
    aggiornaFumo(t);
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

  return {root, motore, guscio, update, setCutaway, setColore, setMotore, setScarico, setVeicolo, giraRuote, stato, pistoni};
}
