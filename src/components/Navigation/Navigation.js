import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProfileMenu from '../ProfileMenu/ProfileMenu';

const Navigation = ({ user }) => {
    const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.profileContainer}
                onPress={() => setIsProfileMenuVisible(true)}
            >
                <Text style={styles.userName}>{user?.fullName}</Text>
                <Image
                    source={user?.profileImage ? { uri: user.profileImage } : require('../../../assets/default-avatar.png')}
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