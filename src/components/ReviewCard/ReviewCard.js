import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AVATARS = {
    lion: require('../../../assets/lion.png'),
    owl: require('../../../assets/owl.png'),
    koala: require('../../../assets/koala.png'),
    sealion: require('../../../assets/sea-lion.png'),
    dog: require('../../../assets/dog.png'),
    boy: require('../../../assets/boy.png'),
    man0: require('../../../assets/man.png'),
    man1: require('../../../assets/man(1).png'),
    man2: require('../../../assets/man(2).png'),
    man3: require('../../../assets/man(3).png'),
    man4: require('../../../assets/man(4).png'),
    man5: require('../../../assets/man(5).png'),
    woman0: require('../../../assets/woman.png'),
    woman1: require('../../../assets/woman(1).png'),
    woman2: require('../../../assets/woman(2).png'),
    meerkat: require('../../../assets/meerkat.png'),
    chicken: require('../../../assets/chicken.png'),
    bear: require('../../../assets/bear.png'),
    cat: require('../../../assets/cat.png'),
};

const ReviewCard = ({ review, onEdit, onDelete, isOwner }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const shouldShowMore = review.text.length > 150;

    useEffect(() => {
        if (!review.userId) {
            setIsLoading(false);
            return;
        }

        // Подписываемся на изменения данных пользователя
        const unsubscribe = onSnapshot(doc(db, 'users', review.userId), (doc) => {
            if (doc.exists()) {
                setUserData(doc.data());
            } else {
                setUserData({
                    fullName: review.username || 'Anonymous',
                    avatarId: null
                });
            }
            setIsLoading(false);
        }, (error) => {
            console.error('Error fetching user data:', error);
            setUserData({
                fullName: review.username || 'Anonymous',
                avatarId: null
            });
            setIsLoading(false);
        });

        // Отписываемся при размонтировании компонента
        return () => unsubscribe();
    }, [review.userId]);

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

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Image
                        source={userData?.avatarId && AVATARS[userData.avatarId] 
                            ? AVATARS[userData.avatarId] 
                            : require('../../../assets/default-avatar.png')}
                        style={styles.avatar}
                    />
                    <Text style={styles.username}>{userData?.fullName || 'Anonymous'}</Text>
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
                <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
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
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
    marginLeft: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  showMoreText: {
    color: '#007AFF',
    marginTop: 5,
    fontSize: 14,
  },
});

export default ReviewCard; 