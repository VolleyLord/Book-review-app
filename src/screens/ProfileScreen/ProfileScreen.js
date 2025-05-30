import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, FlatList, ToastAndroid, Platform } from 'react-native';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import LoadingModal from '../../utils/LoadingModal';

const AVATARS = [
    { id: 'lion', source: require('../../../assets/lion.png') },
    { id: 'owl', source: require('../../../assets/owl.png') },
    { id: 'koala', source: require('../../../assets/koala.png') },
    { id: 'sealion', source: require('../../../assets/sea-lion.png') },
    { id: 'dog', source: require('../../../assets/dog.png') },
    { id: 'boy', source: require('../../../assets/boy.png') },
    { id: 'man0', source: require('../../../assets/man.png') },
    { id: 'man1', source: require('../../../assets/man(1).png') },
    { id: 'man2', source: require('../../../assets/man(2).png') },
    { id: 'man3', source: require('../../../assets/man(3).png') },
    { id: 'man4', source: require('../../../assets/man(4).png') },
    { id: 'man5', source: require('../../../assets/man(5).png') },
    { id: 'woman0', source: require('../../../assets/woman.png') },
    { id: 'woman1', source: require('../../../assets/woman(1).png') },
    { id: 'woman2', source: require('../../../assets/woman(2).png') },
    { id: 'meerkat', source: require('../../../assets/meerkat.png') },
    { id: 'chicken', source: require('../../../assets/chicken.png') },
    { id: 'bear', source: require('../../../assets/bear.png') },
    { id: 'cat', source: require('../../../assets/cat.png') },
];

const ProfileScreen = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            // Для iOS можно использовать Alert с автоматическим закрытием
            Alert.alert('', message, [{ text: 'OK' }], { cancelable: true });
        }
    };

    const fetchUserData = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                setUser(userDoc.data());
                if (userDoc.data().avatarId) {
                    const avatar = AVATARS.find(a => a.id === userDoc.data().avatarId);
                    if (avatar) {
                        setSelectedAvatar(avatar);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            showToast('Failed to load user data');
        }
    };

    const handleAvatarSelect = async (avatar) => {
        setIsLoading(true);
        try {
            await setDoc(doc(db, 'users', auth.currentUser.uid), {
                ...user,
                avatarId: avatar.id
            }, { merge: true });
            
            setSelectedAvatar(avatar);
            setIsAvatarModalVisible(false);
            showToast('Avatar updated successfully');
        } catch (error) {
            console.error('Error updating avatar:', error);
            showToast('Failed to update avatar');
        } finally {
            setIsLoading(false);
        }
    };

    const renderAvatarItem = ({ item }) => (
        <TouchableOpacity
            style={styles.avatarItem}
            onPress={() => handleAvatarSelect(item)}
        >
            <Image source={item.source} style={styles.avatarOption} />
        </TouchableOpacity>
    );

    if (!user) return null;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileHeader}>
                <View style={styles.imageContainer}>
                    <Image
                        source={selectedAvatar ? selectedAvatar.source : require('../../../assets/default-avatar.png')}
                        style={styles.profileImage}
                    />
                    <TouchableOpacity 
                        style={styles.editButton} 
                        onPress={() => setIsAvatarModalVisible(true)}
                        disabled={isLoading}
                    >
                        <Text style={styles.editButtonText}>
                            Choose Avatar
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.name}>{user.fullName}</Text>
                <Text style={styles.email}>{user.email}</Text>
            </View>

            <View style={styles.favoritesSection}>
                <Text style={styles.sectionTitle}>Favorites</Text>
                {/* Здесь будет список избранных книг */}
            </View>

            <Modal
                visible={isAvatarModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAvatarModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Your Avatar</Text>
                        <FlatList
                            data={AVATARS}
                            renderItem={renderAvatarItem}
                            keyExtractor={item => item.id}
                            numColumns={3}
                            contentContainerStyle={styles.avatarGrid}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsAvatarModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <LoadingModal isVisible={isLoading} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    profileHeader: {
        alignItems: 'center',
        padding: 20,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 10,
    },
    editButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    favoritesSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    avatarGrid: {
        padding: 10,
    },
    avatarItem: {
        padding: 10,
        alignItems: 'center',
    },
    avatarOption: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    closeButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    closeButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen; 