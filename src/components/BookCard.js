import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase/config';
import { isBookFavorite, addToFavorites, removeFromFavorites } from '../services/favoritesService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

const BookCard = ({ book }) => {
  const navigation = useNavigation();
  const { volumeInfo } = book;
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
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
    checkFavoriteStatus();
  }, [book.id]);

  const checkFavoriteStatus = async () => {
    if (auth.currentUser) {
      const favorite = await isBookFavorite(auth.currentUser.uid, book.id);
      setIsFavorite(favorite);
    }
  };

  const handleFavoritePress = async (e) => {
    e.stopPropagation();
    if (!auth.currentUser) {
      // Можно добавить навигацию на экран входа
      return;
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(auth.currentUser.uid, book.id);
      } else {
        await addToFavorites(auth.currentUser.uid, book);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

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
      <View style={styles.imageContainer}>
        <Image source={getImageSource()} style={styles.image} />
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={handleFavoritePress}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#FF3B30" : "#fff"} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {volumeInfo?.title || 'Unknown Title'}
          </Text>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.9)']}
            style={styles.titleGradient}
            start={{ x: 0.8, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <View style={styles.authorContainer}>
          <Text style={styles.author} numberOfLines={1}>
            {volumeInfo?.authors?.[0] || 'Unknown Author'}
          </Text>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.9)']}
            style={styles.authorGradient}
            start={{ x: 0.8, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  info: {
    padding: 8,
  },
  titleContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleGradient: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
  },
  authorContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: '#666',
  },
  authorGradient: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
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