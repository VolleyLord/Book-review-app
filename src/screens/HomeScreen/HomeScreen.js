import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import BookCategory from '../../components/BookCategory';
import SearchBar from '../../components/SearchBar';
import Navigation from '../../components/Navigation/Navigation';
import CategorySelector from '../../components/CategorySelector/CategorySelector';
import { fetchBooksByCategory, categories } from '../../utils/googleBooksApi';
import { auth, db } from '../../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const HomeScreen = ({ navigation, route }) => {
  const [booksByCategory, setBooksByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [pageTokens, setPageTokens] = useState({});
  const [loadingMore, setLoadingMore] = useState({});
  const [hasMorePages, setHasMorePages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(categories);
  const user = route.params?.user;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Navigation user={user} />,
    });
  }, [navigation, user]);

  useEffect(() => {
    const loadUserCategories = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().selectedCategories) {
          setSelectedCategories(userDoc.data().selectedCategories);
        }
      } catch (error) {
        console.error('Error loading user categories:', error);
      }
    };

    loadUserCategories();
  }, []);

  const handleCategoryToggle = async (category) => {
    const newSelectedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(newSelectedCategories);

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          selectedCategories: newSelectedCategories
        });
      } catch (error) {
        console.error('Error updating user categories:', error);
      }
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchResults', { query: searchQuery.trim() });
    }
  };

  const loadMoreBooks = async (category) => {
    if (loadingMore[category] || !hasMorePages[category]) return;
    
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

        setHasMorePages(prev => ({
          ...prev,
          [category]: !!nextPageToken
        }));
      } else {
        setHasMorePages(prev => ({
          ...prev,
          [category]: false
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
        const hasMore = {};
        
        for (const category of selectedCategories) {
          const { books, nextPageToken } = await fetchBooksByCategory(category);
          booksData[category] = books;
          tokens[category] = nextPageToken;
          hasMore[category] = !!nextPageToken;
        }
        
        setBooksByCategory(booksData);
        setPageTokens(tokens);
        setHasMorePages(hasMore);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialBooks();
  }, [selectedCategories]);

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
        <CategorySelector
          selectedCategories={selectedCategories}
          onToggleCategory={handleCategoryToggle}
        />
        {selectedCategories.map((category) => (
          <BookCategory
            key={category}
            title={category.charAt(0).toUpperCase() + category.slice(1)}
            books={booksByCategory[category] || []}
            onEndReached={() => loadMoreBooks(category)}
            hasMore={hasMorePages[category]}
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