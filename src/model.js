// Il modello numerico. Tutti i numeri in un posto solo, con la fonte accanto.
//
// Emissioni in grammi di CO2 per chilometro, valori tipici arrotondati per la
// didattica. Il punto della lezione e' il confronto, non la terza cifra.
//
//  - benzina: 2,31 kg CO2 per litro bruciato
//  - diesel:  2,64 kg CO2 per litro
//  - elettrica: 0,31 kg CO2 per kWh (mix elettrico italiano)
//  - autobus: emissione per passeggero (bus urbano pieno a meta')
//  - bicicletta: zero allo scarico

export const GIORNI_SCUOLA = 200;

// Un albero adulto assorbe circa 20-25 kg di CO2 in un anno: usiamo 21.
export const KG_PER_ALBERO = 21;

export const MOTORI = {
  benzina: {nome: 'Benzina', colore: '#e8743a', fumo: 'normale'},
  diesel: {nome: 'Diesel', colore: '#5b87b3', fumo: 'denso'},
  ibrido: {nome: 'Ibrido', colore: '#8a6fc4', fumo: 'leggero'},
  elettrica: {nome: 'Elettrica', colore: '#47b985', fumo: 'nessuno'},
};

export const MEZZI = {
  utilitaria: {
    nome: 'Utilitaria',
    ic: '🚗',
    motori: ['benzina', 'diesel', 'ibrido', 'elettrica'],
    gkm: {benzina: 116, diesel: 110, ibrido: 78, elettrica: 43},
    scala: 0.94,
  },
  media: {
    nome: 'Auto media',
    ic: '🚙',
    motori: ['benzina', 'diesel', 'ibrido', 'elettrica'],
    gkm: {benzina: 145, diesel: 132, ibrido: 95, elettrica: 55},
    scala: 1.0,
  },
  suv: {
    nome: 'SUV',
    ic: '🚐',
    motori: ['benzina', 'diesel', 'ibrido', 'elettrica'],
    gkm: {benzina: 205, diesel: 180, ibrido: 130, elettrica: 72},
    scala: 1.06,
  },
  autobus: {
    nome: 'Autobus',
    ic: '🚌',
    motori: ['diesel'],
    gkm: {diesel: 30},
    scala: 0.52,
  },
  bicicletta: {
    nome: 'Bicicletta',
    ic: '🚲',
    motori: [],
    gkm: {muscolare: 0},
    scala: 1.0,
  },
};

/** grammi di CO2 per un viaggio di `km` chilometri */
export function co2(mezzo, motore, km) {
  const m = MEZZI[mezzo];
  if (!m) return 0;
  const g = m.gkm[motore] ?? Object.values(m.gkm)[0] ?? 0;
  return km * g;
}

/** grammi per chilometro dell'abbinamento scelto */
export function gPerKm(mezzo, motore) {
  const m = MEZZI[mezzo];
  if (!m) return 0;
  return m.gkm[motore] ?? Object.values(m.gkm)[0] ?? 0;
}

/**
 * Il conto annuale del viaggio casa-scuola.
 * `kmAndata` e' la distanza di sola andata: il tragitto quotidiano e' doppio.
 */
export function annuale(mezzo, motore, kmAndata) {
  const andataRitorno = kmAndata * 2;
  const ogniGiorno = co2(mezzo, motore, andataRitorno);
  const anno = (ogniGiorno * GIORNI_SCUOLA) / 1000; // kg
  return {andataRitorno, ogniGiorno, anno};
}

/** quanti alberi adulti servono, per un anno, per assorbire quei kg */
export function alberi(kgAnno) {
  if (!kgAnno) return 0;
  return Math.ceil(kgAnno / KG_PER_ALBERO);
}
