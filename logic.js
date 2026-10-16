/*
 * CONTROL - BANC: lógica de cálculo, idéntica a la del libro de Excel.
 *
 * El estado usa las MISMAS direcciones de celda que el libro:
 *   datos (hoja DATOS):      B1 mes, B3..B13 acumulados, B15..B22 importes mensuales
 *   dash  (hoja DASHBOARD):  E7, E20, H11, H20, K4, K7, K11, K18, K25 = saldos base
 * y las fórmulas de DASHBOARD son las mismas (saldo = base + acumulado).
 * Cada acción equivale a un Sub de Módulo1.bas.
 */
(function (root) {
  'use strict';

  var MESES = ['GENER', 'FEBRER', 'MARÇ', 'ABRIL', 'MAIG', 'JUNY', 'JULIOL', 'AGOST', 'SETEMBRE', 'OCTUBRE', 'NOVEMBRE', 'DECEMBRE'];

  function reset(datos, dash, msg) { return { tipo: 'reset', datos: datos, dashboard: dash, msg: msg || 'Actualitza Saldo' }; }
  function info(celda) { return { tipo: 'info', datos: celda, msg: 'Definex import mensual' }; }

  // Una entrada por macro del libro (mismos nombres que en VBA)
  var ACCIONES = {
    BotonMes: { tipo: 'mes' },
    ResetSabadell: reset('B5', 'E7'),
    ResetOpenbank: reset('B6', 'E20'),
    ResetEstalvis: reset('B4', 'H20'),
    ResetBBVA: reset('B3', 'H11'),
    ResetCasa: reset('B7', 'K4'),
    ResetIBI: reset('B8', 'K7'),
    ResetCotxeSeguro: reset('B9', 'K11'),
    ResetCotxeRevisio: reset('B10', 'K18'),
    ResetVacances: reset('B11', 'K25'),
    SumaEstalvis: { tipo: 'suma', datos: 'B4', msg: 'Afegeix Estalvis' },
    SumaBBVA: { tipo: 'suma', datos: 'B3', msg: 'Afegir Saldo' },
    RestaBBVA: { tipo: 'resta', datos: 'B3', msg: 'Restar Saldo' },
    Amortitzar: { tipo: 'suma', datos: 'B13', msg: 'Amortitzar Préstec' },
    InfoSabadell: info('B15'),
    InfoOpenbank: info('B16'),
    InfoPrestec: info('B17'),
    InfoCasa: info('B18'),
    InfoIBI: info('B19'),
    InfoCotxeSeguro: info('B20'),
    InfoCotxeRevisio: info('B21'),
    InfoVacances: info('B22'),
    // ESTALVIS (nuevo, no existe en el Excel): acumulado en B23, importe mensual en B24, saldo base en K32
    SumaAhorros: { tipo: 'suma', datos: 'B23', msg: 'Afegeix Estalvis' },
    ResetAhorros: reset('B23', 'K32'),
    InfoAhorros: info('B24')
  };

  var CELDAS_DATOS = ['B1', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20', 'B21', 'B22', 'B23', 'B24'];
  var CELDAS_DASH = ['E7', 'E20', 'H11', 'H20', 'K4', 'K7', 'K11', 'K18', 'K25', 'K32'];

  function estadoInicial() {
    var s = { datos: {}, dash: {}, prestecTotal: 20000 };
    CELDAS_DATOS.forEach(function (c) { s.datos[c] = 0; });
    CELDAS_DASH.forEach(function (c) { s.dash[c] = 0; });
    s.datos.B1 = 1;
    return s;
  }

  /** CDbl(Val(x)): lo que no es número cuenta como 0. */
  function num(v) {
    if (typeof v === 'number') { return isFinite(v) ? v : 0; }
    var n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  function clonar(s) { return JSON.parse(JSON.stringify(s)); }

  /**
   * Aplica una macro y devuelve el estado nuevo (el original no se modifica).
   * valor = número escrito por el usuario, o null si canceló / no hace falta.
   */
  function aplicar(estado, nombre, valor) {
    var a = ACCIONES[nombre];
    if (!a) { throw new Error('Acción desconocida: ' + nombre); }
    if (valor === undefined) { valor = null; }
    if (valor !== null && (typeof valor !== 'number' || !isFinite(valor))) { throw new Error('Valor no válido'); }
    var s = clonar(estado);
    var D = s.datos, S = s.dash;
    switch (a.tipo) {
      case 'mes':   // Sub BotonMes
        var b1 = num(D.B1), b3 = num(D.B3);
        // El último par (B23 += B24) es el ahorro nuevo; los anteriores son idénticos al Excel
        var destino = [['B5', 'B15'], ['B6', 'B16'], ['B12', 'B17'], ['B7', 'B18'], ['B8', 'B19'], ['B9', 'B20'], ['B10', 'B21'], ['B11', 'B22'], ['B23', 'B24']];
        var nuevos = destino.map(function (p) { return [p[0], num(D[p[0]]) + num(D[p[1]])]; });
        D.B1 = b1 + 1;
        nuevos.forEach(function (p) { D[p[0]] = p[1]; });
        D.B3 = b3 - num(D.B15) - num(D.B16) - num(D.B17) - num(D.B18) - num(D.B19) - num(D.B20) - num(D.B21) - num(D.B22) - num(D.B24);
        break;
      case 'reset': // ResetAmbInput: DATOS!celda = 0 y DASHBOARD!celda = valor
        if (valor !== null) { D[a.datos] = 0; S[a.dashboard] = valor; }
        break;
      case 'suma':  // SumarACeldaDatos
        if (valor !== null) { D[a.datos] = num(D[a.datos]) + valor; }
        break;
      case 'resta': // RestarACeldaDatos
        if (valor !== null) { D[a.datos] = num(D[a.datos]) - valor; }
        break;
      case 'info':  // PosarValorDatos
        if (valor !== null) { D[a.datos] = valor; }
        break;
    }
    return s;
  }

  /** Valores que muestra el panel (mismas fórmulas que la hoja DASHBOARD). */
  function calcular(s, anyActual) {
    var D = s.datos, S = s.dash, total = s.prestecTotal;
    var n = function (v) { return num(v); };
    var mesIdx = (((n(D.B1) - 1) % 12) + 12) % 12;
    var restante = total - n(D.B12) - n(D.B13);
    return {
      mes: MESES[mesIdx],
      titulo: MESES[mesIdx] + ' ' + anyActual,
      bbva: n(S.H11) + n(D.B3),
      estalvis: n(S.H20) + n(D.B4),
      sabadell: n(S.E7) + n(D.B5),
      openbank: n(S.E20) + n(D.B6),
      casa: n(S.K4) + n(D.B7),
      ibi: n(S.K7) + n(D.B8),
      cotxe: n(S.K11) + n(D.B9),
      revisio: n(S.K18) + n(D.B10),
      vacances: n(S.K25) + n(D.B11),
      ahorros: n(S.K32) + n(D.B23),
      prestecPagado: n(D.B12),
      prestecRestante: restante,
      prestecPorcentaje: 1 - restante / total,
      importes: { sabadell: n(D.B15), openbank: n(D.B16), prestec: n(D.B17), casa: n(D.B18), ibi: n(D.B19), cotxe: n(D.B20), revisio: n(D.B21), vacances: n(D.B22), ahorros: n(D.B24) }
    };
  }

  // ---- Formato (como Excel en España: 1.500,00 €) ----
  // A mano (no con Intl): en es-ES, Intl no pone el punto de millar a 4 cifras (1500,00 €) y Excel sí (1.500,00 €)
  function moneda(v) {
    var txt = Math.abs(v).toFixed(2);
    var partes = txt.split('.');
    var entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    var negativo = v < 0 && Number(txt) !== 0;
    return (negativo ? '-' : '') + entero + ',' + partes[1] + ' €';
  }
  function importe(v) {   // equivale a  =B15&" €"
    return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 10, useGrouping: false }).format(v) + ' €';
  }
  function porcentaje(v) { return Math.round(v * 100) + '%'; }

  /** Equivale a Application.InputBox(Type:=1): solo acepta números. NaN si no es válido. */
  function parseNumero(txt) {
    var s = String(txt).split(' ').join('').split('€').join('');
    if (!s || !/^[+-]?[0-9.,]+$/.test(s)) { return NaN; }
    var coma = s.lastIndexOf(','), punto = s.lastIndexOf('.');
    if (coma >= 0 && punto >= 0) {
      s = coma > punto ? s.split('.').join('').replace(',', '.') : s.split(',').join('');
    } else if (coma >= 0) {
      s = s.replace(',', '.');
    } else if (/^[+-]?[0-9]{1,3}([.][0-9]{3})+$/.test(s)) {
      s = s.split('.').join('');
    }
    var n = Number(s);
    return isFinite(n) ? n : NaN;
  }

  /** Valida un estado cargado de una copia de seguridad. Devuelve el estado limpio o lanza error. */
  function validarEstado(obj) {
    if (!obj || typeof obj !== 'object' || !obj.datos || !obj.dash) { throw new Error('El archivo no es una copia de Control Banc.'); }
    var s = estadoInicial();
    CELDAS_DATOS.forEach(function (c) { if (c in obj.datos) { s.datos[c] = num(obj.datos[c]); } });
    CELDAS_DASH.forEach(function (c) { if (c in obj.dash) { s.dash[c] = num(obj.dash[c]); } });
    if (obj.prestecTotal && num(obj.prestecTotal) > 0) { s.prestecTotal = num(obj.prestecTotal); }
    return s;
  }

  var api = {
    MESES: MESES, ACCIONES: ACCIONES, CELDAS_DATOS: CELDAS_DATOS, CELDAS_DASH: CELDAS_DASH,
    estadoInicial: estadoInicial, aplicar: aplicar, calcular: calcular, validarEstado: validarEstado,
    moneda: moneda, importe: importe, porcentaje: porcentaje, parseNumero: parseNumero, num: num
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; } else { root.ControlBanc = api; }
})(typeof self !== 'undefined' ? self : this);
