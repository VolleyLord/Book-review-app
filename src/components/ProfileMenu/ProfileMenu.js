import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

const ProfileMenu = ({ isVisible, onClose, user }) => {
    const navigation = useNavigation();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigation.navigate('Login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleProfilePress = () => {
        navigation.navigate('Profile');
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.overlay} 
                activeOpacity={1} 
                onPress={onClose}
            >
                <View style={styles.menuContainer}>
                    <View style={styles.menuArrow} />
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={handleProfilePress}
                    >
                        <Text style={styles.menuText}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={handleSignOut}
                    >
                        <Text style={styles.menuText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        position: 'absolute',
        top: 60,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        width: 150,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuArrow: {
        position: 'absolute',
        top: -8,
        right: 20,
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderStyle: 'solid',
        backgroundColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'white',
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
});

export default ProfileMenu; 