import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Tarjeta from '../../components/Tarjeta';
import Texto from '../../components/Texto';
import Campo from '../../components/Campo';
import { Avatar, Seccion } from '../../components/Basicos';
import { Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import MensajesRepository from '../../repositories/mensajesRepository';
import { NOMBRES_ROL } from '../../config/estados';
import { ESPACIO } from '../../config/tema';

/** Orden en que se agrupan los contactos. */
const ORDEN_ROLES = ['DOCENTE', 'AUXILIAR', 'PSICOLOGO', 'ADMIN', 'ALUMNO'];

/**
 * ContactosView: personas a las que el usuario puede escribir (el servidor decide
 * según el rol). Al elegir una se abre el chat; si ya tenían conversación, el servidor
 * la reutiliza al enviar el primer mensaje.
 */
export default function ContactosView({ navigation }) {
  const contactos = useConsulta(() => MensajesRepository.contactos(), []);
  const [busqueda, setBusqueda] = useState('');

  return (
    <Pantalla consulta={contactos}>
      {(lista) => {
        const texto = busqueda.trim().toLowerCase();
        const filtrados = lista.filter((c) => c.nombre.toLowerCase().includes(texto));
        const grupos = ORDEN_ROLES
          .map((rol) => ({ rol, personas: filtrados.filter((c) => c.rol === rol) }))
          .filter((g) => g.personas.length > 0);

        return (
          <>
            <Campo valor={busqueda} alCambiar={setBusqueda} placeholder="Buscar por nombre" />
            {grupos.length === 0 && <Vacio icono="people-outline" titulo="Sin resultados" />}
            {grupos.map((g) => (
              <View key={g.rol}>
                <Seccion titulo={NOMBRES_ROL[g.rol] || g.rol} />
                {g.personas.map((c) => (
                  <Tarjeta
                    key={c.id_usuario}
                    onPress={() => navigation.replace('Chat', { contacto: c, titulo: c.nombre })}
                  >
                    <View style={estilos.fila}>
                      <Avatar nombre={c.nombre} tamano={38} />
                      <Texto negrita style={estilos.flex}>{c.nombre}</Texto>
                    </View>
                  </Tarjeta>
                ))}
              </View>
            ))}
          </>
        );
      }}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.md },
  flex: { flex: 1 },
});
