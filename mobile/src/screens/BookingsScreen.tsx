import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { mobileApi } from '../services/api';
import { cacheBookings, getCachedBookings } from '../services/storage';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#22c55e',
  cancelled: '#ef4444',
  completed: '#3b82f6',
  failed: '#6b7280',
};

export function BookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const data = await mobileApi.getMyBookings();
      setBookings(data.bookings || []);
      await cacheBookings(data.bookings || []);
    } catch {
      // Offline fallback
      const cached = await getCachedBookings();
      setBookings(cached);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  const handleCancel = (id: string) => {
    Alert.alert('Cancel Booking', 'Are you sure?', [
      { text: 'No' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await mobileApi.cancelBooking(id);
            setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b));
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || '#6b7280' }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
              <Text style={styles.ref}>Ref: {(item.supplierBookingRef || item.id).slice(0, 8)}</Text>
            </View>
            <Text style={styles.type}>{item.productType} Booking</Text>
            <Text style={styles.dates}>{item.checkIn} — {item.checkOut}</Text>
            <View style={styles.footer}>
              <Text style={styles.amount}>${item.totalAmount}</Text>
              {(item.status === 'pending' || item.status === 'confirmed') && (
                <TouchableOpacity onPress={() => handleCancel(item.id)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No bookings yet</Text>}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, paddingBottom: 0 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  ref: { color: '#9ca3af', fontSize: 12 },
  type: { fontSize: 16, fontWeight: '600', color: '#111', textTransform: 'capitalize' },
  dates: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  amount: { fontSize: 20, fontWeight: 'bold', color: '#1e40af' },
  cancelText: { color: '#ef4444', fontWeight: '500' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
