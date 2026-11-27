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

**C. Cambiar el servidor desde la app (sin tocar `.env.local` ni volver a compilar)**
En la pantalla de inicio de sesión, abajo, toca **"Servidor: … · Cambiar"**, escribe la
dirección del backend (por ejemplo `http://192.168.18.64:5000`) y toca **Probar y guardar**.
La app comprueba que el backend responda (`GET /`) antes de guardarla, y la recuerda al
volver a abrirse. Así el mismo **APK** sirve en cualquier PC.

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
| *"No hay conexión con el servidor"* | Revisa que el backend esté prendido, la dirección de `.env.local` (y reinicia con `-c`) o la de **"Servidor: … · Cambiar"** en el login, el firewall o el `adb reverse`. |
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

<!-- GUIA-MODULOS:INICIO -->
## Guía de modificación por módulo (backend + app)

> Para el examen: cada archivo de los dos repositorios empieza con una **GUÍA** (qué hace, quién lo
> llama, a qué llama y qué tocar) y tiene comentarios **`PISTA:`** en los puntos clave (cada endpoint,
> cada función del service y del repository, cada consulta de una pantalla y dónde empieza el JSX).
> En VS Code: **Ctrl+Shift+F → `PISTA:`** o el nombre de lo que te piden.
>
> Esta misma guía está en los dos README. Las rutas `app/...`, `database/...` y `run.py` son del
> repositorio **AmancioAppBackend**; las rutas `src/...` son del repositorio **AmancioAppMovil**.
> Abre las dos carpetas en la misma ventana de VS Code (*Archivo → Agregar carpeta al área de trabajo*)
> para buscar en las dos a la vez.

### Cómo encontrar el archivo en 30 segundos

| Tienes… | Búscalo (Ctrl+Shift+F) | Te lleva a |
|---|---|---|
| Un texto que se ve en la app ("Solicitar una cita") | el texto exacto | la pantalla (`src/views/...`) |
| Un mensaje de error de la API ("ya estaba anulado") | parte del mensaje | el service (`app/services/...`) |
| Una URL (`/citas/mis-citas`) | la URL | la route del backend y el `*Api.js` de la app |
| Un nombre de pantalla del menú ("Citas psicología") | el título | `src/config/menus.js` → `pantallas.js` → la vista |
| Una tabla o columna (`reporte_conducta`) | el nombre | el repository (`app/repositories/...`) |

### Qué archivos tocar según lo que te piden

| Te piden… | Backend | App |
|---|---|---|
| Cambiar un texto, botón o etiqueta | — | la pantalla (`src/views/...`) |
| Agregar/quitar una opción del menú de un rol | — | `src/config/menus.js` (la pantalla ya existe en `pantallas.js`) |
| Cambiar colores o tamaños | — | `src/config/tema.js` (toda la app) o el `StyleSheet` de la pantalla |
| Una regla nueva (400 / 403 / 409) | el **service**: `if ...: raise ApiError(400, "mensaje")` | (opcional) la misma regla en `primerError(...)` de la pantalla |
| Cambiar un mínimo/máximo de un campo | el **service**: `texto(datos, "campo", minimo=…, maximo=…)` | `validarTexto(..., { minimo, maximo })` en la pantalla |
| Mostrar un dato que ya está en la BD | el **repository**: agrégalo al `SELECT` (o `JOIN`) | la pantalla: `{x.campo && <Texto>…</Texto>}` |
| Ordenar o filtrar una lista | el **repository**: `ORDER BY` / `AND campo = %s` | (si es un filtro) `params` en `*Api.js`, clave de caché en el repository y un `Selector` |
| Un campo nuevo que se guarda | BD (`ALTER TABLE` o `schema.sql` + `migraciones.py`) → repository (INSERT y SELECT) → service (validar y pasar) | pantalla (`useState` + `<Campo>` + payload) |
| Una acción nueva (PATCH/POST/DELETE) | route (`@bp.patch` + `@jwt_required`) → service (reglas + commit) → repository (UPDATE) | `*Api.js` → repository (`metodo: XApi.metodo`) → botón en la pantalla con `useAccion` |
| Una pantalla nueva | (si necesita datos nuevos: un GET) | vista en `src/views/...` + `src/navigation/pantallas.js` (+ `menus.js` si va al menú) |
| Cambiar quién puede usar algo | los roles de `@jwt_required(...)` en la route | `src/config/menus.js` (quién ve la opción) |

**Orden recomendado (20 min):** backend primero y pruébalo en Postman → después la app.
`BD → repository → service → route → Postman` y luego `*Api.js → repository → pantalla → navegador`.

### Módulos: qué archivos y endpoints tiene cada uno

(Generado del código: si cambias algo, la guía de cada archivo también lo dice.)

#### Sesión (login y contraseña)

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/auth_routes.py` |
| Backend · service | `app/services/auth_service.py` |
| Backend · repository | `app/repositories/usuario_repository.py` · `app/repositories/dispositivo_repository.py` |
| Tablas MySQL | `administrador`, `dispositivo_push`, `usuario` |
| App · api | `src/services/api/authApi.js` |
| App · repository | `src/repositories/sesionRepository.js` |
| App · pantallas | `LoginView.jsx`, `CambiarPasswordView.jsx`, `PerfilView.jsx` (menú: todos los roles «Mi perfil») |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `POST /usuarios/login` | público (sin token) | `login()` → `auth_service.login()` | `authApi.js` `login()` → SesionContext.jsx, LoginView.jsx |
| `GET /usuarios/mis-permisos` | cualquiera con sesión | `mis_permisos()` → `auth_service.mis_permisos()` | `authApi.js` `misPermisos()` |
| `POST /usuarios/logout` | cualquiera con sesión | `logout()` → `auth_service.logout()` | `authApi.js` `logout()` → MenuMas.jsx, SesionContext.jsx, CambiarPasswordView.jsx, PerfilView.jsx |

#### Perfil

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/perfil_routes.py` |
| Backend · service | `app/services/perfil_service.py` |
| Backend · repository | `app/repositories/perfil_repository.py` · `app/repositories/usuario_repository.py` |
| Tablas MySQL | `alumno`, `familiar`, `grado`, `matricula`, `nivel`, `seccion`, `usuario` |
| App · api | `src/services/api/perfilApi.js` · `src/services/api/authApi.js` |
| App · repository | `src/repositories/conductaRepository.js` · `src/repositories/perfilRepository.js` · `src/repositories/sesionRepository.js` |
| App · pantallas | `MiConductaView.jsx` (menú: ALUMNO «Conducta»), `PerfilView.jsx` (menú: todos los roles «Mi perfil»), `EditarPerfilView.jsx`, `CambiarPasswordView.jsx` |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `GET /perfil/mi-perfil/<username>` | cualquiera con sesión | `mi_perfil()` → `perfil_service.ver_perfil()` | `perfilApi.js` `miPerfil()` → MiConductaView.jsx, PerfilView.jsx |
| `GET /perfil/mi-matricula` | ALUMNO | `mi_matricula()` → `perfil_service.ver_matricula()` | `perfilApi.js` `miMatricula()` → PerfilView.jsx |
| `PATCH /perfil/contacto/<username>` | cualquiera con sesión | `actualizar_contacto()` → `perfil_service.actualizar_contacto()` | `perfilApi.js` `actualizarContacto()` → EditarPerfilView.jsx |
| `PATCH /perfil/alumno/<username>/direccion` | ALUMNO | `actualizar_direccion()` → `perfil_service.actualizar_direccion()` | `perfilApi.js` `actualizarDireccion()` → EditarPerfilView.jsx |
| `PATCH /perfil/alumno/<username>/medicos` | ALUMNO | `actualizar_medicos()` → `perfil_service.actualizar_medicos()` | `perfilApi.js` `actualizarMedicos()` → EditarPerfilView.jsx |
| `POST /perfil/auth/change-password` | cualquiera con sesión | `change_password()` → `perfil_service.cambiar_password()` | `authApi.js` `cambiarPassword()` → SesionContext.jsx, CambiarPasswordView.jsx |

#### Inicio (panel de cada rol)

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/inicio_routes.py` |
| Backend · service | `app/services/inicio_service.py` |
| Backend · repository | `app/repositories/perfil_repository.py` · `app/repositories/mensaje_repository.py` · `app/repositories/notificacion_repository.py` · `app/repositories/inicio_repository.py` · `app/repositories/cita_repository.py` |
| Tablas MySQL | `asistencia`, `carga_academica`, `cita_psicologia`, `clase_virtual`, `conversacion`, `curso`, `docente`, `entrega_tarea`, `grado`, `matricula`, `mensaje`, `nivel`, `nota`, `notificacion`, `reporte_conducta`, `seccion`, `tarea` |
| App · api | `src/services/api/perfilApi.js` |
| App · repository | `src/repositories/academicoRepository.js` |
| App · pantallas | `InicioView.jsx` (menú: todos los roles «Inicio») |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `GET /inicio` | cualquiera con sesión | `panel()` → `inicio_service.panel()` | `perfilApi.js` `inicio()` → InicioView.jsx |

#### Académico (año, secciones)

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/academico_routes.py` |
| Backend · service | `app/services/academico_service.py` |
| Backend · repository | `app/repositories/academico_repository.py` |
| Tablas MySQL | `anio_escolar`, `area`, `bimestre`, `curso`, `grado`, `nivel`, `seccion` |
| App · api | `src/services/api/academicoApi.js` |
| App · repository | `src/repositories/academicoRepository.js` |
| App · pantallas | `NotasCursoView.jsx`, `MisNotasView.jsx` (menú: ALUMNO «Notas»), `PublicarView.jsx`, `RegistrarAsistenciaView.jsx` (menú: AUXILIAR «Asistencia»), `ConductaView.jsx` (menú: AUXILIAR «Conducta»), `ReporteAsistenciaView.jsx` (menú: AUXILIAR «Reporte de asistencia»; ADMIN «Asistencia») |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `GET /academico/anio-activo` | cualquiera con sesión | `anio_activo()` → `academico_service.ver_anio_activo()` | `academicoApi.js` `anioActivo()` → NotasCursoView.jsx, MisNotasView.jsx, PublicarView.jsx |
| `GET /academico/grados` | cualquiera con sesión | `grados()` → `academico_service.grados()` | solo Postman |
| `GET /academico/secciones` | cualquiera con sesión | `secciones()` → `academico_service.secciones()` | `academicoApi.js` `secciones()` → RegistrarAsistenciaView.jsx, ConductaView.jsx, ReporteAsistenciaView.jsx |
| `GET /academico/cursos` | cualquiera con sesión | `cursos()` → `academico_service.cursos()` | solo Postman |

#### Horario

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/horario_routes.py` |
| Backend · service | `app/services/horario_service.py` |
| Backend · repository | `app/repositories/horario_repository.py` · `app/repositories/perfil_repository.py` |
| Tablas MySQL | `carga_academica`, `curso`, `docente`, `grado`, `horario_escolar`, `nivel`, `receso_horario`, `seccion` |
| App · api | `src/services/api/academicoApi.js` |
| App · repository | `src/repositories/academicoRepository.js` |
| App · pantallas | `HorarioView.jsx` (menú: ALUMNO, DOCENTE «Horario») |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `GET /horario/mi-horario` | ALUMNO, DOCENTE | `mi_horario()` → `horario_service.mi_horario()` | `academicoApi.js` `miHorario()` → HorarioView.jsx |

#### Aula virtual: cursos, materiales, clases y tareas

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/cursos_routes.py` · `app/routes/material_routes.py` · `app/routes/clase_routes.py` · `app/routes/tarea_routes.py` · `app/routes/archivo_routes.py` |
| Backend · service | `app/services/cursos_service.py` · `app/services/material_service.py` · `app/services/clase_service.py` · `app/services/tarea_service.py` · `app/services/archivo_service.py` |
| Backend · repository | `app/repositories/cursos_repository.py` · `app/repositories/perfil_repository.py` · `app/repositories/material_repository.py` · `app/repositories/clase_repository.py` · `app/repositories/tarea_repository.py` · `app/repositories/archivo_repository.py` |
| Tablas MySQL | `alumno`, `archivo`, `clase_virtual`, `docente`, `entrega_tarea`, `material_clase`, `matricula`, `tarea` |
| App · api | `src/services/api/cursosApi.js` |
| App · repository | `src/repositories/academicoRepository.js` · `src/repositories/colaRepository.js` |
| App · pantallas | `CursosView.jsx` (menú: ALUMNO «Cursos»; DOCENTE «Mis cursos»), `PestanaAlumnos.jsx`, `PestanaMateriales.jsx`, `PublicarView.jsx`, `PestanaClases.jsx`, `PestanaTareas.jsx`, `TareaDetalleView.jsx`, `EntregasView.jsx`, `CalificarEntregaView.jsx` |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `GET /cursos/mis-cursos` | ALUMNO, DOCENTE | `mis_cursos()` → `cursos_service.mis_cursos()` | `cursosApi.js` `misCursos()` → CursosView.jsx |
| `GET /cursos/<int:id_carga>/alumnos` | DOCENTE, ADMIN | `alumnos_del_curso()` → `cursos_service.alumnos_del_curso()` | `cursosApi.js` `alumnos()` → PestanaAlumnos.jsx |
| `GET /material/<int:id_carga>` | cualquiera con sesión | `listar()` → `material_service.listar()` | `cursosApi.js` `materiales()` → PestanaMateriales.jsx |
| `POST /material/<int:id_carga>` | DOCENTE | `publicar()` → `material_service.publicar()` | `cursosApi.js` `publicarMaterial()` → PublicarView.jsx |
| `PUT /material/item/<int:id_material>` | DOCENTE | `editar()` → `material_service.editar()` | `cursosApi.js` `editarMaterial()` → PublicarView.jsx |
| `DELETE /material/item/<int:id_material>` | DOCENTE | `eliminar()` → `material_service.eliminar()` | `cursosApi.js` `eliminarMaterial()` → PestanaMateriales.jsx |
| `GET /clases/<int:id_carga>` | cualquiera con sesión | `listar()` → `clase_service.listar()` | `cursosApi.js` `clases()` → PestanaClases.jsx |
| `POST /clases/<int:id_carga>` | DOCENTE | `crear()` → `clase_service.crear()` | `cursosApi.js` `crearClase()` → PublicarView.jsx |
| `PUT /clases/item/<int:id_clase>` | DOCENTE | `editar()` → `clase_service.editar()` | `cursosApi.js` `editarClase()` → PublicarView.jsx |
| `DELETE /clases/item/<int:id_clase>` | DOCENTE | `eliminar()` → `clase_service.eliminar()` | `cursosApi.js` `eliminarClase()` → PestanaClases.jsx |
| `GET /tareas/<int:id_carga>` | cualquiera con sesión | `listar()` → `tarea_service.listar()` | `cursosApi.js` `tareas()` → PestanaTareas.jsx |
| `GET /tareas/item/<int:id_tarea>` | cualquiera con sesión | `obtener()` → `tarea_service.obtener()` | `cursosApi.js` `tarea()` → TareaDetalleView.jsx |
| `POST /tareas/<int:id_carga>` | DOCENTE | `publicar()` → `tarea_service.publicar()` | `cursosApi.js` `publicarTarea()` → PublicarView.jsx |
| `DELETE /tareas/item/<int:id_tarea>` | DOCENTE | `eliminar()` → `tarea_service.eliminar()` | `cursosApi.js` `eliminarTarea()` → PestanaTareas.jsx |
| `POST /tareas/item/<int:id_tarea>/entregar` | ALUMNO | `entregar()` → `tarea_service.entregar()` | `cursosApi.js` `entregarTarea()` → TareaDetalleView.jsx |
| `GET /tareas/item/<int:id_tarea>/entregas` | DOCENTE | `entregas()` → `tarea_service.entregas()` | `cursosApi.js` `entregas()` → EntregasView.jsx |
| `PATCH /tareas/entregas/<int:id_entrega>/calificar` | DOCENTE | `calificar()` → `tarea_service.calificar()` | `cursosApi.js` `calificarEntrega()` → CalificarEntregaView.jsx |
| `GET /archivos/<int:id_archivo>` | público (sin token) | `abrir()` → `archivo_service.para_abrir()` | solo Postman |

#### Notas y libreta

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/nota_routes.py` |
| Backend · service | `app/services/nota_service.py` |
| Backend · repository | `app/repositories/nota_repository.py` · `app/repositories/academico_repository.py` · `app/repositories/cursos_repository.py` |
| Tablas MySQL | `alumno`, `bimestre`, `cierre_bimestre`, `curso`, `funciona`, `matricula`, `nota`, `resumen_nota`, `valor` |
| App · api | `src/services/api/notasApi.js` |
| App · repository | `src/repositories/academicoRepository.js` · `src/repositories/colaRepository.js` |
| App · pantallas | `NotasCursoView.jsx`, `MisNotasView.jsx` (menú: ALUMNO «Notas») |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `GET /notas/<int:id_carga>` | DOCENTE, ADMIN | `notas_del_curso()` → `nota_service.notas_del_curso()` | `notasApi.js` `delCurso()` → NotasCursoView.jsx |
| `POST /notas/<int:id_carga>` | DOCENTE | `registrar_notas()` → `nota_service.registrar_notas()` | `notasApi.js` `registrar()` → NotasCursoView.jsx |
| `POST /notas/<int:id_carga>/cerrar-bimestre` | DOCENTE | `cerrar_bimestre()` → `nota_service.cerrar_bimestre()` | `notasApi.js` `cerrarBimestre()` → NotasCursoView.jsx |
| `GET /notas/mis-notas` | ALUMNO | `mis_notas()` → `nota_service.mis_notas()` | `notasApi.js` `misNotas()` → MisNotasView.jsx |
| `GET /notas/mi-libreta` | ALUMNO | `mi_libreta()` → `nota_service.mi_libreta()` | `notasApi.js` `miLibreta()` → MisNotasView.jsx |

#### Asistencia

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/asistencia_routes.py` |
| Backend · service | `app/services/asistencia_service.py` |
| Backend · repository | `app/repositories/academico_repository.py` · `app/repositories/cursos_repository.py` · `app/repositories/asistencia_repository.py` |
| Tablas MySQL | `alumno`, `asistencia`, `grado`, `matricula`, `nivel`, `seccion` |
| App · api | `src/services/api/asistenciaApi.js` |
| App · repository | `src/repositories/asistenciaRepository.js` · `src/repositories/colaRepository.js` |
| App · pantallas | `RegistrarAsistenciaView.jsx` (menú: AUXILIAR «Asistencia»), `MiAsistenciaView.jsx` (menú: ALUMNO «Asistencia»), `ReporteAsistenciaView.jsx` (menú: AUXILIAR «Reporte de asistencia»; ADMIN «Asistencia»), `ConductaView.jsx` (menú: AUXILIAR «Conducta») |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `POST /asistencia/lote` | AUXILIAR | `registrar_lote()` → `asistencia_service.registrar_lote()` | `asistenciaApi.js` `registrarLote()` → RegistrarAsistenciaView.jsx |
| `GET /asistencia/seccion/<int:id_seccion>` | AUXILIAR, DOCENTE, ADMIN | `de_seccion()` → `asistencia_service.de_seccion()` | `asistenciaApi.js` `deSeccion()` → RegistrarAsistenciaView.jsx |
| `GET /asistencia/mia` | ALUMNO | `mi_asistencia()` → `asistencia_service.mi_asistencia()` | `asistenciaApi.js` `mia()` → MiAsistenciaView.jsx |
| `GET /asistencia/seccion/<int:id_seccion>/resumen` | AUXILIAR, DOCENTE, ADMIN | `resumen_de_seccion()` → `asistencia_service.resumen_de_seccion()` | `asistenciaApi.js` `resumen()` → ReporteAsistenciaView.jsx, RegistrarAsistenciaView.jsx, ConductaView.jsx |

#### Conducta

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/conducta_routes.py` |
| Backend · service | `app/services/conducta_service.py` |
| Backend · repository | `app/repositories/conducta_repository.py` · `app/repositories/perfil_repository.py` · `app/repositories/academico_repository.py` |
| Tablas MySQL | `alumno`, `bimestre`, `nivel_conducta`, `reporte_conducta`, `tipo_falta` |
| App · api | `src/services/api/conductaApi.js` |
| App · repository | `src/repositories/conductaRepository.js` · `src/repositories/colaRepository.js` |
| App · pantallas | `RegistrarReporteView.jsx`, `CatalogoFaltasView.jsx` (menú: AUXILIAR «Catálogo de faltas»; PSICOLOGO, ADMIN «Faltas»), `ConductaAlumnoView.jsx`, `MiConductaView.jsx` (menú: ALUMNO «Conducta») |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `GET /conducta/faltas` | cualquiera con sesión | `faltas()` → `conducta_service.catalogo()` | `conductaApi.js` `faltas()` → RegistrarReporteView.jsx, CatalogoFaltasView.jsx |
| `POST /conducta/reportes` | AUXILIAR | `registrar_reporte()` → `conducta_service.registrar_reporte()` | `conductaApi.js` `registrarReporte()` → RegistrarReporteView.jsx |
| `PATCH /conducta/reportes/<int:id_reporte>/anular` | AUXILIAR, ADMIN | `anular_reporte()` → `conducta_service.anular_reporte()` | `conductaApi.js` `anularReporte()` → ConductaAlumnoView.jsx |
| `GET /conducta/alumno/<int:id_alumno>` | cualquiera con sesión | `estado_conducta()` → `conducta_service.estado_conducta()` | `conductaApi.js` `estadoAlumno()` → ConductaAlumnoView.jsx, MiConductaView.jsx |

#### Citas de psicología

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/cita_routes.py` |
| Backend · service | `app/services/cita_service.py` |
| Backend · repository | `app/repositories/perfil_repository.py` · `app/repositories/cita_repository.py` |
| Tablas MySQL | `alumno`, `cita_psicologia`, `psicologo` |
| App · api | `src/services/api/conductaApi.js` |
| App · repository | `src/repositories/colaRepository.js` · `src/repositories/conductaRepository.js` |
| App · pantallas | `SolicitarCitaView.jsx`, `MisCitasView.jsx` (menú: ALUMNO «Citas psicología»), `AgendaView.jsx` (menú: PSICOLOGO «Agenda»), `CitaDetalleView.jsx`, `HistorialAlumnoView.jsx` |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `POST /citas` | ALUMNO | `solicitar()` → `cita_service.solicitar()` | `conductaApi.js` `solicitarCita()` → SolicitarCitaView.jsx |
| `GET /citas/mis-citas` | ALUMNO | `mis_citas()` → `cita_service.mis_citas()` | `conductaApi.js` `misCitas()` → MisCitasView.jsx |
| `GET /citas/agenda` | PSICOLOGO | `agenda()` → `cita_service.agenda()` | `conductaApi.js` `agenda()` → AgendaView.jsx |
| `PATCH /citas/<int:id_cita>/programar` | PSICOLOGO | `programar()` → `cita_service.programar()` | `conductaApi.js` `programarCita()` → CitaDetalleView.jsx |
| `PATCH /citas/<int:id_cita>/completar` | PSICOLOGO | `completar()` → `cita_service.completar()` | `conductaApi.js` `completarCita()` → CitaDetalleView.jsx |
| `PATCH /citas/<int:id_cita>/cancelar` | PSICOLOGO | `cancelar()` → `cita_service.cancelar()` | `conductaApi.js` `cancelarCita()` → CitaDetalleView.jsx |
| `GET /citas/alumno/<int:id_alumno>` | PSICOLOGO | `historial_de_alumno()` → `cita_service.historial_de_alumno()` | `conductaApi.js` `historialCitas()` → HistorialAlumnoView.jsx |

#### Mensajería

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/mensaje_routes.py` |
| Backend · service | `app/services/mensaje_service.py` |
| Backend · repository | `app/repositories/mensaje_repository.py` · `app/repositories/perfil_repository.py` · `app/repositories/notificacion_repository.py` |
| Tablas MySQL | `alumno`, `carga_academica`, `conversacion`, `docente`, `matricula`, `mensaje`, `notificacion`, `usuario` |
| App · api | `src/services/api/mensajesApi.js` |
| App · repository | `src/repositories/mensajesRepository.js` · `src/repositories/colaRepository.js` |
| App · pantallas | `ContactosView.jsx`, `ChatView.jsx`, `MensajesView.jsx` (menú: todos los roles «Mensajes») |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `GET /mensajes/contactos` | cualquiera con sesión | `contactos()` → `mensaje_service.contactos()` | `mensajesApi.js` `contactos()` → ContactosView.jsx |
| `GET /mensajes/conversaciones` | cualquiera con sesión | `conversaciones()` → `mensaje_service.conversaciones()` | `mensajesApi.js` `conversaciones()` → ChatView.jsx, MensajesView.jsx |
| `POST /mensajes/conversaciones` | cualquiera con sesión | `iniciar()` → `mensaje_service.iniciar()` | `mensajesApi.js` `iniciar()` |
| `GET /mensajes/conversaciones/<int:id_conversacion>` | cualquiera con sesión | `ver()` → `mensaje_service.ver()` | `mensajesApi.js` `conversacion()` → ChatView.jsx |
| `POST /mensajes/conversaciones/<int:id_conversacion>` | cualquiera con sesión | `enviar()` → `mensaje_service.enviar()` | `mensajesApi.js` `responder()` |
| `PATCH /mensajes/conversaciones/<int:id_conversacion>/leido` | cualquiera con sesión | `marcar_leidos()` → `mensaje_service.marcar_leidos()` | `mensajesApi.js` `marcarLeida()` → ChatView.jsx |

#### Notificaciones (avisos, push y preferencias)

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/notificacion_routes.py` · `app/routes/dispositivo_routes.py` |
| Backend · service | `app/services/notificacion_service.py` · `app/services/dispositivo_service.py` |
| Backend · repository | `app/repositories/notificacion_repository.py` · `app/repositories/mensaje_repository.py` · `app/repositories/preferencia_repository.py` · `app/repositories/dispositivo_repository.py` |
| Tablas MySQL | `conversacion`, `dispositivo_push`, `mensaje`, `notificacion`, `preferencia_notificacion`, `silenciar_todo` |
| App · api | `src/services/api/mensajesApi.js` |
| App · repository | `src/repositories/mensajesRepository.js` · `src/repositories/sesionRepository.js` |
| App · pantallas | `NotificacionesView.jsx` (menú: todos los roles «Avisos»), `AjustesNotificacionesView.jsx`, `CambiarPasswordView.jsx`, `PerfilView.jsx` (menú: todos los roles «Mi perfil») |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `GET /notificaciones` | cualquiera con sesión | `mis_notificaciones()` → `notificacion_service.mis_notificaciones()` | `mensajesApi.js` `notificaciones()` → NotificacionesView.jsx |
| `PATCH /notificaciones/<int:id_notificacion>/leida` | cualquiera con sesión | `marcar_leida()` → `notificacion_service.marcar_leida()` | `mensajesApi.js` `marcarNotificacionLeida()` → abrirNotificacion.js, NotificacionesView.jsx |
| `PATCH /notificaciones/leer-todas` | cualquiera con sesión | `marcar_todas()` → `notificacion_service.marcar_todas()` | `mensajesApi.js` `marcarTodasLeidas()` → NotificacionesView.jsx |
| `GET /notificaciones/contadores` | cualquiera con sesión | `contadores()` → `notificacion_service.contadores()` | `mensajesApi.js` `contadores()` → SesionContext.jsx |
| `GET /notificaciones/preferencias` | cualquiera con sesión | `preferencias()` → `notificacion_service.preferencias()` | `mensajesApi.js` `preferencias()` → AjustesNotificacionesView.jsx |
| `PUT /notificaciones/preferencias` | cualquiera con sesión | `guardar_preferencias()` → `notificacion_service.guardar_preferencias()` | `mensajesApi.js` `guardarPreferencias()` → AjustesNotificacionesView.jsx |
| `POST /dispositivos/token` | cualquiera con sesión | `registrar_token()` → `dispositivo_service.registrar()` | `mensajesApi.js` `registrarDispositivo()` → SesionContext.jsx |
| `DELETE /dispositivos/token` | cualquiera con sesión | `eliminar_token()` → `dispositivo_service.eliminar()` | `mensajesApi.js` `eliminarDispositivo()` → MenuMas.jsx, SesionContext.jsx, CambiarPasswordView.jsx, PerfilView.jsx |

#### Modo sin conexión

| Capa | Archivos |
|---|---|
| Backend · route | `app/routes/offline_routes.py` |
| Backend · service | `app/services/offline_service.py` |
| Backend · repository | `app/repositories/operacion_repository.py` |
| Tablas MySQL | `operacion_offline` |
| App · api | — |
| App · repository | — |
| App · pantallas | `PendientesView.jsx` (lee la cola local con `ColaRepository.listar()`; al volver la red se reenvía con la cabecera `X-Id-Operacion`) |

| Endpoint | Roles | Backend (route → service) | App (api → pantallas) |
|---|---|---|---|
| `GET /offline/operaciones/<id_operacion>` | cualquiera con sesión | `consultar_operacion()` → `offline_service.consultar()` | solo Postman |

#### Piezas compartidas (no son de un módulo)

| Para… | Backend | App |
|---|---|---|
| Validar datos del JSON | `app/utils.py` (`texto`, `entero`, `numero`, `fecha`, `fecha_hora`, `enlace`, `lista`) | `src/utils/validaciones.js` (`validarTexto`, `validarEnlace`, `primerError`) |
| Errores | `app/errors.py` (`ApiError(status, "mensaje")` → `{"detail": ...}`) | `src/services/api/apiClient.js` (lee `detail`) · `<Aviso tono="error">` |
| Token y roles | `app/auth.py` (`@jwt_required`, `usuario_actual()`) | `src/context/SesionContext.jsx` (`useSesion()` → `usuario.rol`) |
| SQL | `app/database.py` (`consultar_uno`, `consultar_todos`, `insertar`, `ejecutar`) | — |
| Columnas nuevas | `database/schema.sql` + `app/migraciones.py` (`COLUMNAS_NUEVAS`; con PostgreSQL se adapta sola) | — |
| MySQL o PostgreSQL | `.env` (`DB_MOTOR`) y `app/database.py` (conexión y traducción del SQL) | — |
| Registrar un módulo nuevo | `app/__init__.py` (`register_blueprint`) | `src/navigation/pantallas.js` + `src/config/menus.js` |
| Fechas | `app/utils.py` (`fecha`, `fecha_hora`) | `src/utils/fechas.js` (`formatearFecha`, `hoyISO`) |
| Confirmar / avisar | — | `src/utils/dialogos.js` (`confirmar`, `avisar`) |
| Sin conexión | `app/offline.py` (`@idempotente`) | `src/repositories/colaRepository.js` (`ENVIOS`) |
| Tiempo real | `app/tiempo_real.py` | `src/services/tiempoRealService.js`, `src/viewmodels/useTiempoReal.js` |
<!-- GUIA-MODULOS:FIN -->

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
