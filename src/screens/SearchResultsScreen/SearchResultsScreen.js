import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import BookCard from '../../components/BookCard';

const SearchResultsScreen = ({ route, navigation }) => {
  const { query } = route.params;
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const searchBooks = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40&startIndex=${startIndex}&key=AIzaSyAJPdeFDmJ6MHRZghQ38YvQ32o2xwchbiw`
      );
      const data = await response.json();
      
      if (data.items) {
        if (isLoadMore) {
          setBooks(prevBooks => [...prevBooks, ...data.items]);
        } else {
          setBooks(data.items);
        }
        setHasMore(data.items.length === 40);
        setStartIndex(prevIndex => prevIndex + 40);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setStartIndex(0);
    setBooks([]);
    setHasMore(true);
    searchBooks();
  }, [query]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      searchBooks(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={({ item }) => (
          <BookCard book={item} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.row}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loadingMore ? (
            <ActivityIndicator size="small" color="#0000ff" style={styles.loadingMore} />
          ) : hasMore ? (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
            >
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          ) : null
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  loadingMore: {
    padding: 16,
  },
  loadMoreButton: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchResultsScreen; 