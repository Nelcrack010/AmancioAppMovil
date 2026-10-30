# AmancioAppMovil — Aplicación Móvil (React Native + Expo)

Aplicación móvil para el Campus Virtual del colegio **Amancio Varona**, construida con **React Native (Expo)** y diseñada bajo el patrón de arquitectura **MVVM + Repository Pattern con soporte Offline-First (Local + Remoto)**.

---

## 🏛️ Arquitectura del Proyecto

Esta aplicación implementa la arquitectura exacta solicitada (equivalente a Android MVVM con Retrofit y Room):

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────┐       ┌─────────────────┐       ┌──────────────┐
│   ViajesView    │ ────▶ │ useViajesVM      │ ────▶ │ ViajeRepository  │ ────▶ │   ApiService    │ ────▶ │   API REST   │
│ (View/Fragment) │       │   (ViewModel)    │       │  (Punto Acceso)  │       │  (Axios/Retro)  │       │(Flask+Oracle)│
└─────────────────┘       └──────────────────┘       └─────────┬────────┘       └─────────────────┘       └──────────────┘
                                                               │
                                                               ▼
                                                     ┌──────────────────┐       ┌─────────────────┐
                                                     │    ViajeDao      │ ────▶ │   AppDatabase   │
                                                     │ (Consultas Local)│       │  (Room/SQLite)  │
                                                     └──────────────────┘       └─────────────────┘
```

| Capa | Carpeta / Archivo | Equivalente Android | Responsabilidad |
|---|---|---|---|
| **View** | `src/views/` | `Fragment` / `Activity` | Presentación visual, renderizado de estados y captura de eventos UI. |
| **ViewModel** | `src/viewmodels/` | `ViewModel` (LiveData/State) | Mantiene el estado de la UI (loading, error, data) y decide las acciones. |
| **Repository** | `src/repositories/` | `Repository` | Única fuente de verdad. Decide si consultar datos locales (SQLite) o remotos (API REST). |
| **ApiService** | `src/services/api/` | `Retrofit / ApiService` | Endpoints HTTP, interceptores JWT y comunicación con el backend Flask. |
| **DAO** | `src/database/dao/` | `Dao` | Consultas SQL y operaciones CRUD sobre la base de datos local del dispositivo. |
| **Database** | `src/database/` | `RoomDatabase` | Persistencia SQLite local con `expo-sqlite` para funcionamiento sin internet (Offline-First). |

---

## 🌐 Conexión con la API REST

La app está vinculada directamente con el servidor en producción desplegado en Oracle Cloud:
- **Base URL:** `https://146.181.54.237`
- **Configuración:** `src/config/constants.js`
- **Cliente HTTP:** `src/services/api/apiClient.js` (con inyección automática de tokens JWT mediante `expo-secure-store`).

---

## 🚀 Cómo Ejecutar la Aplicación

1. Instalar dependencias (si es la primera vez):
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo de Expo:
   ```bash
   npx expo start
   ```

3. Abrir la app:
   - **En tu celular:** Abre la app **Expo Go** (Android/iOS) y escanea el código QR que aparecerá en la terminal.
   - **En emulador Android:** Presiona `a` en la terminal.
   - **En navegador Web:** Presiona `w` en la terminal.
