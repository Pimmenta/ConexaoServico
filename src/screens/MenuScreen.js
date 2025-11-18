// src/screens/MenuScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';

export default function MenuScreen({ navigation }) {
  const menuItems = [
    { id: 1, title: 'Perfil', icon: '👤' },
    { id: 2, title: 'Serviços', icon: '🔧' },
    { id: 5, title: 'Configurações', icon: '⚙️' },
    { id: 6, title: 'Ajuda', icon: '❓' },
  ];

  const handleMenuItemPress = (item) => {
    console.log('Botão pressionado:', item.title);
    
    try {
      if (item.title === 'Perfil') {
        console.log('Navegando para Perfil...');
        navigation.navigate('Perfil');
      } else {
        // Funções para outros botões (comentadas)
        switch (item.title) {
          case 'Serviços':
            navigation.navigate('Servicos'); 
            break;
          case 'Configurações':
            navigation.navigate('Configuracoes');
            break;
          case 'Ajuda':
            navigation.navigate('Contato');
            Alert.alert('Ajuda', 'Funcionalidade em desenvolvimento');
            break;
          default:
            console.log('Item não configurado:', item.title);
        }
      }
    } catch (error) {
      console.error('Erro na navegação:', error);
      Alert.alert('Erro', 'Não foi possível navegar para esta tela');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bem-vindo ao Conexão Serviço!</Text>
      </View>
      
      <View style={styles.menuGrid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuItemPress(item)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});