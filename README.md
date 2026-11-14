# Campus AV Móvil — App (React Native + Expo)

Aplicación móvil del Campus Virtual del colegio **Amancio Varona** (Tumán). Consume la API
REST del proyecto `AmancioAppBackend` (JWT) y respeta la identidad visual del campus web:
guinda `#701C32`, azul `#093E7A`, crema `#FFF1E3` y la fuente **Lato**.

A diferencia del campus web, que tiene un menú lateral, aquí cada rol navega con una
**barra de menú inferior**: las opciones principales siempre están a la vista y el resto
aparece al tocar **"Más"**.

---

## Cómo ejecutar

1. Instalar dependencias (la primera vez):
   ```bash
   npm install
   ```
2. Elegir el servidor de la API: copia `.env.example` como `.env.local` y pon la dirección.
   Para usar el backend de tu PC, escribe la IP de tu PC en la red WiFi (no `127.0.0.1`).
   Si no creas el archivo, se usa el servidor del equipo.
3. Iniciar Expo:
   ```bash
   npx expo start
   ```
   - **Celular:** abre **Expo Go** y escanea el QR.
   - **Emulador Android:** presiona `a`.
   - **Navegador** (solo para probar rápido): presiona `w`. El backend debe permitir el origen,
     por ejemplo `ALLOWED_ORIGINS=http://localhost:8081` en su `.env`.

Usuarios de prueba: los de los datos de demostración del backend (ver su README).
La contraseña inicial es el DNI; `ALU-44444444` aún debe cambiarla (primer ingreso).

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

- **Notificaciones push** en el celular (registrar el token de Expo con `expo-notifications`
  en `POST /dispositivos/token`). La pantalla de avisos ya funciona con la API.
- **Cámara y galería:** la API recibe enlaces, no archivos. Las entregas y evidencias se
  envían como enlace (Drive u otro) hasta que la API acepte `multipart/form-data`.
- **Ajuste de la nota de conducta por el tutor** y **lista de seguimiento** del psicólogo:
  faltan los endpoints en la API.
