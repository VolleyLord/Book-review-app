import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

const BookCard = ({ book }) => {
  const navigation = useNavigation();
  const { volumeInfo } = book;

  console.log('BookCard - Rendering book:', {
    id: book.id,
    title: volumeInfo?.title,
    authors: volumeInfo?.authors,
    hasImage: !!volumeInfo?.imageLinks?.thumbnail,
    key: `${book.id || 'unknown'}-${Math.random()}`
  });

  const getImageSource = () => {
    if (volumeInfo?.imageLinks?.thumbnail) {
      return { uri: volumeInfo.imageLinks.thumbnail };
    }
    return require('../../assets/book_cover_default.png');
  };

  const handlePress = () => {
    console.log('BookCard - Pressed book:', {
      id: book.id,
      title: volumeInfo?.title,
      key: `${book.id || 'unknown'}-${Math.random()}`
    });
    navigation.navigate('BookDetails', { book });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image
        source={getImageSource()}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <Text style={styles.title} numberOfLines={2}>
        {volumeInfo?.title || 'Untitled'}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {volumeInfo?.authors?.[0] || 'Unknown Author'}
      </Text>
      <Text style={styles.rating}>
        Rating: {volumeInfo?.averageRating || 'N/A'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbnail: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
    borderRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default BookCard; 