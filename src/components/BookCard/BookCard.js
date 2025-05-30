import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { doc, onSnapshot } from 'firebase/firestore';
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

const BookCard = ({ book, onPress, onFavoritePress, isFavorite }) => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!book.userId) {
            setIsLoading(false);
            return;
        }

        // Подписываемся на изменения данных пользователя
        const unsubscribe = onSnapshot(doc(db, 'users', book.userId), (doc) => {
            if (doc.exists()) {
                setUserData(doc.data());
            } else {
                setUserData({
                    fullName: book.username || 'Anonymous',
                    avatarId: null
                });
            }
            setIsLoading(false);
        }, (error) => {
            console.error('Error fetching user data:', error);
            setUserData({
                fullName: book.username || 'Anonymous',
                avatarId: null
            });
            setIsLoading(false);
        });

        // Отписываемся при размонтировании компонента
        return () => unsubscribe();
    }, [book.userId]);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Icon
                key={index}
                name={index < rating ? 'star' : 'star-border'}
                size={16}
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
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image
                source={book.coverImage ? { uri: book.coverImage } : require('../../../assets/book_cover_default.png')}
                style={styles.coverImage}
            />
            <View style={styles.content}>
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
                    <TouchableOpacity onPress={onFavoritePress} style={styles.favoriteButton}>
                        <Icon
                            name={isFavorite ? 'favorite' : 'favorite-border'}
                            size={24}
                            color={isFavorite ? '#FF6B6B' : '#666'}
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
                <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
                <View style={styles.ratingContainer}>
                    {renderStars(book.rating)}
                    <Text style={styles.ratingText}>({book.rating.toFixed(1)})</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    coverImage: {
        width: 100,
        height: 150,
        resizeMode: 'cover',
    },
    content: {
        flex: 1,
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 5,
    },
    username: {
        fontSize: 12,
        color: '#666',
    },
    favoriteButton: {
        padding: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    author: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 5,
        fontSize: 12,
        color: '#666',
    },
});

export default BookCard; 