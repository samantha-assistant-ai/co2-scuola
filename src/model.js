// Il modello numerico. Tutti i numeri in un posto solo, con la fonte.
// Se un docente vuole cambiarli, si cambia qui e si ricompila.
//
// Fonti (valori tipici, arrotondati per la didattica):
//  - Benzina: 7,0 L/100 km · 2,31 kg CO2 per litro di benzina
//  - Diesel:  5,5 L/100 km · 2,64 kg CO2 per litro di gasolio
//  - Elettrica: 0,16 kWh/km · 0,31 kg CO2 per kWh (mix elettrico italiano)
export const FATTORI = {
  benzina: {
    nome: 'Benzina',
    consumo: 0.070, // litri per km
    fattore: 2310, // g CO2 per litro
    unita: 'L',
  },
  diesel: {
    nome: 'Diesel',
    consumo: 0.055,
    fattore: 2640,
    unita: 'L',
  },
  elettrica: {
    nome: 'Elettrica',
    consumo: 0.160, // kWh per km
    fattore: 310, // g CO2 per kWh
    unita: 'kWh',
  },
};

/** grammi di CO2 per un viaggio di `km` chilometri con un certo mezzo */
export function co2(mezzo, km) {
  const f = FATTORI[mezzo];
  return km * f.consumo * f.fattore;
}

/** consumo in unita' del mezzo (litri o kWh) */
export function consumo(mezzo, km) {
  return km * FATTORI[mezzo].consumo;
}

/** quanto e' piu' pulita l'elettrica, in percentuale */
export function risparmio(mezzo, km) {
  const base = co2('benzina', km);
  if (!base) return 0;
  return Math.max(0, Math.round((1 - co2(mezzo, km) / base) * 100));
}

/** Giorni di scuola in un anno scolastico (valore didattico arrotondato). */
export const GIORNI_SCUOLA = 200;

/**
 * Il conto annuale del viaggio casa-scuola.
 * `kmAndata` e' la distanza di sola andata: il tragitto quotidiano e' doppio.
 */
export function annuale(mezzo, kmAndata) {
  const andataRitorno = kmAndata * 2;
  const ogniGiorno = co2(mezzo, andataRitorno);
  const anno = (ogniGiorno * GIORNI_SCUOLA) / 1000; // kg
  return {andataRitorno, ogniGiorno, anno};
}
