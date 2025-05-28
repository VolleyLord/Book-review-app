import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import BookCard from './BookCard';

const BookCategory = ({ title, books, onEndReached }) => {
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
            book={book} 
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