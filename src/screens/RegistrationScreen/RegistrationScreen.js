import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import styles from './styles';
import { auth, db } from '../../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import LoadingModal from '../../utils/LoadingModal';
import AuthInput from '../../components/AuthInput/AuthInput';

export default function RegistrationScreen({navigation}) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onFooterLinkPress = () => {
        navigation.navigate('Login');
    }

    const onRegisterPress = async () => {
        if (password !== confirmPassword) {
            alert("Passwords don't match.");
            return;
        }
    
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;
            const data = {
                id: uid,
                email,
                fullName,
            };
            
            await setDoc(doc(db, 'users', uid), data);
            navigation.navigate('Home', {user: data});
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%' }}
                keyboardShouldPersistTaps="always">
                {/* App logo */}
                <Image
                    style={styles.logo}
                    source={require('../../../assets/icon.png')}
                />
                {/* Full name input field */}
                <AuthInput
                    placeholder='Full Name'
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="none"
                />
                {/* Email input field */}
                <AuthInput
                    placeholder='E-mail'
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                {/* Password input field */}
                <AuthInput
                    placeholder='Password'
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                />
                {/* Confirm password input field */}
                <AuthInput
                    placeholder='Confirm Password'
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                />
                {/* Register button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={onRegisterPress}>
                    <Text style={styles.buttonTitle}>Create account</Text>
                </TouchableOpacity>
                {/* Footer link to navigate to the login screen */}
                <View style={styles.footerView}>
                    <Text style={styles.footerText}>Already got an account? <Text onPress={onFooterLinkPress} style={styles.footerLink}>Log in</Text></Text>
                </View>
            </KeyboardAwareScrollView>
            <LoadingModal isVisible={isLoading} />
        </View>
    );
}
