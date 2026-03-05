import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { mobileApi } from '../services/api';
import { useAuth } from '../store/AuthContext';

export function HotelDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mobileApi.getHotel(route.params.id)
      .then(setHotel)
      .catch(() => Alert.alert('Error', 'Hotel not found'))
      .finally(() => setLoading(false));
  }, [route.params.id]);

  const handleBook = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to book a hotel');
      return;
    }
    if (!hotel.rooms?.length) return;

    const room = hotel.rooms[0];
    try {
      const booking = await mobileApi.createBooking({
        productType: 'hotel',
        productId: hotel.id,
        supplierId: hotel.supplierId,
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        guestCount: 2,
        totalAmount: room.pricePerNight,
        currency: room.currency || 'USD',
        guestDetails: [{ firstName: user.firstName, lastName: user.lastName }],
      });
      Alert.alert('Success', `Booking created! Ref: ${booking.id.slice(0, 8)}`);
      navigation.navigate('Bookings');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Booking failed');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1 }} />;
  if (!hotel) return <Text style={styles.empty}>Hotel not found</Text>;

  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.stars}>{'★'.repeat(hotel.starRating)}</Text>
        <Text style={styles.name}>{hotel.name}</Text>
        <Text style={styles.location}>{hotel.street}, {hotel.city}, {hotel.country}</Text>

        {hotel.avgRating > 0 && (
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{hotel.avgRating}</Text>
            </View>
            <Text style={styles.reviewCount}>{hotel.reviewCount} reviews</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{hotel.description}</Text>

        {hotel.amenities?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenities}>
              {hotel.amenities.map((a: string) => (
                <View key={a} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>{a.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {rooms.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Rooms</Text>
            {rooms.map((room: any) => (
              <View key={room.id} style={styles.roomCard}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomDesc}>{room.description}</Text>
                <Text style={styles.roomMeta}>Max {room.maxOccupancy} guests · {room.bedType}</Text>
                <Text style={styles.roomPrice}>${room.pricePerNight}/night</Text>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 280 },
  content: { padding: 16 },
  stars: { color: '#f59e0b', fontSize: 14, marginBottom: 4 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  location: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  ratingBadge: { backgroundColor: '#2563eb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  ratingText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  reviewCount: { color: '#6b7280', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8, color: '#111' },
  description: { fontSize: 14, color: '#4b5563', lineHeight: 22 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  amenityChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  amenityText: { fontSize: 12, color: '#374151', textTransform: 'capitalize' },
  roomCard: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 8 },
  roomName: { fontSize: 15, fontWeight: '600', color: '#111' },
  roomDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  roomMeta: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  roomPrice: { fontSize: 18, fontWeight: 'bold', color: '#1e40af', marginTop: 4 },
  bookBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 32 },
  bookBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#9ca3af' },
});
