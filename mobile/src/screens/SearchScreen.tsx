import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { mobileApi } from '../services/api';
import { saveRecentSearch } from '../services/storage';

export function SearchScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [destination, setDestination] = useState(route.params?.destination || '');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = async () => {
    if (!destination) return;
    setLoading(true);
    try {
      const data = await mobileApi.searchHotels({ destination });
      setResults(data.items || []);
      await saveRecentSearch({
        destination,
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        guests: 2,
      });
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destination) doSearch();
  }, []);

  const renderHotel = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('HotelDetail', { id: item.id })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.stars}>{'★'.repeat(item.starRating || 3)}</Text>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.location}>{item.city || item.address?.city}</Text>
        <View style={styles.priceRow}>
          {item.avgRating > 0 && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{item.avgRating}</Text>
            </View>
          )}
          <Text style={styles.price}>${item.minPrice || item.rooms?.[0]?.pricePerNight || 0}/night</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={destination}
          onChangeText={setDestination}
          placeholder="Destination"
          placeholderTextColor="#9ca3af"
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={doSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id || item.supplierHotelId}
          renderItem={renderHotel}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {destination ? 'No hotels found' : 'Enter a destination to search'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchBar: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 10, padding: 12, fontSize: 16 },
  searchBtn: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 1 },
  image: { width: '100%', height: 160 },
  info: { padding: 12 },
  stars: { color: '#f59e0b', fontSize: 12, marginBottom: 2 },
  name: { fontSize: 16, fontWeight: '600', color: '#111' },
  location: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  ratingBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  ratingText: { color: '#1e40af', fontWeight: '600', fontSize: 13 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#1e40af' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 16 },
});
