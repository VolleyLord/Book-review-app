import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  Linking,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

const BookDetailsScreen = ({ route }) => {
  const { book } = route.params;
  const { volumeInfo } = book;

  useEffect(() => {
    console.log('BookDetailsScreen - Mounted with book:', {
      id: book.id,
      title: volumeInfo?.title,
      authors: volumeInfo?.authors,
      hasImage: !!volumeInfo?.imageLinks?.thumbnail,
      hasDescription: !!volumeInfo?.description,
      hasPreview: !!volumeInfo?.previewLink
    });
  }, [book]);

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
});

export default BookDetailsScreen; 