/* CONTROL - BANC (móvil): interfaz, almacenamiento local, deshacer y copias de seguridad. */
(function () {
  'use strict';
  var L = window.ControlBanc;
  var CLAVE = 'controlbanc.v1';
  var MAX_HISTORIAL = 40;

  // ---------- Iconos (propios, SVG) ----------
  var ICONOS = {
    plus: '<path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>',
    minus: '<path d="M5 11h14v2H5z"/>',
    refresh: '<path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>',
    info: '<path d="M11 7h2v2h-2zm0 4h2v6h-2z"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>',
    monedes: '<path d="M12 3C7 3 4 4.6 4 6.5v11C4 19.4 7 21 12 21s8-1.6 8-3.5v-11C20 4.6 17 3 12 3zm0 2c3.9 0 6 .9 6 1.5S15.9 8 12 8 6 7.1 6 6.5 8.1 5 12 5zm6 12.5c0 .6-2.1 1.5-6 1.5s-6-.9-6-1.5v-2.2c1.4.8 3.6 1.2 6 1.2s4.6-.4 6-1.2v2.2zm0-4.5c0 .6-2.1 1.5-6 1.5s-6-.9-6-1.5v-2c1.4.8 3.6 1.2 6 1.2s4.6-.4 6-1.2v2zm0-4.5c0 .6-2.1 1.5-6 1.5s-6-.9-6-1.5V8.5C7.4 9.3 9.6 9.7 12 9.7s4.6-.4 6-1.2v2z"/>'
  };
  function icono(nombre) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[nombre] + '</svg>'; }

  // ---------- Qué tarjetas se muestran ----------
  // acciones: [nombre de la macro, icono, clase, etiqueta]
  var BBVA = '#156082';
  var TARJETAS = [
    { seccion: 'Comptes' },
    { id: 'bbva', titulo: 'BBVA', color: BBVA, saldo: 'bbva', acciones: [['SumaBBVA', 'plus', 'mes-mes', 'Afegir saldo'], ['RestaBBVA', 'minus', 'menys', 'Restar saldo'], ['ResetBBVA', 'refresh', 'refresca', 'Actualitzar saldo']] },
    { id: 'estalvis', titulo: 'BBVA - ESTALVIS', color: BBVA, saldo: 'estalvis', acciones: [['SumaEstalvis', 'plus', 'mes-mes', 'Afegir estalvis'], ['ResetEstalvis', 'refresh', 'refresca', 'Actualitzar saldo']] },
    { id: 'sabadell', titulo: 'BANC SABADELL', color: '#4E95D9', saldo: 'sabadell', acciones: [['ResetSabadell', 'refresh', 'refresca', 'Actualitzar saldo']], mensual: ['InfoSabadell', 'sabadell'] },
    { id: 'openbank', titulo: 'OPENBANK', color: '#404040', saldo: 'openbank', acciones: [['ResetOpenbank', 'refresh', 'refresca', 'Actualitzar saldo']], mensual: ['InfoOpenbank', 'openbank'] },
    { seccion: 'Reserves' },
    { id: 'casa', titulo: 'CASA', color: '#B5A52F', saldo: 'casa', acciones: [['ResetCasa', 'refresh', 'refresca', 'Actualitzar saldo']], mensual: ['InfoCasa', 'casa'] },
    { id: 'cotxe', titulo: 'COTXE', color: '#C9784A', saldo: 'cotxe', acciones: [['ResetCotxeSeguro', 'refresh', 'refresca', 'Actualitzar saldo']], mensual: ['InfoCotxeSeguro', 'cotxe'] },
    { id: 'vacances', titulo: 'VACANCES', color: '#9F6BA8', saldo: 'vacances', acciones: [['ResetVacances', 'refresh', 'refresca', 'Actualitzar saldo']], mensual: ['InfoVacances', 'vacances'] },
    { seccion: 'Préstec' },
    { id: 'prestec', tipo: 'prestec', color: '#747474', acciones: [['Amortitzar', 'monedes', 'monedes', 'Amortitzar préstec']], mensual: ['InfoPrestec', 'prestec'] }
  ];
  var EXTRAS = [
    { id: 'ibi', titulo: 'IBI + BASURES', color: '#747474', saldo: 'ibi', acciones: [['ResetIBI', 'refresh', 'refresca', 'Actualitzar saldo']], mensual: ['InfoIBI', 'ibi'] },
    { id: 'revisio', titulo: 'REVISIÓ COTXE', color: '#747474', saldo: 'revisio', acciones: [['ResetCotxeRevisio', 'refresh', 'refresca', 'Actualitzar saldo']], mensual: ['InfoCotxeRevisio', 'revisio'] }
  ];

  // ---------- Estado y almacenamiento ----------
  var datos = cargar();   // { estado, historial: [{estado, etiqueta}] }

  function cargar() {
    try {
      var txt = localStorage.getItem(CLAVE);
      if (txt) {
        var o = JSON.parse(txt);
        return { estado: L.validarEstado(o.estado), historial: Array.isArray(o.historial) ? o.historial.slice(-MAX_HISTORIAL) : [] };
      }
    } catch (e) { /* datos dañados: se empieza de cero sin borrar nada hasta que se guarde */ }
    return { estado: L.estadoInicial(), historial: [] };
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(datos)); }
    catch (e) { avisar('No s\'han pogut guardar les dades: ' + e.message, true); }
  }

  // ---------- Pintar ----------
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function botones(t) {
    return t.acciones.map(function (a) {
      return '<button class="accio ' + a[2] + '" data-accion="' + a[0] + '" aria-label="' + esc(a[3]) + '" title="' + esc(a[3]) + '">' + icono(a[1]) + '</button>';
    }).join('');
  }
  function mensual(t, v) {
    if (!t.mensual) { return ''; }
    return '<div class="mensual"><span class="xip" data-xip="' + t.mensual[1] + '">' + esc(L.importe(v.importes[t.mensual[1]])) + '</span>' +
      '<button class="accio info" data-accion="' + t.mensual[0] + '" aria-label="Definir import mensual" title="Import mensual">' + icono('info') + '</button></div>';
  }
  function tarjeta(t, v) {
    if (t.tipo === 'prestec') {
      var pct = Math.max(0, Math.min(1, v.prestecPorcentaje));
      return '<section class="targeta"><div class="titol" style="background:' + t.color + '">PRESTEC ' + esc(L.moneda(datos.estado.prestecTotal).replace(',00', '')) + '</div><div class="cos">' +
        '<div class="saldo' + (v.prestecRestante < 0 ? ' neg' : '') + '">' + esc(L.moneda(v.prestecRestante)) + '</div>' +
        '<div class="barra"><i style="width:' + (pct * 100).toFixed(1) + '%"></i></div>' +
        '<div class="pct">' + L.porcentaje(v.prestecPorcentaje) + ' amortitzat</div>' +
        '<div class="pagat">Pagat fins ara: ' + esc(L.moneda(v.prestecPagado + L.num(datos.estado.datos.B13))) + '</div>' +
        '<div class="accions">' + botones(t) + '</div>' + mensual(t, v) + '</div></section>';
    }
    var s = v[t.saldo];
    return '<section class="targeta"><div class="titol" style="background:' + t.color + '">' + esc(t.titulo) + '</div><div class="cos">' +
      '<div class="saldo' + (s < 0 ? ' neg' : '') + '">' + esc(L.moneda(s)) + '</div>' +
      '<div class="accions">' + botones(t) + '</div>' + mensual(t, v) + '</div></section>';
  }
  function pintar() {
    var v = L.calcular(datos.estado, new Date().getFullYear());
    el('titolMes').textContent = v.titulo;
    var h = '';
    TARJETAS.forEach(function (t) { h += t.seccion ? '<h2 class="seccio">' + t.seccion + '</h2>' : tarjeta(t, v); });
    h += '<details><summary>Altres</summary><div class="dins">' + EXTRAS.map(function (t) { return tarjeta(t, v); }).join('') + '</div></details>';
    el('panell').innerHTML = h;
    el('btnDesfer').style.opacity = datos.historial.length ? 1 : .4;
  }

  // ---------- Avisos ----------
  var avisoT;
  function avisar(texto, error, conDesfer) {
    var b = el('avis'); b.firstElementChild.className = error ? 'error' : '';
    el('avisText').textContent = texto;
    el('avisDesfer').style.display = conDesfer ? '' : 'none';
    b.className = 'on';
    clearTimeout(avisoT);
    avisoT = setTimeout(function () { b.className = ''; }, error ? 6000 : 5000);
  }

  // ---------- Entrada de números (como InputBox Type:=1) ----------
  function pedirNumero(titulo) {
    return new Promise(function (resolve) {
      var fondo = el('fonsEntrada'), inp = el('entradaInput'), err = el('entradaError');
      el('entradaTitol').textContent = titulo; inp.value = ''; err.textContent = '';
      fondo.classList.add('on'); setTimeout(function () { inp.focus(); }, 60);
      function cerrar(v) {
        fondo.classList.remove('on'); inp.onkeydown = null;
        el('entradaOk').onclick = el('entradaCancel').onclick = fondo.onclick = null; resolve(v);
      }
      function aceptar() {
        var n = L.parseNumero(inp.value);
        if (isNaN(n)) { err.textContent = 'El número no és vàlid.'; inp.select(); } else { cerrar(n); }
      }
      el('entradaOk').onclick = aceptar;
      el('entradaCancel').onclick = function () { cerrar(null); };
      fondo.onclick = function (e) { if (e.target === fondo) { cerrar(null); } };
      inp.onkeydown = function (e) { if (e.key === 'Enter') { aceptar(); } else if (e.key === 'Escape') { cerrar(null); } };
    });
  }

  // ---------- Operaciones ----------
  function etiqueta(nombre, valor) {
    return nombre === 'BotonMes' ? 'Mes següent' : nombre + (valor === null || valor === undefined ? '' : ' ' + L.moneda(valor));
  }
  function ejecutar(nombre, valor) {
    var antes = datos.estado;
    datos.estado = L.aplicar(antes, nombre, valor);
    datos.historial.push({ estado: antes, etiqueta: etiqueta(nombre, valor) });
    if (datos.historial.length > MAX_HISTORIAL) { datos.historial.shift(); }
    guardar(); pintar();
    // vibración breve al confirmar (solo si el navegador la permite tras un toque del usuario)
    if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) { navigator.vibrate(15); }
    avisar('Fet · ' + etiqueta(nombre, valor), false, true);
  }
  async function pulsar(nombre) {
    var a = L.ACCIONES[nombre];
    if (!a) { return; }
    if (a.tipo === 'mes') { ejecutar(nombre, null); return; }   // como en Excel: sin pregunta
    var valor = await pedirNumero(a.msg);
    if (valor === null) { return; }
    ejecutar(nombre, valor);
  }
  function desfer() {
    var h = datos.historial.pop();
    if (!h) { avisar('No hi ha res per desfer.', false, false); return; }
    datos.estado = h.estado; guardar(); pintar();
    avisar('Desfet · ' + h.etiqueta, false, false);
  }

  // ---------- Menú: copias, préstamo, borrar ----------
  function abrirMenu() { el('fonsMenu').classList.add('on'); }
  function cerrarMenu() { el('fonsMenu').classList.remove('on'); }

  function exportar() {
    var cuerpo = JSON.stringify({ app: 'controlbanc', version: 1, exportado: new Date().toISOString(), estado: datos.estado }, null, 2);
    var url = URL.createObjectURL(new Blob([cuerpo], { type: 'application/json' }));
    var a = document.createElement('a');
    a.href = url; a.download = 'control-banc-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    cerrarMenu(); avisar('Còpia de seguretat descarregada.', false, false);
  }
  function importarObjeto(obj) {
    var nuevo = L.validarEstado(obj && obj.estado ? obj.estado : obj);
    datos.historial.push({ estado: datos.estado, etiqueta: 'Dades restaurades' });
    datos.estado = nuevo; guardar(); pintar();
  }
  function importarArchivo(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        if (confirm('Es substituiran les dades actuals per les de la còpia. Es pot desfer. Continuar?')) {
          importarObjeto(JSON.parse(r.result)); cerrarMenu(); avisar('Dades restaurades.', false, true);
        }
      } catch (e) { avisar('No s\'ha pogut restaurar: ' + e.message, true); }
    };
    r.readAsText(file);
  }
  async function cambiarPrestec() {
    cerrarMenu();
    var n = await pedirNumero('Import total del préstec (ara ' + L.moneda(datos.estado.prestecTotal) + ')');
    if (n === null) { return; }
    if (n <= 0) { avisar('L\'import ha de ser més gran que 0.', true); return; }
    datos.historial.push({ estado: datos.estado, etiqueta: 'Import del préstec' });
    datos.estado = Object.assign({}, datos.estado, { prestecTotal: n }); guardar(); pintar();
    avisar('Import del préstec actualitzat.', false, true);
  }
  function esborrar() {
    if (!confirm('Això esborra TOTES les dades d\'aquest telèfon. Segur?')) { return; }
    if (!confirm('Última confirmació: s\'esborraran saldos, mensualitats i historial.')) { return; }
    datos = { estado: L.estadoInicial(), historial: [] }; guardar(); pintar(); cerrarMenu();
    avisar('Dades esborrades.', false, false);
  }

  // Enlace de importación: abrir la app con  #importar=<datos en base64>  carga los datos una vez
  function importarDesdeEnlace() {
    var m = /^#importar=(.+)$/.exec(location.hash);
    if (!m) { return; }
    try {
      var json = decodeURIComponent(escape(atob(m[1].replace(/-/g, '+').replace(/_/g, '/'))));
      var obj = JSON.parse(json);
      var vacio = JSON.stringify(datos.estado) === JSON.stringify(L.estadoInicial());
      if (vacio || confirm('Hi ha dades noves per importar. Substituir les actuals?')) {
        importarObjeto(obj); avisar('Dades importades.', false, true);
      }
    } catch (e) { avisar('L\'enllaç d\'importació no és vàlid.', true); }
    history.replaceState(null, '', location.pathname + location.search);   // no dejar los datos en la barra de direcciones
  }

  // ---------- Eventos ----------
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-accion]');
    if (b) { pulsar(b.getAttribute('data-accion')); }
  });
  el('btnMes').onclick = function () { pulsar('BotonMes'); };
  el('btnDesfer').onclick = desfer;
  el('avisDesfer').onclick = function () { el('avis').className = ''; desfer(); };
  el('btnMenu').onclick = abrirMenu;
  el('mnTancar').onclick = cerrarMenu;
  el('fonsMenu').onclick = function (e) { if (e.target === el('fonsMenu')) { cerrarMenu(); } };
  el('mnExportar').onclick = exportar;
  el('mnImportar').onclick = function () { el('fitxer').click(); };
  el('fitxer').onchange = function () { if (this.files[0]) { importarArchivo(this.files[0]); this.value = ''; } };
  el('mnPrestec').onclick = cambiarPrestec;
  el('mnEsborrar').onclick = esborrar;

  importarDesdeEnlace();
  pintar();
  // Pide al navegador que no borre los datos si falta espacio
  if (navigator.storage && navigator.storage.persist) { navigator.storage.persist(); }

  // Funcionamiento sin conexión
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(function () { /* sin modo offline: la app sigue funcionando */ });
  }
})();
