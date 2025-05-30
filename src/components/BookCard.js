import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

const BookCard = ({ book }) => {
  const navigation = useNavigation();
  const { volumeInfo } = book;
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const db = getFirestore();

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('bookId', '==', book.id)
      );
      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(doc => doc.data());
      
      if (reviews.length > 0) {
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        setAverageRating((sum / reviews.length).toFixed(1));
        setReviewsCount(reviews.length);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchReviews();
    }, [])
  );

  useEffect(() => {
    fetchReviews();
  }, [book.id]);

  const getImageSource = () => {
    if (volumeInfo?.imageLinks?.thumbnail) {
      return { uri: volumeInfo.imageLinks.thumbnail };
    }
    return require('../../assets/book_cover_default.png');
  };

  const handlePress = () => {
    navigation.navigate('BookDetails', { book });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={getImageSource()} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {volumeInfo?.title || 'Unknown Title'}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {volumeInfo?.authors?.[0] || 'Unknown Author'}
        </Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{averageRating}</Text>
          <Text style={styles.reviewsCount}>({reviewsCount})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
    resizeMode: 'cover',
  },
  info: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewsCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
});

export default BookCard; 