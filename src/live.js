import * as THREE from 'three';
import {runSim} from 'teardown-kit/runtime.js';
import {createStage} from 'teardown-kit/stage3d.js';
import {createCar} from './car.js';
import {createOverlay} from './overlay.js';
import {co2, consumo, FATTORI, annuale, GIORNI_SCUOLA} from './model.js';

const DEFAULTS = {
  duration: 9999,
  fps: 60,
  theme: 'dark',
  accent: '#ffb27a',
  hud: {enabled: false},
  director: {enabled: false},
};

const MEZZI = ['benzina', 'diesel', 'elettrica'];
const COLORI = {benzina: '#e8743a', diesel: '#5b87b3', elettrica: '#47b985'};

runSim(DEFAULTS, async ({canvas, hud}) => {
  document.title = 'La Scienza Merita · Il viaggio casa → scuola';
  document.documentElement.lang = 'it';

  const stage = createStage(canvas, hud, {
    bg: '#cfe3f2',
    fov: 34,
    bloom: {strength: 0.3, radius: 0.6, threshold: 0.86},
  });
  const {scene, camera, renderer} = stage;

  scene.fog = new THREE.Fog(0xd7e7f4, 34, 105);

  // ---- luci ----
  const hemi = new THREE.HemisphereLight(0xdfeefb, 0x9a9484, 1.75);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff6e6, 2.5);
  key.position.set(9, 17, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.camera.far = 40;
  key.shadow.bias = -0.0006;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xa8ccec, 0.55);
  rim.position.set(-7, 5, -6);
  scene.add(rim);

  // ---- suolo e strada ----
  const suolo = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({color: 0x8fb173, roughness: 0.98}),
  );
  suolo.rotation.x = -Math.PI / 2;
  suolo.receiveShadow = true;
  scene.add(suolo);

  const asfalto = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 8.4),
    new THREE.MeshStandardMaterial({color: 0x4e545c, roughness: 0.92}),
  );
  asfalto.rotation.x = -Math.PI / 2;
  asfalto.position.y = 0.01;
  asfalto.receiveShadow = true;
  scene.add(asfalto);

  const bordoMat = new THREE.MeshStandardMaterial({color: 0xe6e0d2, roughness: 0.85});
  for (const z of [-4.2, 4.2]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(200, 0.06, 0.16), bordoMat);
    b.position.set(0, 0.03, z);
    scene.add(b);
  }

  // marciapiedi
  const marciapiede = new THREE.MeshStandardMaterial({color: 0xd3ccbb, roughness: 0.97});
  for (const z of [-8.6, 8.6]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(220, 8.6), marciapiede);
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, 0.006, z);
    m.receiveShadow = true;
    scene.add(m);
  }

  // ---- il paese: casette basse, tetti a punta, giardini e siepi ----
  const muri = ['#efe6d4', '#e7d5ba', '#dfe4d8', '#eadfc9', '#d9cfc0', '#e4d2b6'];
  const tetti = ['#a4543a', '#8c4a38', '#7a5a44', '#96573f', '#b06a4c'];
  const verde = new THREE.MeshStandardMaterial({color: 0x76a855, roughness: 0.96});
  const siepeMat = new THREE.MeshStandardMaterial({color: 0x4d8a44, roughness: 0.95});

  for (let i = 0; i < 13; i++) {
    for (const lato of [1, -1]) {
      const seed = i * 17 + (lato > 0 ? 3 : 11);
      const h = 3.2 + (seed % 3) * 0.9;              // uno o due piani
      const w = 4.4 + (seed % 4) * 0.7;
      const d = 4.2 + ((seed * 3) % 3) * 0.6;
      const x = -66 + i * 10.4 + ((seed % 3) - 1) * 0.9;
      const z = lato * (16 + (seed % 3) * 2.2);

      const casa = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({color: muri[seed % muri.length], roughness: 0.92}),
      );
      casa.position.set(x, h / 2, z);
      casa.castShadow = true;
      casa.receiveShadow = true;
      scene.add(casa);

      // tetto a punta
      const tetto = new THREE.Mesh(
        new THREE.ConeGeometry(Math.max(w, d) * 0.74, 1.8, 4),
        new THREE.MeshStandardMaterial({color: tetti[seed % tetti.length], roughness: 0.86}),
      );
      tetto.position.set(x, h + 0.9, z);
      tetto.rotation.y = Math.PI / 4;
      tetto.castShadow = true;
      scene.add(tetto);

      // comignolo
      if (seed % 2 === 0) {
        const c = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.9, 0.5),
          new THREE.MeshStandardMaterial({color: 0xd8cbb8, roughness: 0.9}),
        );
        c.position.set(x + w * 0.22, h + 1.5, z);
        scene.add(c);
      }

      // giardino davanti a casa
      const giardino = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.95, 5.0), verde);
      giardino.rotation.x = -Math.PI / 2;
      giardino.position.set(x, 0.012, z - lato * (d / 2 + 2.4));
      giardino.receiveShadow = true;
      scene.add(giardino);

      // siepe sul confine del giardino
      const siepe = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.8, 0.5), siepeMat);
      siepe.position.set(x, 0.4, z - lato * (d / 2 + 4.9));
      siepe.castShadow = true;
      scene.add(siepe);
    }
  }

  // prato oltre le case: campagna, non asfalto
  const campagna = new THREE.Mesh(
    new THREE.PlaneGeometry(260, 120),
    new THREE.MeshStandardMaterial({color: 0x86ab60, roughness: 1}),
  );
  campagna.rotation.x = -Math.PI / 2;
  campagna.position.set(0, -0.02, 0);
  campagna.receiveShadow = true;
  scene.add(campagna);

  // qualche albero per dare scala
  const tronco = new THREE.MeshStandardMaterial({color: 0x6b5442, roughness: 0.95});
  const chioma = new THREE.MeshStandardMaterial({color: 0x4f8f4a, roughness: 0.9});
  for (let i = 0; i < 18; i++) {
    const z = (i % 2 === 0 ? 1 : -1) * (11.5 + ((i * 7) % 4));
    const x = -62 + i * 7.4;
    const scala = 0.75 + ((i * 13) % 5) * 0.12;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 2.0 * scala, 8), tronco);
    t.position.set(x, 1.0 * scala, z);
    t.castShadow = true;
    scene.add(t);
    const c = new THREE.Mesh(new THREE.SphereGeometry(1.05 * scala, 12, 12), chioma);
    c.position.set(x, 2.3 * scala, z);
    c.castShadow = true;
    scene.add(c);
  }

  // tratteggi: si spostano per simulare il movimento
  const tratteggio = [];
  const dashMat = new THREE.MeshBasicMaterial({color: 0xf6f3ea, transparent: true, opacity: 0.92});
  for (let i = 0; i < 40; i++) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.14), dashMat);
    d.position.set(i * 3 - 60, 0.02, 0);
    scene.add(d);
    tratteggio.push(d);
  }

  // ---- l'auto ----
  const auto = createCar();
  scene.add(auto.root);

  // ombra morbida sotto l'auto
  const ombra = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 2.2),
    new THREE.MeshBasicMaterial({color: 0x2f3a44, transparent: true, opacity: 0.2}),
  );
  ombra.rotation.x = -Math.PI / 2;
  ombra.position.y = 0.015;
  scene.add(ombra);

  // ---- stato ----
  const stato = {
    mezzo: 'benzina',
    km: 3,
    cutTarget: 0,
    cut: 0,
    idle: 0,
    tour: true,
    tourTimer: 0,
    tourStep: 0,
  };

  // parametri per il docente: ?mezzo=elettrica&km=5&cut=1
  const q = new URLSearchParams(location.search);
  if (q.get('mezzo') && MEZZI.includes(q.get('mezzo'))) stato.mezzo = q.get('mezzo');
  if (q.get('km')) stato.km = Math.max(1, Math.min(12, Number(q.get('km')) || 3));
  if (q.get('cut') === '1') stato.cutTarget = 1;
  if (q.has('mezzo') || q.has('km') || q.has('cut')) {
    stato.tour = false;
    stato.idle = 0;
  }

  const overlay = createOverlay({
    onMezzo: (m) => {
      stato.mezzo = m;
      auto.setColore(m);
      auto.setMotore(m);
      auto.setScarico(m);
      interagisci();
    },
    onKm: (v) => {
      stato.km = v;
      interagisci();
    },
    onCut: () => {
      stato.cutTarget = stato.cutTarget > 0.5 ? 0 : 1;
      interagisci();
    },
  });

  auto.setColore(stato.mezzo);
  auto.setMotore(stato.mezzo);
  auto.setScarico(stato.mezzo);
  auto.setCutaway(stato.cutTarget);

  function interagisci() {
    stato.idle = 0;
    stato.tour = false;
    stato.tourTimer = 0;
  }

  const ORDINE_TOUR = ['benzina', 'elettrica', 'diesel', 'benzina', 'elettrica', 'benzina'];

  // camera: 3/4, si avvicina quando il motore è aperto
  const camBase = new THREE.Vector3(5.6, 2.55, 7.0);
  const camCut = new THREE.Vector3(4.6, 2.8, 5.4);
  const guardaBase = new THREE.Vector3(0, 1.05, 0);
  const guardaCut = new THREE.Vector3(0.6, 1.05, 0);
  const cam = new THREE.Vector3();
  const guarda = new THREE.Vector3();

  let ultimo = 0;

  function render(t) {
    const dt = Math.min(0.05, Math.max(0, t - ultimo));
    ultimo = t;

    // animazione cutaway
    stato.cut += (stato.cutTarget - stato.cut) * Math.min(1, dt * 6);
    auto.setCutaway(stato.cut);

    // tour automatico quando nessuno tocca
    if (stato.tour) {
      stato.tourTimer += dt;
      if (stato.tourTimer > 5.5) {
        stato.tourTimer = 0;
        stato.tourStep++;
        const m = ORDINE_TOUR[stato.tourStep % ORDINE_TOUR.length];
        stato.mezzo = m;
        auto.setColore(m);
        auto.setMotore(m);
        auto.setScarico(m);
        stato.cutTarget = stato.tourStep % 3 === 2 ? 1 : 0;
      }
    } else {
      stato.idle += dt;
      if (stato.idle > 20) {
        stato.tour = true;
        stato.tourTimer = 0;
      }
    }

    // meccanica: il motore gira sempre, anche a vista esplosa
    auto.update(t * 9, t);
    auto.giraRuote(dt * 4.2);

    // strada
    const vel = dt * 9;
    for (const d of tratteggio) {
      d.position.x -= vel;
      if (d.position.x < -62) d.position.x += 120;
    }

    // camera
    const k = stato.cut;
    cam.copy(camBase).lerp(camCut, k);
    cam.x += Math.sin(t * 0.16) * 0.55 * (1 - k);
    cam.z += Math.cos(t * 0.13) * 0.35 * (1 - k);
    guarda.copy(guardaBase).lerp(guardaCut, k);
    camera.position.copy(cam);
    camera.lookAt(guarda);

    // numeri
    const totale = co2(stato.mezzo, stato.km);
    const valori = {};
    for (const m of MEZZI) valori[m] = co2(m, stato.km);
    const cons = consumo(stato.mezzo, stato.km);
    const f = FATTORI[stato.mezzo];

    let nota;
    if (stato.mezzo === 'elettrica') {
      nota = `${cons.toFixed(2)} kWh dalla rete · ${f.fattore} g CO₂ per kWh`;
    } else {
      nota = `${cons.toFixed(2)} L di ${f.nome.toLowerCase()} · ${(f.fattore / 1000).toFixed(2)} kg CO₂/L`;
    }

    overlay.update({
      totale,
      km: stato.km,
      mezzo: stato.mezzo,
      valori,
      nota,
      annuale: annuale(stato.mezzo, stato.km),
      giorni: GIORNI_SCUOLA,
      cutaway: stato.cutTarget > 0.5,
      tour: stato.tour,
      t,
    });

    stage.render();
    return {};
  }

  return {
    render,
    resize: () => stage.resize(),
  };
});
