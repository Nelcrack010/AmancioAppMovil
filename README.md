# Campus AV Móvil — App (React Native + Expo)

Aplicación móvil del Campus Virtual del colegio **Amancio Varona** (Tumán). Consume la API
REST del proyecto `AmancioAppBackend` (JWT) y respeta la identidad visual del campus web:
guinda `#701C32`, azul `#093E7A`, crema `#FFF1E3` y la fuente **Lato**.

A diferencia del campus web, que tiene un menú lateral, aquí cada rol navega con una
**barra de menú inferior**: las opciones principales siempre están a la vista y el resto
aparece al tocar **"Más"**.

---

## Cómo ejecutar y probar todo en local (guía para el equipo)

Todo funciona con el **backend en tu PC** (no hace falta internet ni el servidor de Oracle):
mensajería en tiempo real, notificaciones, archivos, asistencia, etc.

### 1. Antes de empezar
- El **backend** debe estar corriendo en tu PC con `python run.py` (ver el README de
  `AmancioAppBackend`, sección *Probar la app en local*). Debe responder en
  `http://localhost:5000`.
- En el celular instala **Expo Go** (Play Store) e **inicia sesión en Expo Go** con una
  cuenta de Expo. Si no inicias sesión, el QR puede no abrir el proyecto.
- Instala las dependencias de la app (la primera vez y cada vez que alguien agregue una):
  ```bash
  npm install
  ```

### 2. Conectar el celular con tu PC (elige UNA forma)

**A. Por cable USB (recomendada: no depende del WiFi ni del router)**
1. En el celular activa *Opciones de desarrollador → Depuración USB*, conéctalo y acepta
   **"¿Permitir depuración USB?"**.
2. Pasa los puertos de la PC al celular por el cable (`adb` está en
   `%LOCALAPPDATA%\Android\Sdk\platform-tools`, viene con Android Studio):
   ```bash
   adb reverse tcp:8081 tcp:8081
   adb reverse tcp:5000 tcp:5000
   ```
   Si desconectas el cable o reinicias el celular, vuelve a ejecutar estos dos comandos.
3. Crea el archivo `.env.local` (copia de `.env.example`) con:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:5000
   ```

**B. Por WiFi (celular y PC en la misma red)**
1. Mira la IP de tu PC con `ipconfig` (por ejemplo `192.168.18.64`).
2. Crea `.env.local` con:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.18.64:5000
   ```
3. Si Windows pregunta por el firewall al iniciar Python o Node, elige **Permitir**.
   Algunos routers no dejan que el WiFi hable con una PC conectada por cable: en ese caso
   usa la forma A.

> `.env.local` no se sube a Git: cada uno pone su propia dirección.

### 3. Iniciar la app
```bash
npx expo start -c --go
```
- Con cable USB agrega `--localhost`: `npx expo start -c --go --localhost`.
- `--go` hace que el QR sea para **Expo Go** (el proyecto también tiene `expo-dev-client`;
  sin `--go` el QR es para una development build y Expo Go muestra *"Can't open this
  project"*). Si ya está corriendo, presiona `s` para cambiar a Expo Go.
- `-c` limpia la caché: úsalo siempre que cambies `.env.local`.
- **Celular:** escanea el QR con Expo Go. La primera carga tarda unos segundos.
- **Navegador de la PC:** presiona `w` (se abre `http://localhost:8081`). Sirve como
  "segundo usuario" para las pruebas. El backend debe tener
  `ALLOWED_ORIGINS=http://localhost:8081` en su `.env`.

### 4. Usuarios de prueba
La contraseña es el **DNI** (el número del usuario). Ver la lista completa en el README del backend.

| Usuario | Rol | Para probar |
|---|---|---|
| `ALU-33333333` Lucía | Alumna (3ro A) | entregas, avisos, chat, mi asistencia |
| `DOC-22222222` Carlos | Docente (Matemática) | publicar tareas, entregas, chat |
| `AUX-77777777` Jorge | Auxiliar | registrar asistencia y justificar |
| `PSI-88888888` Elena | Psicóloga | agenda y citas |

En el celular, cuando la app pida **permiso de notificaciones**, toca **Permitir**.

### 5. Qué probar (celular = Lucía, navegador = Carlos)

**Mensajería en tiempo real (WebSocket)**
1. Celular: *Mensajes* → conversación con Carlos. Navegador: *Mensajes* → Lucía.
2. Escribe desde el navegador: aparece **al instante** en el celular (sin recargar).
3. Responde desde el celular: aparece al instante en el navegador; cuando Carlos tiene el
   chat abierto, en el celular tu mensaje dice **"· leído"**.

**Notificaciones**
1. Celular: sal del chat (por ejemplo a *Inicio*) y deja la pantalla **encendida**.
2. Navegador: Carlos escribe otro mensaje → en el celular suena **"Mensaje de Carlos…"** y
   sube el globo de *Mensajes*. Al tocar la notificación se abre el chat.
3. Navegador: Carlos publica una tarea (*Mis cursos → Matemática 3ro A → Tareas*) →
   en el celular llega **"Nueva tarea de Matemática"**.

**Silenciar o limitar notificaciones**
1. Celular: *Mi perfil → Notificaciones* (o *Avisos → Configurar*).
2. Apaga *Tareas nuevas* → **Guardar**. Publica otra tarea: el celular **no suena**, pero el
   aviso sí aparece en *Avisos*.
3. Prueba también *Pausar 1 hora* y el horario *no molestar*. Vuelve a dejarlo todo activo.

**Tareas con archivo**
1. Navegador (Carlos): publica una tarea y adjunta un PDF como enunciado (opcional).
2. Celular (Lucía): abre la tarea → **Elegir archivo** (PDF, Word, Excel, PowerPoint,
   imagen o ZIP, máx. 10 MB) y/o pega un enlace → **Entregar**.
3. Navegador (Carlos): en *Entregas* aparece el archivo; tócalo para abrirlo o descargarlo.

**Asistencia justificada**
1. Entra como Jorge (`AUX-77777777`) → *Asistencia*. Marca a un alumno con **T** (o **F**).
2. Toca **J**: quedan marcados **los dos** botones (T + J). Confirma.
3. Vuelve a abrir el día: siguen marcados T + J. El alumno ve "Tardanza" + "Justificada"
   en *Mi asistencia*.

### 6. Si algo falla
| Problema | Solución |
|---|---|
| Expo Go: *"Can't open this project"* | Inicia con `--go` (o presiona `s`) y vuelve a escanear. |
| El QR no abre la app | Inicia sesión en Expo Go; con cable, usa `--localhost` y `adb reverse`. |
| *"No hay conexión con el servidor"* | Revisa que el backend esté prendido, la dirección de `.env.local` (y reinicia con `-c`), el firewall o el `adb reverse`. |
| Los mensajes tardan unos segundos | El WebSocket no conectó y la app usa el respaldo (pregunta cada 2,5 s). Revisa que el backend se haya iniciado con `python run.py` y que tenga `Flask-SocketIO` instalado (`pip install -r requirements.txt`). |
| No suenan las notificaciones | *Ajustes → Aplicaciones → Expo Go → Notificaciones* → activarlas. La app también muestra un botón **"Activar notificaciones"** en *Avisos* si falta el permiso. |
| No llegan con la pantalla apagada | Normal en Expo Go: Android pausa la app. Con la app cerrada o la pantalla apagada solo llegan push reales, que necesitan una *development build* y `PUSH_ACTIVO=1` en el backend. |
| El login en el navegador falla | El backend necesita `ALLOWED_ORIGINS=http://localhost:8081` en su `.env` (y reiniciarlo). |

Para emulador Android: presiona `a` en la terminal de Expo (los emuladores no reciben push,
pero sí el WebSocket y las notificaciones locales).

---

## Arquitectura (MVVM + Repository, con caché y modo sin conexión)

```
Pantalla (views) → ViewModel (viewmodels) → Repositorio (repositories) → Servicio HTTP (services/api) → API REST
                                                  │
                                                  └→ DAO (database/dao) → SQLite del celular
```

| Capa | Carpeta | Qué hace |
|---|---|---|
| Pantallas | `src/views/` | Solo dibujan y capturan eventos. Una carpeta por rol o módulo. |
| Componentes | `src/components/` | Piezas reutilizables: `Lista` + `ItemLista` (listas agrupadas, la forma estándar de mostrar listas), `Texto`, `Boton`, `Campo`, `Tarjeta`, `Etiqueta`, `Selector`, estados (`Cargando`, `Vacio`, `ErrorVista`, `Aviso`) y la barra de menú (`menu/`). |
| ViewModels | `src/viewmodels/` | Estado de la pantalla. `useConsulta` (mostrar datos) y `useAccion` (guardar, enviar) sirven para casi todo; las pantallas complejas tienen el suyo (chat, asistencia, notas). |
| Repositorios | `src/repositories/` | Única puerta a los datos. Deciden si leer la caché, llamar a la API o dejar la operación pendiente. |
| Servicio HTTP | `src/services/api/` | Un archivo por módulo de la API. `apiClient.js` agrega el JWT y traduce los errores (400, 401, 403, 404, 409, 500, sin conexión). |
| Base local | `src/database/` | SQLite: `cache_consulta` (últimas respuestas) y `operacion_pendiente` (cola sin conexión). |
| Estado global | `src/context/` | `SesionContext` (usuario, token, contadores de no leídos) y `ConexionContext` (red y pendientes). |
| Navegación | `src/navigation/` | `AppNavigator` (login → primer ingreso → campus), `MenuNavigator` (barra del rol) y `pantallas.js` (registro de pantallas). |
| Configuración | `src/config/` | `tema.js` (colores y tipografía), `menus.js` (menú de cada rol), `estados.js` (textos y colores de estados), `constants.js` (URL de la API). |
| Utilidades | `src/utils/` | Fechas, validaciones, diálogos e id de operación. |

### Cómo modificar lo más común

- **Cambiar colores, fuente o espaciado:** solo `src/config/tema.js`. Ninguna pantalla
  escribe colores a mano.
- **Agregar, quitar o reordenar opciones del menú de un rol:** `src/config/menus.js`.
  Las primeras 4 van en la barra; el resto, en "Más" (`MAXIMO_EN_BARRA`).
- **Agregar una pantalla nueva:**
  1. Créala en `src/views/...` usando `<Pantalla>` y `useConsulta`.
  2. Regístrala en `src/navigation/pantallas.js` (`PANTALLAS_MENU` o `PANTALLAS_DETALLE`).
  3. Si va en el menú, agrégala en `src/config/menus.js`.
- **Agregar un endpoint:** función en `src/services/api/<modulo>Api.js` y luego en su repositorio.
- **Hacer que otra operación funcione sin conexión:** agrégala en `ENVIOS` de
  `src/repositories/colaRepository.js` (la API debe aceptar la cabecera `X-Id-Operacion`).
- **Tiempo real:** la conexión WebSocket está en `src/services/tiempoRealService.js`
  (`escucharTiempoReal('mensaje', fn)`); los intervalos de respaldo, en `src/config/tiempoReal.js`.
  Para que otra pantalla se actualice sola: `useConsulta(fuente, deps, { actualizarCada, tiposPush })`.
- **Tipos de archivo que se pueden subir y tamaño máximo:** `src/config/archivos.js`
  (deben coincidir con `archivo_service.py` del backend).
- **Ícono y pantalla de cada notificación:** `src/config/notificaciones.js`. El nombre,
  la descripción y quién recibe cada tipo están en `TIPOS` del backend.
- **Cómo se marcan los botones de asistencia (justificar):** `tocarAsistencia` y
  `botonAsistenciaActivo` en `src/config/estados.js`.

## Tiempo real, archivos y notificaciones

- **Mensajería y avisos en tiempo real (WebSocket):** al iniciar sesión la app abre una
  conexión WebSocket con el backend (`src/services/tiempoRealService.js`). Los mensajes,
  el "leído", los avisos y los globos llegan **al instante**, sin preguntar al servidor.
  Funciona con el backend local (`python run.py`), sin internet y en **Expo Go**.
  Si el WebSocket no conecta, las pantallas preguntan cada pocos segundos (respaldo).
- **Notificaciones en el celular sin development build:** cada aviso que llega por el
  WebSocket se muestra como notificación del celular (si el usuario no lo silenció) y al
  tocarla se abre su pantalla. Con la app cerrada solo llegan los push (development build
  + `PUSH_ACTIVO=1`).
- **Entregar tareas con archivo:** PDF, Word, Excel, PowerPoint, imágenes o ZIP (máx. 10 MB),
  y/o un enlace. El docente puede adjuntar el enunciado como archivo.
- **Silenciar o limitar notificaciones:** *Mi perfil → Notificaciones* (o *Avisos →
  Configurar*): silenciar todas, pausar 1/8/24 h, horario "no molestar" y elegir qué tipos
  recibir. Solo afecta al celular: los avisos siguen en la lista.
- **Asistencia justificada:** al justificar una T o F, quedan marcados los dos botones
  (por ejemplo T + J) y el alumno ve "Tardanza" + "Justificada".

---

## Menú de cada rol

| Rol | Barra de menú | Dentro de "Más" |
|---|---|---|
| Estudiante | Inicio · Cursos · Notas · Mensajes | Horario, Asistencia, Conducta, Citas psicología, Avisos, Mi perfil |
| Docente | Inicio · Mis cursos · Horario · Mensajes | Avisos, Mi perfil |
| Auxiliar | Inicio · Asistencia · Conducta · Mensajes | Reporte de asistencia, Catálogo de faltas, Avisos, Mi perfil |
| Psicólogo | Inicio · Agenda · Mensajes · Faltas | Avisos, Mi perfil |
| Administrador (solo consulta) | Inicio · Asistencia · Mensajes · Faltas | Avisos, Mi perfil |

"Cerrar sesión" está en "Más" y en "Mi perfil". La campana de la cabecera abre los avisos.

## Pantallas por módulo

| Módulo | Pantallas |
|---|---|
| Sesión | Inicio de sesión, cambio obligatorio de contraseña (primer ingreso), cambio de contraseña |
| Inicio | Panel distinto por rol (`views/inicio/Inicio<Rol>.jsx`) |
| Cursos | Lista, aula virtual por pestañas (tareas, materiales, clases, estudiantes), entrega de tarea, entregas y calificación, publicar/editar tarea, material o clase |
| Notas | Notas por bimestre y libreta (estudiante); registro por evaluación y cierre de bimestre (docente) |
| Asistencia | Consulta propia (estudiante); registro diario por sección con confirmación y aviso de cambios sin guardar (auxiliar); reporte por fechas (auxiliar, admin) |
| Conducta | Nota y reportes (estudiante); búsqueda por sección, registro y anulación de reportes (auxiliar); catálogo de faltas |
| Citas | Solicitud e historial (estudiante); agenda, programar/reprogramar, atender, cancelar e historial con observaciones (psicólogo) |
| Mensajería | Conversaciones, contactos según el rol y chat |
| Otros | Avisos (notificaciones), perfil y matrícula, edición de datos, operaciones pendientes |

## Modo sin conexión

- **Lectura:** cada consulta se guarda en SQLite. La pantalla muestra primero lo guardado y
  luego lo actualiza; sin red aparece "Sin conexión: mostrando los últimos datos guardados".
- **Escritura:** asistencia, reportes de conducta, entregas de tareas, solicitudes de cita,
  notas y mensajes se guardan como **PENDIENTE** con un id único si no hay red. Se envían solos
  al volver la conexión (o con "Enviar ahora" en *Operaciones pendientes*). La API reconoce el
  id (`X-Id-Operacion`) y nunca registra dos veces lo mismo.
- Un aviso sobre la barra de menú muestra el modo sin conexión y cuántas operaciones faltan.
- Al **cerrar sesión** se borran la caché y la cola del usuario; si el **token vence**, se
  conservan y se envían al volver a entrar.

## Pendiente

- **Push en el celular:** requiere una *development build* (Expo Go en Android no recibe
  push) y `PUSH_ACTIVO=1` en el servidor.
- **Evidencias de conducta con archivo:** siguen siendo un enlace (solo las tareas aceptan archivos).
- **Ajuste de la nota de conducta por el tutor** y **lista de seguimiento** del psicólogo:
  faltan los endpoints en la API.
