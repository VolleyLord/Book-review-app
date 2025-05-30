import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import BookCard from './BookCard';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase/config';

const BookCategory = ({ title, books, onEndReached }) => {
  const navigation = useNavigation();

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToRight = 50;
    const isCloseToRight = layoutMeasurement.width + contentOffset.x >= contentSize.width - paddingToRight;
    
    if (isCloseToRight && onEndReached) {
      onEndReached();
    }
  };

  const getUniqueKey = (book, index) => {
    // Используем комбинацию id книги и индекса для гарантии уникальности
    return `${book.id || 'unknown'}-${index}`;
  };

  const handleBookPress = (book) => {
    navigation.navigate('BookDetails', { book });
  };

  const handleFavoritePress = (book) => {
    // Здесь будет логика добавления/удаления из избранного
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
              userId: auth.currentUser?.uid, // Добавляем userId текущего пользователя
              username: auth.currentUser?.displayName || 'Anonymous'
            }}
            onPress={() => handleBookPress(book)}
            onFavoritePress={() => handleFavoritePress(book)}
            isFavorite={false} // Здесь нужно будет добавить проверку избранного
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