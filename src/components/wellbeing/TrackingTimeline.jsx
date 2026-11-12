import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function TrackingTimeline({ steps = [] }) {
  return (
    <View style={styles.card}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isDone = step.status === 'completed';

        return (
          <View key={step.id || index} style={styles.stepRow}>
            {/* Nodo y línea */}
            <View style={styles.nodeColumn}>
              <View
                style={[
                  styles.nodeCircle,
                  isDone ? styles.nodeDone : styles.nodePending,
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={13} color={colors.textInverse} />
                ) : (
                  <View style={styles.pendingDot} />
                )}
              </View>
              {!isLast && <View style={styles.verticalLine} />}
            </View>

            {/* Texto del paso */}
            <View style={styles.textColumn}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 14,
    marginVertical: 4,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 46,
  },
  nodeColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: 10,
  },
  nodeCircle: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: {
    backgroundColor: colors.purple,
  },
  nodePending: {
    backgroundColor: colors.border,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
  },
  verticalLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 1,
  },
  stepTitle: {
    fontSize: 8.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepSubtitle: {
    fontSize: 7.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
