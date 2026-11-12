import React from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AvisoDatosGuardados, Cargando, ErrorVista } from './Estados';
import { COLORES, ESPACIO } from '../config/tema';

/**
 * Pantalla: contenedor estándar de todas las pantallas.
 *
 * Sin `consulta`, solo da el fondo, el margen, el scroll y el manejo del teclado.
 *
 * Con `consulta` (lo que devuelve useConsulta) además resuelve los estados:
 *   - Cargando  → indicador
 *   - Error     → mensaje + botón "Reintentar"
 *   - Contenido → llama a children(datos); si hay datos guardados sin conexión, muestra el aviso
 * y permite deslizar hacia abajo para actualizar.
 *
 *     <Pantalla consulta={notas}>
 *       {(datos) => datos.cursos.map(...)}
 *     </Pantalla>
 *
 * `pie`: contenido fijo abajo (por ejemplo, el botón "Guardar" de un formulario largo).
 */
export default function Pantalla({ consulta, children, pie, style }) {
  let contenido;
  if (!consulta) {
    contenido = children;
  } else if (consulta.cargando) {
    contenido = <Cargando />;
  } else if (consulta.error) {
    contenido = <ErrorVista error={consulta.error} onReintentar={consulta.recargar} />;
  } else {
    contenido = (
      <>
        <AvisoDatosGuardados aviso={consulta.aviso} actualizadoEn={consulta.actualizadoEn} />
        {typeof children === 'function' ? children(consulta.datos) : children}
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      style={estilos.fondo}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[estilos.contenido, style]}
        keyboardShouldPersistTaps="handled"
        refreshControl={consulta ? (
          <RefreshControl
            refreshing={Boolean(consulta.refrescando)}
            onRefresh={consulta.recargar}
            colors={[COLORES.guinda]}
            tintColor={COLORES.guinda}
          />
        ) : undefined}
      >
        {contenido}
      </ScrollView>
      {pie && <View style={estilos.pie}>{pie}</View>}
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORES.fondo },
  contenido: { flexGrow: 1, padding: ESPACIO.lg, paddingBottom: ESPACIO.xl * 2 },
  pie: {
    padding: ESPACIO.lg,
    backgroundColor: COLORES.superficie,
    borderTopWidth: 1,
    borderTopColor: COLORES.borde,
  },
});
