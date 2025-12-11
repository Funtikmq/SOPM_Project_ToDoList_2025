import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

let auth;
let authLoaded = false;

// Importare lazy pentru a evita inițializarea Firebase prea devreme
const loadAuth = async () => {
  try {
    const firebaseModule = await import('../services/firebase');
    auth = firebaseModule.auth;
    authLoaded = true;
  } catch (error) {
    console.warn('Firebase auth not available:', error);
  }
};

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [user, setUser] = useState(global.testUser || null);
  const [initializing, setInitializing] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    loadAuth().then(() => {
      setFirebaseReady(true);
      
      if (auth) {
        try {
          const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser || global.testUser || null);
            if (initializing) setInitializing(false);
          });

          return unsubscribe;
        } catch (error) {
          console.warn('Auth listener error:', error);
          setInitializing(false);
        }
      } else {
        // Fără Firebase, folosim test user
        setUser(global.testUser || null);
        setInitializing(false);
      }
    });
  }, []);

  // Monitor changes to global.testUser
  useEffect(() => {
    const interval = setInterval(() => {
      if (global.testUser && !user) {
        setUser(global.testUser);
      } else if (!global.testUser && user) {
        setUser(null);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [user]);

  if (initializing || !firebaseReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
