// >>> GUÍA DEL ARCHIVO (comentarios de estudio: busca «PISTA:» para ver las pistas)
// Módulo: Mensajería   ·   Capa: VISTA (pantalla) · lo que el usuario ve y toca
// Cadena: [esta vista] → viewmodels/useConsulta·useAccion → repositories/*Repository.js → services/api/*Api.js →
//     backend
// Qué es: Orden en que se agrupan los contactos.
// Pantalla «Contactos» (src/navigation/pantallas.js): pantalla de detalle, título «Nuevo mensaje»
//   Se abre desde: MensajesView.jsx  con navigation.navigate('Contactos', {...})
//
// Datos (repositorio → endpoint → backend):
//   MensajesRepository.contactos() → GET /mensajes/contactos (backend: mensaje_routes.py → contactos())
// Botones / secciones: «Sin resultados»
//
// Para modificar:
//   • Texto, etiqueta o botón → búscalo aquí abajo (Ctrl+F) y cámbialo.
//   • Mostrar un campo nuevo → primero que venga en el JSON (SELECT del repository del backend), luego aquí:
//     {x.campo && <Texto variante="pequeno">Campo: {x.campo}</Texto>}
//   • Campo de formulario → const [valor, setValor] = useState(''); <Campo etiqueta="..." valor={valor}
//       alCambiar={setValor} />
//     y agrégalo al objeto que se envía en accion.ejecutar(...).
//   • Regla local → validarTexto/validarEnlace dentro de primerError(...) (src/utils/validaciones.js). Pon la
//       misma regla en el service.
//   • Botón → <Boton titulo="..." variante="primario|guinda|secundario|peligro|texto" pequeno onPress={() =>
//       ...} />
//   • Ir a otra pantalla → navigation.navigate('Nombre', { id }). Pantalla nueva: src/navigation/pantallas.js.
// <<< FIN GUÍA
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
  // PISTA: «contactos» = datos que se cargan al abrir la pantalla: MensajesRepository.contactos() → GET
  //     /mensajes/contactos (backend: mensaje_routes.py → contactos()). Úsalos con contactos.datos;
  //     contactos.recargar() vuelve a pedirlos.
  const contactos = useConsulta(() => MensajesRepository.contactos(), []);
  const [busqueda, setBusqueda] = useState('');

  // PISTA: desde aquí, lo que se dibuja (JSX). Para comentar dentro del JSX usa {/* ... */}. Mostrar algo solo
  //     si existe: {dato && <Texto>...</Texto>}.
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
