import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import BookCard from './BookCard';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

const BookCategory = ({ title, books, onEndReached, hasMore }) => {
  const navigation = useNavigation();
  const [favoriteBooks, setFavoriteBooks] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', auth.currentUser.uid),
      (doc) => {
        if (doc.exists() && doc.data().favoriteBooks) {
          setFavoriteBooks(doc.data().favoriteBooks);
        } else {
          setFavoriteBooks([]);
        }
      },
      (error) => {
        console.error('Error listening to favorite books:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleScroll = (event) => {
    if (!hasMore) return;
    
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToRight = 50;
    const isCloseToRight = layoutMeasurement.width + contentOffset.x >= contentSize.width - paddingToRight;
    
    if (isCloseToRight && onEndReached) {
      onEndReached();
    }
  };

  const getUniqueKey = (book, index) => {
    return `${book.id || 'unknown'}-${index}`;
  };

  const handleBookPress = (book) => {
    navigation.navigate('BookDetails', { book });
  };

  const handleFavoritePress = (book) => {
    console.log('Favorite pressed for book:', book.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScroll}
      >
        {books.map((book, index) => (
          <BookCard 
            key={getUniqueKey(book, index)} 
            book={{
              ...book,
              userId: auth.currentUser?.uid,
              username: auth.currentUser?.displayName || 'Anonymous'
            }}
            onPress={() => handleBookPress(book)}
            onFavoritePress={() => handleFavoritePress(book)}
            isFavorite={favoriteBooks.some(favBook => favBook.id === book.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
});

export default BookCategory; 