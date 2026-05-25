// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme, StatusBar } from 'react-native';
import { Colors } from '../constants/Colors';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  // Automatically detects if the physical phone is in Light or Dark mode
  const colorScheme = useColorScheme(); 
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <AuthProvider>
      {/* Changes the battery/wifi icons to contrast with the background */}
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background} 
      />
      
      {/* The main app wrapper */}
      <Stack 
        screenOptions={{ 
          headerShown: false, // Hides the default ugly header
          contentStyle: { backgroundColor: theme.background } 
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
      </Stack>
    </AuthProvider>
  );
}
