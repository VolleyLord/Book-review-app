import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import BookCard from '../../components/BookCard';
import { fetchBooksByCategory } from '../../utils/googleBooksApi';

const SearchResultsScreen = ({ route, navigation }) => {
  const { query } = route.params;
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40&key=AIzaSyAJPdeFDmJ6MHRZghQ38YvQ32o2xwchbiw`
        );
        const data = await response.json();
        setBooks(data.items || []);
      } catch (error) {
        console.error('Error searching books:', error);
      } finally {
        setLoading(false);
      }
    };

    searchBooks();
  }, [query]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      data={books}
      renderItem={({ item }) => (
        <BookCard book={item} />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      numColumns={2}
      columnWrapperStyle={styles.row}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
});

export default SearchResultsScreen; 