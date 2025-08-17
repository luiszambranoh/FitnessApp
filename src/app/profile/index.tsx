import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { layout, list } from '../../styles/theme';

const settingsItems = [
  { href: '/profile/exercises', tKey: 'settings.exercises', icon: 'award' as const },
  { href: '/profile/theme', tKey: 'settings.theme', icon: 'sun' as const },
  { href: '/profile/language', tKey: 'settings.language', icon: 'globe' as const },
  { href: '/profile/body-data', tKey: 'settings.bodyData', icon: 'activity' as const },
  { href: '/profile/routine', tKey: 'settings.routine', icon: 'calendar' as const },
];

const SettingsItem = ({ href, tKey, icon }: typeof settingsItems[0]) => {
  const { t } = useTranslation();
  return (
    <Link href={href} asChild>
      <TouchableOpacity className={list.itemContainer}>
        <Feather name={icon} size={24} className={list.itemIcon} />
        <Text className={list.itemText}>{t(tKey)}</Text>
        <View className="flex-1 items-end">
          <Feather name="chevron-right" size={24} className={list.itemChevron} />
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export default function SettingsScreen() {
  return (
    <View className={layout.container}>
      <FlatList
        data={settingsItems}
        keyExtractor={(item) => item.href}
        renderItem={({ item }) => <SettingsItem {...item} />}
        contentContainerStyle={{ paddingTop: 20 }}
      />
    </View>
  );
}
