import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import {
  useFonts, Lato_400Regular, Lato_700Bold, Lato_900Black,
} from '@expo-google-fonts/lato';
import { SesionProvider } from './src/context/SesionContext';
import { ConexionProvider } from './src/context/ConexionContext';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navegacionGlobal';
import { Cargando } from './src/components/Estados';
import { COLORES } from './src/config/tema';
import MensajesRepository from './src/repositories/mensajesRepository';
import { urlDesdeNotificacion } from './src/navigation/destinosNotificaciones';

/**
 * Punto de entrada de Campus AV Móvil.
 *
 * Capas que envuelven a la app (de afuera hacia adentro):
 *   SafeAreaProvider    → respeta la muesca y la barra del sistema
 *   SesionProvider      → usuario, token, contadores de no leídos
 *   ConexionProvider    → estado de la red y cola de operaciones sin conexión
 *   NavigationContainer → navegación entre pantallas
 */

// Tema de React Navigation con los colores del colegio.
const TEMA_NAVEGACION = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORES.guinda,
    background: COLORES.fondo,
    card: COLORES.superficie,
    text: COLORES.texto,
    border: COLORES.borde,
  },
};

/**
 * Configuración de Deep Linking (esquema amancioapp:// y enlaces universales)
 * e integración directa con las notificaciones push de expo-notifications.
 */
const LINKING_CONFIG = {
  prefixes: [Linking.createURL('/'), 'amancioapp://'],
  async getInitialURL() {
    try {
      // 1. Si la app fue abierta desde una notificación push (app completamente cerrada)
      const response = await Notifications.getLastNotificationResponseAsync();
      const data = response?.notification?.request?.content?.data;
      if (data) {
        if (data.id_notificacion) {
          MensajesRepository.marcarNotificacionLeida(data.id_notificacion).catch(() => {});
        }
        const url = urlDesdeNotificacion(data);
        if (url) return url;
      }
    } catch {
      // Si falla la verificación push, continuar
    }

    // 2. Si no fue por push, obtener URL inicial estándar de expo-linking
    return Linking.getInitialURL();
  },
  subscribe(listener) {
    // 1. Escuchar URLs entrantes estándar (expo-linking)
    const onReceiveURL = ({ url }) => listener(url);
    const linkingSubscription = Linking.addEventListener('url', onReceiveURL);

    // 2. Escuchar cuando el usuario toca una notificación push (app en segundo plano)
    let notificationSubscription = null;
    try {
      notificationSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
        try {
          const data = response?.notification?.request?.content?.data;
          if (data) {
            if (data.id_notificacion) {
              MensajesRepository.marcarNotificacionLeida(data.id_notificacion).catch(() => {});
            }
            const url = urlDesdeNotificacion(data);
            if (url) listener(url);
          }
        } catch {
          // Ignorar errores al procesar respuesta
        }
      });
    } catch {
      // Entornos donde no está disponible el listener
    }

    return () => {
      linkingSubscription.remove();
      if (notificationSubscription) notificationSubscription.remove();
    };
  },
  config: {
    screens: {
      Login: 'login',
      PrimerIngreso: 'primer-ingreso',
      Menu: {
        screens: {
          Inicio: 'inicio',
          Cursos: 'cursos',
          MisNotas: 'mis-notas',
          Mensajes: 'mensajes',
          Horario: 'horario',
          MiAsistencia: 'mi-asistencia',
          MiConducta: 'mi-conducta',
          MisCitas: 'mis-citas',
          Notificaciones: 'notificaciones',
          Perfil: 'perfil',
          RegistrarAsistencia: 'registrar-asistencia',
          ReporteAsistencia: 'reporte-asistencia',
          Conducta: 'conducta',
          CatalogoFaltas: 'catalogo-faltas',
          Agenda: 'agenda',
        },
      },
      TareaDetalle: {
        path: 'tarea/:id',
        parse: {
          id: (id) => Number(id) || id,
        },
      },
      Entregas: {
        path: 'entregas/:idTarea',
        parse: {
          idTarea: (idTarea) => Number(idTarea) || idTarea,
        },
      },
      Chat: {
        path: 'chat/:idConversacion',
        parse: {
          idConversacion: (id) => Number(id) || id,
        },
      },
      CursoDetalle: {
        path: 'curso/:idCarga',
        parse: {
          idCarga: (id) => Number(id) || id,
        },
      },
      CitaDetalle: {
        path: 'cita/:idCita',
        parse: {
          idCita: (id) => Number(id) || id,
        },
      },
      ConductaAlumno: {
        path: 'conducta-alumno/:idAlumno',
        parse: {
          idAlumno: (id) => Number(id) || id,
        },
      },
      HistorialAlumno: {
        path: 'historial-alumno/:idAlumno',
        parse: {
          idAlumno: (id) => Number(id) || id,
        },
      },
      NotasCurso: {
        path: 'notas-curso/:idCarga',
        parse: {
          idCarga: (id) => Number(id) || id,
        },
      },
      SolicitarCita: 'solicitar-cita',
      Pendientes: 'pendientes',
    },
  },
};

export default function App() {
  // Fuente Lato, la misma del campus web.
  const [fuentesListas] = useFonts({ Lato_400Regular, Lato_700Bold, Lato_900Black });

  if (!fuentesListas) return null;   // un instante, mientras cargan las fuentes

  return (
    <SafeAreaProvider>
      <SesionProvider>
        <ConexionProvider>
          <NavigationContainer ref={navigationRef} theme={TEMA_NAVEGACION} linking={LINKING_CONFIG} fallback={<Cargando />}>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </ConexionProvider>
      </SesionProvider>
    </SafeAreaProvider>
  );
}
