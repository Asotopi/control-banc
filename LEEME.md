# Control Banc (app para el móvil)

Basada en tu Excel **CONTROL - BANC**. Muestra cinco tarjetas: **CASA, COTXE, VACANCES, ESTALVIS** y el
**PRESTEC de 20.000 €**, con sus importes mensuales y el botón de pasar de mes. **Los datos viven solo en tu móvil.**

- **ESTALVIS** es nuevo (no está en el Excel): empieza en 0, tiene botón **+** y **↻** y un importe mensual que se
  suma solo al pasar de mes.
- BBVA, BBVA - ESTALVIS, Sabadell, Openbank, IBI y la revisión del coche ya **no se muestran**. Sus datos siguen
  guardados por dentro (no se pierde nada), pero no se pueden ver ni editar desde la app.

| Archivo | Para qué |
|---|---|
| `index.html`, `app.js`, `logic.js` | La app: pantalla, botones y cálculos |
| `sw.js` | Permite usarla sin Internet |
| `manifest.webmanifest`, `icon-192.png`, `icon-512.png` | Para instalarla con su icono |

> Tus datos actuales NO están en estos archivos. Están aparte, en `..\CONTROL-BANC-PRIVADO\`.
> **No subas esa carpeta a ningún sitio público.**

## 1. Publicarla (una vez)

Para instalarla en el móvil y que funcione sin Internet, la app tiene que estar en una dirección **https**.
La carpeta `CONTROL-BANC-MOVIL` no contiene nada personal, así que puede estar en un sitio público.

### Opción A: GitHub Pages (gratis)
1. En `github.com/new`: nombre `control-banc`, **Public**, sin README. *Create repository*.
2. En una terminal, dentro de `CONTROL-BANC-MOVIL`:
   ```bash
   git init -b main
   git add .
   git commit -m "Control Banc"
   git remote add origin https://github.com/TU_USUARIO/control-banc.git
   git push -u origin main
   ```
3. En el repositorio: **Settings → Pages → Branch: main / (root) → Save**.
4. En 1-2 minutos tu app estará en `https://TU_USUARIO.github.io/control-banc/`.

### Opción B: Netlify (arrastrar y soltar)
En `app.netlify.com/drop` arrastra la carpeta `CONTROL-BANC-MOVIL`. Te da una dirección https.
(Crea una cuenta gratuita para que no caduque.)

> La app no tiene contraseña: cualquiera que conozca la dirección puede abrirla, pero verá **su propia** app vacía.
> Nunca verá tus datos, porque no salen de tu teléfono.

## 2. Instalarla en el móvil
- **Android (Chrome):** abre la dirección → menú ⋮ → **Instalar aplicación** (o *Añadir a pantalla de inicio*).
- **iPhone (Safari):** abre la dirección → botón Compartir → **Añadir a pantalla de inicio**.

## 3. Cargar tus datos actuales (una vez)
Tus saldos de hoy están en `CONTROL-BANC-PRIVADO\enlace-importar.txt`. Es un texto que empieza por `#importar=`.
1. Escribe en el móvil tu dirección seguida de ese texto, sin espacios:
   `https://TU_USUARIO.github.io/control-banc/` + `#importar=...`
   (pásatelo a ti mismo por un medio privado, por ejemplo mensajes guardados).
2. Se abre la app, importa los datos y borra el texto de la barra de direcciones.
   La parte que va detrás de `#` **no se envía a ningún servidor**.

Alternativa: **Menú ⋮ → Restaurar una còpia** y elige `CONTROL-BANC-PRIVADO\mis-datos-copia.json`.

## 4. Uso
Igual que el Excel:

| Botón | Qué hace |
|---|---|
| **+** verde / **−** rojo | Suma o resta al saldo de BBVA (o suma a ahorros) |
| **↻** azul | «Actualitza saldo»: pones el saldo real de la cuenta |
| **ℹ** y el chip gris | Define el importe mensual de esa partida |
| Monedas (préstamo) | «Amortitzar préstec» |
| Barra gris del mes | Pasa al mes siguiente: suma las mensualidades y las descuenta de BBVA |

Cada botón pregunta con el mismo texto que el Excel y solo acepta números (`1.500,25` y `1500,25` valen).

## Lo que he añadido (el Excel no lo tiene)
- **Deshacer** (flecha arriba a la derecha, y en el aviso de abajo): guarda las últimas 40 operaciones. Útil porque
  «mes siguiente» no pide confirmación.
- **Copia de seguridad** y **restaurar** desde el menú ⋮.
- Los saldos negativos salen en rojo.

## Diferencias con el Excel
- **Cancelar un «Reset» no cambia nada.** En el Excel, si cancelabas, el saldo se quedaba a 0 (el VBA lo pone a 0 *antes* de preguntar).
  Aquí cancelar no toca nada, que es lo que se espera en el móvil. Con «Deshacer» tienes la red de seguridad.
- **Idioma:** las partidas y las preguntas están en catalán, como en tu Excel.
- **No se sincroniza** con el Excel ni con Google Sheets. Esta app y el libro son independientes.
- **Hay que hacer copias.** Si borras los datos del navegador o pierdes el móvil, se pierden los datos. Haz una copia de vez en cuando
  (Menú ⋮ → Fer còpia de seguretat) y guárdala en tu Drive.
- Los datos están ligados al navegador/app donde los cargaste: si la abres en otro móvil o navegador, estará vacía hasta que restaures una copia.

## Qué se ha comprobado
- La lógica de las 22 macros da el mismo resultado que el VBA original en 60 secuencias aleatorias de operaciones.
- Todos los valores que muestra coinciden con las fórmulas reales de tu libro en 40 estados distintos.
- Pantalla, botones, deshacer, importar por enlace y datos al recargar, probados en un navegador con tamaño de móvil.
- **No probado en un móvil real** ni el modo sin conexión (el navegador de pruebas no permite registrarlo; su lógica se ha
  comprobado con un simulador). Si algo falla al instalarla o abrirla sin Internet, dímelo.
