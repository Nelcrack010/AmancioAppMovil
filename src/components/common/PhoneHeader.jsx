import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CrestLogo from './CrestLogo';
import { colors } from '../../theme/colors';

export default function PhoneHeader({
  subtitle,
  title,
  badgeCount = 3,
  onPressNotifications,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        <CrestLogo variant="dark" />
        <View style={styles.titleContainer}>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.notificationButton}
        activeOpacity={0.7}
        onPress={onPressNotifications}
        accessibilityLabel="Notificaciones"
      >
        <Ionicons name="notifications-outline" size={19} color={colors.textPrimary} />
        {badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 9 ? '9+' : badgeCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 72,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    paddingHorizontal: 18,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  subtitle: {
    fontSize: 8.5,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 8,
    fontWeight: '800',
    lineHeight: 10,
  },
});
