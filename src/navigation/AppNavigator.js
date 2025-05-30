import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    headerShown: true,
                }}
            />
        </Stack.Navigator>
    );
} 