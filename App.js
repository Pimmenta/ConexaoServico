// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, Text } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ContactScreen from './src/screens/ContactScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import DatabaseService from './src/services/DatabaseService'; 
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await DatabaseService.init();
        setDbInitialized(true);
        console.log('App inicializado com sucesso!');
      } catch (error) {
        console.error('Erro ao inicializar app:', error);
        // Mesmo com erro, deixa o app continuar
        setDbInitialized(true);
      }
    };

    initializeDB();
  }, []);

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16 }}>Inicializando...</Text>
      </View>
    );
  }

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
        <Stack.Screen 
          name="Contato" 
          component={ContactScreen}
          options={{ title: 'Contato WhatsApp' }}
        />
        <Stack.Screen 
          name="Servicos" 
          component={ServicesScreen}
          options={{ title: 'Serviços Disponíveis' }}
        />
        <Stack.Screen 
          name="Configuracoes" 
          component={SettingsScreen}
          options={{ title: 'Configurações' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}