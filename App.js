import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, HomeScreen, RegistrationScreen } from './src/screens';
import BookDetailsScreen from './src/screens/BookDetailsScreen/BookDetailsScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen/SearchResultsScreen';
import LoadScreen from './src/screens/LoadScreen/LoadScreen';

import { decode, encode } from 'base-64';
if (!global.btoa) { global.btoa = encode }
if (!global.atob) { global.atob = decode }

const Stack = createStackNavigator();
const auth = getAuth(); 
const db = getFirestore(); 

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log('Auth state changed, user:', user.uid);
          const userDoc = doc(db, 'users', user.uid);
          console.log('Attempting to fetch user document...');
          const docSnapshot = await getDoc(userDoc);
          console.log('Document exists:', docSnapshot.exists());
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            console.log('User data loaded:', userData);
            setUser(userData);
          } else {
            console.log('No user document found, creating one...');
            // Создаем документ пользователя, если его нет
            const newUserData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'Anonymous',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDoc, newUserData);
            console.log('New user document created');
            setUser(newUserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
          });
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No authenticated user');
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadScreen />;
  }

  console.log('Rendering App with user:', user);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              initialParams={{ extraData: user }}
              options={{ 
                title: 'Book Reviews',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: 'bold',
                }
              }}
            />
            <Stack.Screen 
              name="BookDetails" 
              component={BookDetailsScreen}
              options={{ title: 'Book Details' }}
            />
            <Stack.Screen 
              name="SearchResults" 
              component={SearchResultsScreen}
              options={({ route }) => ({ title: `Search: ${route.params.query}` })}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

