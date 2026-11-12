import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../theme/colors';

export default function VirtualClassCard({
  timeLabel = '10:00 · EN 25 MIN',
  courseName = 'Ciencia y Tecnología',
  topic = 'Laboratorio: células y tejidos',
  onJoin,
}) {
  return (
    <View style={styles.container}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="virtualGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="7.7%" stopColor="#8a1515" />
            <Stop offset="92.3%" stopColor="#c8201d" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" rx={14} ry={14} fill="url(#virtualGrad)" />
      </Svg>

      {/* Icono de Video */}
      <View style={styles.iconBox}>
        <Ionicons name="videocam-outline" size={18} color={colors.textInverse} />
      </View>

      {/* Contenido */}
      <View style={styles.infoColumn}>
        <Text style={styles.timeTag}>{timeLabel}</Text>
        <Text style={styles.courseTitle}>{courseName}</Text>
        <Text style={styles.topicText}>{topic}</Text>
      </View>

      {/* Botón Unirse */}
      <TouchableOpacity
        style={styles.joinButton}
        onPress={onJoin}
        activeOpacity={0.8}
      >
        <Ionicons name="videocam" size={14} color={colors.primary} />
        <Text style={styles.joinText}>Unirse</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    overflow: 'hidden',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoColumn: {
    flex: 1,
    marginLeft: 10,
  },
  timeTag: {
    fontSize: 7,
    fontWeight: '800',
    color: '#fecaca',
    letterSpacing: 0.4,
  },
  courseTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textInverse,
    marginTop: 1,
  },
  topicText: {
    fontSize: 7.5,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  joinButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  joinText: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '800',
    marginLeft: 4,
  },
});
