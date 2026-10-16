/* CONTROL - BANC (móvil): interfaz, almacenamiento local, deshacer y copias de seguridad. */
(function () {
  'use strict';
  var L = window.ControlBanc;
  var CLAVE = 'controlbanc.v1';
  var MAX_HISTORIAL = 40;

  // ---------- Iconos (propios, SVG) ----------
  var ICONOS = {
    refresh: '<path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>',
    info: '<path d="M11 7h2v2h-2zm0 4h2v6h-2z"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>',
    monedes: '<path d="M12 3C7 3 4 4.6 4 6.5v11C4 19.4 7 21 12 21s8-1.6 8-3.5v-11C20 4.6 17 3 12 3zm0 2c3.9 0 6 .9 6 1.5S15.9 8 12 8 6 7.1 6 6.5 8.1 5 12 5zm6 12.5c0 .6-2.1 1.5-6 1.5s-6-.9-6-1.5v-2.2c1.4.8 3.6 1.2 6 1.2s4.6-.4 6-1.2v2.2zm0-4.5c0 .6-2.1 1.5-6 1.5s-6-.9-6-1.5v-2c1.4.8 3.6 1.2 6 1.2s4.6-.4 6-1.2v2zm0-4.5c0 .6-2.1 1.5-6 1.5s-6-.9-6-1.5V8.5C7.4 9.3 9.6 9.7 12 9.7s4.6-.4 6-1.2v2z"/>'
  };
  function icono(nombre) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[nombre] + '</svg>'; }

  // ---------- Ilustraciones pastel (propias, planas y sin contornos) ----------
  var DIBUJOS = {
    casa: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="42" y="12" width="8" height="14" rx="2" fill="#e9a948"/>' +
      '<rect x="12" y="28" width="40" height="28" rx="4" fill="#f7d681"/>' +
      '<path d="M32 9 L6 31 H58 Z" fill="#e9a948" stroke="#e9a948" stroke-width="5" stroke-linejoin="round"/>' +
      '<rect x="27" y="39" width="10" height="17" rx="3" fill="#fff"/><rect x="15" y="36" width="9" height="9" rx="2.5" fill="#fff"/><rect x="40" y="36" width="9" height="9" rx="2.5" fill="#fff"/></svg>',
    cotxe: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M15 33 L22 20 Q23.5 17 27 17 H40 Q43.5 17 45.4 20 L53 33 Z" fill="#f0955a"/>' +
      '<rect x="5" y="30" width="54" height="17" rx="7" fill="#f0955a"/>' +
      '<path d="M21.5 30 L26.5 20.5 H31.5 V30 Z" fill="#fff3e8"/><path d="M35 30 V20.5 H40 Q41.3 20.5 42 21.6 L47.5 30 Z" fill="#fff3e8"/>' +
      '<rect x="53" y="34" width="5" height="4" rx="2" fill="#fff3e8"/>' +
      '<circle cx="19" cy="47" r="7.5" fill="#b86a3a"/><circle cx="19" cy="47" r="3" fill="#fde5cf"/><circle cx="46" cy="47" r="7.5" fill="#b86a3a"/><circle cx="46" cy="47" r="3" fill="#fde5cf"/></svg>',
    vacances: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="52" cy="12" r="7" fill="#ffd47a"/>' +
      '<ellipse cx="32" cy="55" rx="23" ry="5" fill="#f5deaa"/>' +
      '<rect x="30.5" y="24" width="3" height="31" rx="1.5" fill="#8d6fc4"/>' +
      '<path d="M8 29 A24 22 0 0 1 56 29 Z" fill="#b79ae6"/>' +
      '<path d="M32 7 C26 13 24 21 24 29 H40 C40 21 38 13 32 7 Z" fill="#d9c9f5"/>' +
      '<path d="M5 61 q6.5-5 13 0 t13 0 t13 0 t13 0" stroke="#9fc3ee" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
    estalvis: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="11" r="8" fill="#ffd878"/><circle cx="32" cy="11" r="4.5" fill="#fff0b8"/>' +
      '<ellipse cx="31" cy="38" rx="22" ry="17" fill="#f6b3c0"/>' +
      '<rect x="16" y="49" width="8" height="10" rx="3.5" fill="#ee94a8"/><rect x="38" y="49" width="8" height="10" rx="3.5" fill="#ee94a8"/>' +
      '<path d="M37 25 L45 16 L48 28 Z" fill="#ee94a8" stroke="#ee94a8" stroke-width="2" stroke-linejoin="round"/>' +
      '<ellipse cx="53" cy="39" rx="6.5" ry="5.5" fill="#ee94a8"/><circle cx="51.2" cy="39" r="1.2" fill="#c8697f"/><circle cx="55" cy="39" r="1.2" fill="#c8697f"/>' +
      '<circle cx="43" cy="33" r="2.1" fill="#5a3b45"/><rect x="23" y="22" width="13" height="3" rx="1.5" fill="#d9788f"/>' +
      '<path d="M9.5 37 q-6-2-4.5-8" stroke="#ee94a8" stroke-width="3" fill="none" stroke-linecap="round"/></svg>'
  };

  // ---------- Qué tarjetas se muestran ----------
  // acciones: [nombre de la macro, icono, etiqueta]. Las cuatro reservas son idénticas (↻ + importe mensual ℹ).
  // BBVA, BBVA-ESTALVIS, Sabadell, Openbank, IBI y la revisión del coche siguen en los datos pero no se muestran.
  var TARJETAS = [
    { id: 'casa', titulo: 'CASA', dibujo: 'casa', clase: 'c-casa', saldo: 'casa', acciones: [['ResetCasa', 'refresh', 'Actualitzar saldo']], mensual: ['InfoCasa', 'casa'] },
    { id: 'cotxe', titulo: 'COTXE', dibujo: 'cotxe', clase: 'c-cotxe', saldo: 'cotxe', acciones: [['ResetCotxeSeguro', 'refresh', 'Actualitzar saldo']], mensual: ['InfoCotxeSeguro', 'cotxe'] },
    { id: 'vacances', titulo: 'VACANCES', dibujo: 'vacances', clase: 'c-vacances', saldo: 'vacances', acciones: [['ResetVacances', 'refresh', 'Actualitzar saldo']], mensual: ['InfoVacances', 'vacances'] },
    { id: 'estalvis', titulo: 'ESTALVIS', dibujo: 'estalvis', clase: 'c-estalvis', saldo: 'ahorros', acciones: [['ResetAhorros', 'refresh', 'Actualitzar saldo']], mensual: ['InfoAhorros', 'ahorros'] },
    { id: 'prestec', tipo: 'prestec', titulo: 'PRÉSTEC', clase: 'c-prestec ample', acciones: [['Amortitzar', 'monedes', 'Amortitzar préstec']], mensual: ['InfoPrestec', 'prestec'] }
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

  function boton(nombre, icon, etiqueta) {
    return '<button class="accio" data-accion="' + nombre + '" aria-label="' + esc(etiqueta) + '" title="' + esc(etiqueta) + '">' + icono(icon) + '</button>';
  }
  // Fila inferior: importe mensual a la izquierda; ℹ (mensual) y las acciones de la tarjeta a la derecha
  function filaInferior(t, v) {
    var xip = t.mensual ? '<span class="xip" title="Import mensual">' + esc(L.importe(v.importes[t.mensual[1]])) + '</span>' : '<span></span>';
    var b = '';
    if (t.mensual) { b += boton(t.mensual[0], 'info', 'Definir import mensual'); }
    t.acciones.forEach(function (a) { b += boton(a[0], a[1], a[2]); });
    return '<div class="fila">' + xip + '<div class="accions">' + b + '</div></div>';
  }
  function tarjeta(t, v) {
    if (t.tipo === 'prestec') {
      var pct = Math.max(0, Math.min(1, v.prestecPorcentaje));
      return '<section class="targeta ' + t.clase + '"><div class="titol">PRÉSTEC ' + esc(L.moneda(datos.estado.prestecTotal).replace(',00', '')) + '</div>' +
        '<div class="saldo' + (v.prestecRestante < 0 ? ' neg' : '') + '">' + esc(L.moneda(v.prestecRestante)) + '</div>' +
        '<div class="barra-pr"><i style="width:' + (pct * 100).toFixed(1) + '%"></i></div>' +
        '<div class="pr-info"><b>' + L.porcentaje(v.prestecPorcentaje) + ' amortitzat</b><span>Pagat ' + esc(L.moneda(v.prestecPagado + L.num(datos.estado.datos.B13))) + '</span></div>' +
        filaInferior(t, v) + '</section>';
    }
    var s = v[t.saldo];
    return '<section class="targeta ' + t.clase + '"><div class="titol">' + esc(t.titulo) + '</div>' +
      (t.dibujo ? '<div class="dibuix">' + DIBUJOS[t.dibujo] + '</div>' : '') +
      '<div class="saldo' + (s < 0 ? ' neg' : '') + '">' + esc(L.moneda(s)) + '</div>' + filaInferior(t, v) + '</section>';
  }
  function pintar() {
    var v = L.calcular(datos.estado, new Date().getFullYear());
    el('titolMes').textContent = v.titulo;
    el('panell').innerHTML = TARJETAS.map(function (t) { return tarjeta(t, v); }).join('');
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
      el('avis').className = '';   // el aviso de abajo no debe tapar los botones del cuadro
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
  // Texto legible de cada acción para los avisos: «ESTALVIS · Actualitzar saldo»
  var NOMBRES = {};
  TARJETAS.forEach(function (t) {
    t.acciones.forEach(function (a) { NOMBRES[a[0]] = t.titulo + ' · ' + a[2]; });
    if (t.mensual) { NOMBRES[t.mensual[0]] = t.titulo + ' · import mensual'; }
  });
  function etiqueta(nombre, valor) {
    var base = nombre === 'BotonMes' ? 'Mes següent' : (NOMBRES[nombre] || nombre);
    return base + (valor === null || valor === undefined ? '' : ' ' + L.moneda(valor));
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
  function abrirMenu() { el('avis').className = ''; el('fonsMenu').classList.add('on'); }
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
  // El menú se cierra tocando fuera de él o con Escape (ya no hay botón «Tancar»)
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { cerrarMenu(); } });
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
    var teniaControlador = !!navigator.serviceWorker.controller;
    var recargado = false;
    // Cuando se publica una versión nueva, la app se recarga sola una vez para usarla (no en la primera instalación)
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (teniaControlador && !recargado) { recargado = true; location.reload(); }
    });
    navigator.serviceWorker.register('sw.js').catch(function () { /* sin modo offline: la app sigue funcionando */ });
  }
})();
