// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Menu" 
          component={MenuScreen}
          options={{ title: 'Menu Principal' }}
        />
        <Stack.Screen 
          name="Perfil" 
          component={ProfileScreen}
          options={{ title: 'Meu Perfil' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}