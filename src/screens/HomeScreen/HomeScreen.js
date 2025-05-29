import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import BookCategory from '../../components/BookCategory';
import SearchBar from '../../components/SearchBar';
import { fetchBooksByCategory, categories } from '../../utils/googleBooksApi';

const HomeScreen = ({ navigation }) => {
  const [booksByCategory, setBooksByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [pageTokens, setPageTokens] = useState({});
  const [loadingMore, setLoadingMore] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchResults', { query: searchQuery.trim() });
    }
  };

  const loadMoreBooks = async (category) => {
    if (loadingMore[category]) return;
    
    try {
      setLoadingMore(prev => ({ ...prev, [category]: true }));
      const currentBooks = booksByCategory[category] || [];
      const pageToken = pageTokens[category];
      const { books, nextPageToken } = await fetchBooksByCategory(category, pageToken);
      
      if (books.length > 0) {
        setBooksByCategory(prev => ({
          ...prev,
          [category]: [...currentBooks, ...books]
        }));
        
        setPageTokens(prev => ({
          ...prev,
          [category]: nextPageToken
        }));
      }
    } catch (error) {
      console.error('Error loading more books:', error);
    } finally {
      setLoadingMore(prev => ({ ...prev, [category]: false }));
    }
  };

  useEffect(() => {
    const loadInitialBooks = async () => {
      try {
        const booksData = {};
        const tokens = {};
        
        for (const category of categories) {
          const { books, nextPageToken } = await fetchBooksByCategory(category);
          booksData[category] = books;
          tokens[category] = nextPageToken;
        }
        
        setBooksByCategory(booksData);
        setPageTokens(tokens);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialBooks();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearch}
      />
      <ScrollView style={styles.scrollView}>
        {categories.map((category) => (
          <BookCategory
            key={category}
            title={category.charAt(0).toUpperCase() + category.slice(1)}
            books={booksByCategory[category] || []}
            onEndReached={() => loadMoreBooks(category)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    marginRight: 15,
    padding: 8,
  },
  logoutText: {
    color: '#2196F3',
    fontSize: 16,
  },
});

export default HomeScreen;