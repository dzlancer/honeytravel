import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = 'recent_searches';
const OFFLINE_BOOKINGS_KEY = 'offline_bookings';

export async function saveRecentSearch(search: { destination: string; checkIn: string; checkOut: string; guests: number }) {
  const existing = await getRecentSearches();
  const updated = [search, ...existing.filter(
    (s) => s.destination !== search.destination,
  )].slice(0, 10);
  await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

export async function getRecentSearches(): Promise<{ destination: string; checkIn: string; checkOut: string; guests: number }[]> {
  const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
  return data ? JSON.parse(data) : [];
}

export async function cacheBookings(bookings: any[]) {
  await AsyncStorage.setItem(OFFLINE_BOOKINGS_KEY, JSON.stringify(bookings));
}

export async function getCachedBookings(): Promise<any[]> {
  const data = await AsyncStorage.getItem(OFFLINE_BOOKINGS_KEY);
  return data ? JSON.parse(data) : [];
}
