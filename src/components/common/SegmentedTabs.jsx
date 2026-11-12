import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';

export default function SegmentedTabs({
  tabs = [],
  activeTab,
  onTabChange,
  activeColor = colors.primary,
}) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                isActive
                  ? [styles.activeTabText, { color: activeColor }]
                  : styles.inactiveTabText,
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 11,
    padding: 3,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  tab: {
    flex: 1,
    height: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  activeTab: {
    backgroundColor: colors.surface,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 8.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  activeTabText: {
    fontWeight: '800',
  },
  inactiveTabText: {
    color: colors.textSecondary,
  },
});
