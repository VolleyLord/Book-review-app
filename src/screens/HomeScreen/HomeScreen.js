import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import BookCategory from '../../components/BookCategory';
import SearchBar from '../../components/SearchBar';
import Navigation from '../../components/Navigation/Navigation';
import { fetchBooksByCategory, categories } from '../../utils/googleBooksApi';

const HomeScreen = ({ navigation, route }) => {
  const [booksByCategory, setBooksByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [pageTokens, setPageTokens] = useState({});
  const [loadingMore, setLoadingMore] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const user = route.params?.user;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Navigation user={user} />,
    });
  }, [navigation, user]);

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
});

export default HomeScreen;