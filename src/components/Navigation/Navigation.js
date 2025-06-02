import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import { auth, db } from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

const AVATARS = {
    'lion': require('../../../assets/lion.png'),
    'owl': require('../../../assets/owl.png'),
    'koala': require('../../../assets/koala.png'),
    'sealion': require('../../../assets/sea-lion.png'),
    'dog': require('../../../assets/dog.png'),
    'boy': require('../../../assets/boy.png'),
    'man0': require('../../../assets/man.png'),
    'man1': require('../../../assets/man(1).png'),
    'man2': require('../../../assets/man(2).png'),
    'man3': require('../../../assets/man(3).png'),
    'man4': require('../../../assets/man(4).png'),
    'man5': require('../../../assets/man(5).png'),
    'woman0': require('../../../assets/woman.png'),
    'woman1': require('../../../assets/woman(1).png'),
    'woman2': require('../../../assets/woman(2).png'),
    'meerkat': require('../../../assets/meerkat.png'),
    'chicken': require('../../../assets/chicken.png'),
    'bear': require('../../../assets/bear.png'),
    'cat': require('../../../assets/cat.png'),
};

const Navigation = ({ user }) => {
    const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
    const [userAvatar, setUserAvatar] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        if (!auth.currentUser) return;

        // Создаем слушатель изменений документа пользователя
        const unsubscribe = onSnapshot(
            doc(db, 'users', auth.currentUser.uid),
            (doc) => {
                if (doc.exists() && doc.data().avatarId) {
                    const avatarId = doc.data().avatarId;
                    setUserAvatar(AVATARS[avatarId]);
                } else {
                    setUserAvatar(null);
                }
            },
            (error) => {
                console.error('Error listening to user avatar changes:', error);
            }
        );

        // Очищаем слушатель при размонтировании компонента
        return () => unsubscribe();
    }, []);

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.profileContainer}
                onPress={() => setIsProfileMenuVisible(true)}
            >
                <Text style={styles.userName}>{user?.fullName}</Text>
                <Image
                    source={userAvatar || require('../../../assets/default-avatar.png')}
                    style={styles.profileImage}
                />
            </TouchableOpacity>
            <ProfileMenu 
                isVisible={isProfileMenuVisible}
                onClose={() => setIsProfileMenuVisible(false)}
                user={user}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    userName: {
        fontSize: 16,
        marginRight: 10,
        color: '#333',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
});

export default Navigation; 