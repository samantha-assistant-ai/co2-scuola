import * as THREE from 'three';
import {runSim} from 'teardown-kit/runtime.js';
import {createStage} from 'teardown-kit/stage3d.js';
import {createCar} from './car.js';
import {createOverlay} from './overlay.js';
import {co2, consumo, FATTORI, risparmio} from './model.js';

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
  document.title = 'Il viaggio casa → scuola · CO₂';
  document.documentElement.lang = 'it';

  const stage = createStage(canvas, hud, {
    bg: '#0b0e12',
    fov: 34,
    bloom: {strength: 0.55, radius: 0.5, threshold: 0.75},
  });
  const {scene, camera, renderer} = stage;

  scene.fog = new THREE.Fog(0x0b0e12, 18, 46);

  // ---- luci ----
  const hemi = new THREE.HemisphereLight(0xbcd4ff, 0x1a1c22, 1.15);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff2df, 2.1);
  key.position.set(6, 12, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.camera.far = 40;
  key.shadow.bias = -0.0006;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x7fb0ff, 0.7);
  rim.position.set(-7, 5, -6);
  scene.add(rim);

  // ---- suolo e strada ----
  const suolo = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({color: 0x141821, roughness: 0.95}),
  );
  suolo.rotation.x = -Math.PI / 2;
  suolo.receiveShadow = true;
  scene.add(suolo);

  const asfalto = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 8.4),
    new THREE.MeshStandardMaterial({color: 0x1c2027, roughness: 0.9}),
  );
  asfalto.rotation.x = -Math.PI / 2;
  asfalto.position.y = 0.01;
  asfalto.receiveShadow = true;
  scene.add(asfalto);

  const bordoMat = new THREE.MeshStandardMaterial({color: 0x2b313b, roughness: 0.8});
  for (const z of [-4.2, 4.2]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(200, 0.06, 0.16), bordoMat);
    b.position.set(0, 0.03, z);
    scene.add(b);
  }

  // tratteggi: si spostano per simulare il movimento
  const tratteggio = [];
  const dashMat = new THREE.MeshBasicMaterial({color: 0xd8d2c4, transparent: true, opacity: 0.55});
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
    new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.35}),
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
  auto.setCutaway(stato.cutTarget);

  function interagisci() {
    stato.idle = 0;
    stato.tour = false;
    stato.tourTimer = 0;
  }

  const ORDINE_TOUR = ['benzina', 'elettrica', 'diesel', 'benzina', 'elettrica', 'benzina'];

  // camera: 3/4, si avvicina quando il motore è aperto
  const camBase = new THREE.Vector3(5.4, 3.1, 6.6);
  const camCut = new THREE.Vector3(3.0, 1.9, 3.4);
  const guardaBase = new THREE.Vector3(0, 0.95, 0);
  const guardaCut = new THREE.Vector3(1.2, 1.15, 0);
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
        stato.cutTarget = stato.tourStep % 3 === 2 ? 1 : 0;
      }
    } else {
      stato.idle += dt;
      if (stato.idle > 20) {
        stato.tour = true;
        stato.tourTimer = 0;
      }
    }

    // meccanica
    const accesa = stato.mezzo !== 'elettrica';
    const angolo = t * (accesa ? 11 : 0);
    if (accesa) auto.update(angolo, t);
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
      nota = `${cons.toFixed(2)} kWh dalla rete · ${f.fattore} g CO₂ per kWh. Anche l'elettricità ha un costo: dipende da come la produciamo.`;
    } else {
      nota = `${cons.toFixed(2)} litri di ${f.nome.toLowerCase()} · ${(f.fattore / 1000).toFixed(2)} kg CO₂ per litro bruciato.`;
    }

    overlay.update({
      totale,
      km: stato.km,
      mezzo: stato.mezzo,
      valori,
      nota,
      cutaway: stato.cutTarget > 0.5,
      tour: stato.tour,
    });

    stage.render();
    return {};
  }

  return {
    render,
    resize: () => stage.resize(),
  };
});
