import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Image, Dimensions, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mobileApi } from '../services/api';
import { getRecentSearches } from '../services/storage';

const { width } = Dimensions.get('window');

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [destination, setDestination] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  useEffect(() => {
    mobileApi.getRecommendations().then(setRecommendations).catch(() => {});
    getRecentSearches().then(setRecentSearches);
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Discover Algeria</Text>
        <Text style={styles.heroSub}>Find your perfect stay</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Where are you going?"
            value={destination}
            onChangeText={setDestination}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => navigation.navigate('Search', { destination })}
          >
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentSearches.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.recentChip}
                onPress={() => navigation.navigate('Search', { destination: s.destination })}
              >
                <Text style={styles.recentChipText}>{s.destination}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        {recommendations.map((item) => (
          <TouchableOpacity
            key={item.productId}
            style={styles.dealCard}
            onPress={() => navigation.navigate('HotelDetail', { id: item.productId })}
          >
            <Image source={{ uri: item.image }} style={styles.dealImage} />
            <View style={styles.dealInfo}>
              <Text style={styles.dealName}>{item.name}</Text>
              <Text style={styles.dealReason}>{item.reason}</Text>
              <Text style={styles.dealPrice}>From ${item.price}/night</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  hero: { backgroundColor: '#1e40af', padding: 24, paddingTop: 60 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: 16, color: '#bfdbfe', marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#111',
  },
  searchBtn: { backgroundColor: '#f59e0b', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#111' },
  recentChip: {
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb',
  },
  recentChipText: { color: '#374151', fontSize: 14 },
  dealCard: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  dealImage: { width: '100%', height: 160 },
  dealInfo: { padding: 12 },
  dealName: { fontSize: 16, fontWeight: '600', color: '#111' },
  dealReason: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  dealPrice: { fontSize: 16, fontWeight: 'bold', color: '#1e40af', marginTop: 4 },
});
