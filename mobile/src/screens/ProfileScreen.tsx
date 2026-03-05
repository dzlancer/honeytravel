import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { mobileApi } from '../services/api';
import { useAuth } from '../store/AuthContext';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loyaltyBalance, setLoyaltyBalance] = useState<any>(null);

  useEffect(() => {
    mobileApi.getLoyaltyBalance().then(setLoyaltyBalance).catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.firstName[0]}{user.lastName[0]}</Text>
        </View>
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Loyalty Card */}
      <View style={styles.loyaltyCard}>
        <Text style={styles.loyaltyTitle}>Loyalty Points</Text>
        <Text style={styles.loyaltyPoints}>{loyaltyBalance?.balance?.toLocaleString() || 0}</Text>
        <Text style={styles.loyaltyValue}>Worth ${loyaltyBalance?.valueUsd?.toFixed(2) || '0.00'}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        <MenuItem title="Currency" value="USD" />
        <MenuItem title="Language" value="English" />
        <MenuItem title="Notifications" value="Enabled" />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.menuItem}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { alignItems: 'center', padding: 24, paddingTop: 48, backgroundColor: '#fff' },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#dbeafe',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#1e40af', fontSize: 24, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  loyaltyCard: {
    backgroundColor: '#1e40af', margin: 16, borderRadius: 16, padding: 20, alignItems: 'center',
  },
  loyaltyTitle: { color: '#bfdbfe', fontSize: 14 },
  loyaltyPoints: { color: '#fff', fontSize: 40, fontWeight: 'bold', marginVertical: 4 },
  loyaltyValue: { color: '#93c5fd', fontSize: 14 },
  menu: { backgroundColor: '#fff', margin: 16, borderRadius: 12, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', padding: 16,
    borderBottomWidth: 1, borderColor: '#f3f4f6',
  },
  menuTitle: { fontSize: 15, color: '#111' },
  menuValue: { fontSize: 15, color: '#6b7280' },
  logoutBtn: {
    margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#ef4444',
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});
