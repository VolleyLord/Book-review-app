import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { auth, db, storage } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import LoadingModal from '../../utils/LoadingModal';

const ProfileScreen = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    React.useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                setUser(userDoc.data());
                if (userDoc.data().profileImage) {
                    setProfileImage(userDoc.data().profileImage);
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        setIsLoading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `profileImages/${auth.currentUser.uid}`);
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            
            await setDoc(doc(db, 'users', auth.currentUser.uid), {
                ...user,
                profileImage: downloadURL
            }, { merge: true });
            
            setProfileImage(downloadURL);
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileHeader}>
                <View style={styles.imageContainer}>
                    <Image
                        source={profileImage ? { uri: profileImage } : require('../../../assets/default-avatar.png')}
                        style={styles.profileImage}
                    />
                    <TouchableOpacity style={styles.editButton} onPress={pickImage}>
                        <Text style={styles.editButtonText}>
                            {profileImage ? 'Edit Photo' : 'Add Photo'}
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
});

export default ProfileScreen; 