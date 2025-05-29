import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ReviewForm = ({ onSubmit, initialData, onCancel }) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [text, setText] = useState(initialData?.text || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setText(initialData.text);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (text.length < 6) {
      setError('Review must be at least 6 characters long');
      return;
    }
    if (text.length > 1000) {
      setError('Review cannot exceed 1000 characters');
      return;
    }
    setError('');
    onSubmit({ rating, text });
  };

  const renderStars = () => {
    return [...Array(5)].map((_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => setRating(index + 1)}
        style={styles.starButton}
      >
        <Icon
          name={index < rating ? 'star' : 'star-border'}
          size={30}
          color="#FFD700"
        />
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{initialData ? 'Edit Review' : 'Write a Review'}</Text>
      
      <View style={styles.ratingContainer}>
        {renderStars()}
      </View>

      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="Write your review (6-1000 characters)"
        value={text}
        onChangeText={setText}
        maxLength={1000}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
        >
          <Text style={[styles.buttonText, styles.submitButtonText]}>
            {initialData ? 'Update' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  errorText: {
    color: '#ff0000',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    fontSize: 16,
    color: '#666',
  },
  submitButtonText: {
    color: '#fff',
  },
});

export default ReviewForm; 