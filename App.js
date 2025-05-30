import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, HomeScreen, RegistrationScreen, ProfileScreen } from './src/screens';
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
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              initialParams={{ user }}
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
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ title: 'Profile' }}
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

