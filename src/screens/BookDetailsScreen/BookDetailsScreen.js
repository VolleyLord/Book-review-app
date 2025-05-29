import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  Linking,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import ReviewForm from '../../components/ReviewForm/ReviewForm';

const { width } = Dimensions.get('window');

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Highest Rated', value: 'highest' },
  { label: 'Lowest Rated', value: 'lowest' },
];

const BookDetailsScreen = ({ route, navigation }) => {
  const { book } = route.params;
  const { volumeInfo } = book;
  const [reviews, setReviews] = useState([]);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [showSortModal, setShowSortModal] = useState(false);
  const [hasUserReview, setHasUserReview] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const checkUserReview = async () => {
      if (!auth.currentUser) return;
      
      const q = query(
        collection(db, 'reviews'),
        where('bookId', '==', book.id),
        where('userId', '==', auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      setHasUserReview(!querySnapshot.empty);
    };

    checkUserReview();
  }, [book.id, auth.currentUser]);

  useEffect(() => {
    console.log('BookDetailsScreen - Mounted with book:', {
      id: book.id,
      title: volumeInfo?.title,
      authors: volumeInfo?.authors,
      hasImage: !!volumeInfo?.imageLinks?.thumbnail,
      hasDescription: !!volumeInfo?.description,
      hasPreview: !!volumeInfo?.previewLink
    });

    const q = query(
      collection(db, 'reviews'),
      where('bookId', '==', book.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
    });

    return () => unsubscribe();
  }, [book.id]);

  const getSortedReviews = () => {
    const sorted = [...reviews];
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleAddReview = async (reviewData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to write a review');
        return;
      }

      if (hasUserReview) {
        Alert.alert('Error', 'You have already reviewed this book');
        return;
      }

      const review = {
        bookId: book.id,
        userId: user.uid,
        username: user.displayName || 'Anonymous',
        rating: reviewData.rating,
        text: reviewData.text,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'reviews'), review);
      setIsWritingReview(false);
      setHasUserReview(true);
    } catch (error) {
      console.error('Error adding review:', error);
      Alert.alert('Error', 'Failed to add review');
    }
  };

  const handleEditReview = async (reviewData) => {
    try {
      const reviewRef = doc(db, 'reviews', editingReview.id);
      await updateDoc(reviewRef, {
        rating: reviewData.rating,
        text: reviewData.text,
        updatedAt: new Date().toISOString(),
      });
      setEditingReview(null);
    } catch (error) {
      console.error('Error updating review:', error);
      Alert.alert('Error', 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setHasUserReview(false);
    } catch (error) {
      console.error('Error deleting review:', error);
      Alert.alert('Error', 'Failed to delete review');
    }
  };

  const getImageSource = () => {
    if (volumeInfo?.imageLinks?.thumbnail) {
      return { uri: volumeInfo.imageLinks.thumbnail };
    }
    return require('../../../assets/book_cover_default.png');
  };

  const openPreview = () => {
    if (volumeInfo?.previewLink) {
      console.log('BookDetailsScreen - Opening preview link:', volumeInfo.previewLink);
      Linking.openURL(volumeInfo.previewLink);
    }
  };

  if (!volumeInfo) {
    console.error('BookDetailsScreen - No volumeInfo found in book:', book);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Book information not available</Text>
      </View>
    );
  }

  const renderDetailItem = (label, value) => {
    if (!value) return null;
    return (
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}: </Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={getImageSource()}
          style={styles.cover}
          resizeMode="contain"
        />
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{volumeInfo.title || 'Untitled'}</Text>
          <Text style={styles.authors}>
            {volumeInfo.authors?.join(', ') || 'Unknown Author'}
          </Text>
          <Text style={styles.rating}>
            Rating: {volumeInfo.averageRating || 'N/A'} ({volumeInfo.ratingsCount || 0} ratings)
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        {renderDetailItem('Publisher', volumeInfo.publisher)}
        {renderDetailItem('Published', volumeInfo.publishedDate)}
        {renderDetailItem('Pages', volumeInfo.pageCount?.toString())}
        {renderDetailItem('Categories', volumeInfo.categories?.join(', '))}
        {renderDetailItem('Language', volumeInfo.language?.toUpperCase())}
      </View>

      {volumeInfo.description && (
        <View style={styles.description}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{volumeInfo.description}</Text>
        </View>
      )}

      {volumeInfo.previewLink && (
        <TouchableOpacity onPress={openPreview}>
          <Text style={styles.previewLink}>Read Preview</Text>
        </TouchableOpacity>
      )}

      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <View style={styles.reviewsTitleContainer}>
            <Text style={styles.reviewsTitle}>Reviews</Text>
            <View style={styles.ratingInfo}>
              <Icon name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>{getAverageRating()}</Text>
              <Text style={styles.reviewsCount}>({reviews.length} reviews)</Text>
            </View>
          </View>
        </View>

        <View style={styles.reviewsControls}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.sortButtonText}>
              {SORT_OPTIONS.find(opt => opt.value === sortOption)?.label}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
          {!hasUserReview && (
            <TouchableOpacity
              style={styles.writeReviewButton}
              onPress={() => setIsWritingReview(true)}
            >
              <Text style={styles.writeReviewText}>Write a Review</Text>
            </TouchableOpacity>
          )}
        </View>

        {isWritingReview && (
          <ReviewForm
            onSubmit={handleAddReview}
            onCancel={() => setIsWritingReview(false)}
          />
        )}

        {editingReview && (
          <ReviewForm
            initialData={editingReview}
            onSubmit={handleEditReview}
            onCancel={() => setEditingReview(null)}
          />
        )}

        {getSortedReviews().map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwner={review.userId === auth.currentUser?.uid}
            onEdit={() => setEditingReview(review)}
            onDelete={handleDeleteReview}
          />
        ))}
      </View>

      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  sortOption === option.value && styles.sortOptionSelected
                ]}
                onPress={() => {
                  setSortOption(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortOption === option.value && styles.sortOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  cover: {
    width: width * 0.3,
    height: width * 0.45,
    borderRadius: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  authors: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: '#666',
  },
  details: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  description: {
    padding: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  previewLink: {
    color: '#2196F3',
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  reviewsSection: {
    padding: 16,
  },
  reviewsHeader: {
    marginBottom: 12,
  },
  reviewsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#333',
  },
  reviewsCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  reviewsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 12,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  writeReviewButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  writeReviewText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxWidth: 300,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  sortOptionSelected: {
    backgroundColor: '#f0f0f0',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  sortOptionTextSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default BookDetailsScreen; 