import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

const ReviewCard = ({ review, onEdit, onDelete, isOwner }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowMore = review.text.length > 150;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Icon
        key={index}
        name={index < rating ? 'star' : 'star-border'}
        size={20}
        color="#FFD700"
      />
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{review.username}</Text>
          <Text style={styles.date}>
            {format(new Date(review.createdAt), 'dd.MM.yyyy HH:mm')}
          </Text>
        </View>
        {isOwner && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(review)} style={styles.actionButton}>
              <Icon name="edit" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(review.id)} style={styles.actionButton}>
              <Icon name="delete" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.ratingContainer}>
        {renderStars(review.rating)}
      </View>

      <Text style={styles.reviewText} numberOfLines={isExpanded ? undefined : 3}>
        {review.text}
      </Text>

      {shouldShowMore && (
        <TouchableOpacity 
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.showMoreButton}
        >
          <Text style={styles.showMoreText}>
            {isExpanded ? 'Show less' : 'Show more'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  showMoreButton: {
    marginTop: 8,
  },
  showMoreText: {
    color: '#2196F3',
    fontSize: 14,
  },
});

export default ReviewCard; 