import React, { useState } from 'react';
import { View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import Campo from '../../components/Campo';
import Lista, { ItemLista } from '../../components/Lista';
import { Avatar, Seccion } from '../../components/Basicos';
import { Vacio } from '../../components/Estados';
import useConsulta from '../../viewmodels/useConsulta';
import MensajesRepository from '../../repositories/mensajesRepository';
import { NOMBRES_ROL } from '../../config/estados';

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
                <Lista>
                  {g.personas.map((c) => (
                    <ItemLista
                      key={c.id_usuario}
                      izquierda={<Avatar nombre={c.nombre} tamano={36} />}
                      titulo={c.nombre}
                      onPress={() => navigation.replace('Chat', { contacto: c, titulo: c.nombre })}
                    />
                  ))}
                </Lista>
              </View>
            ))}
          </>
        );
      }}
    </Pantalla>
  );
}
