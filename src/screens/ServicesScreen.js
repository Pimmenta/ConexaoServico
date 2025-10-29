// src/screens/ServicesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  FlatList,
  Modal
} from 'react-native';
import XMLStorageService from '../services/XMLStorageService';

export default function ServicesScreen({ navigation }) {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState(0); // 0 = Todos
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Tipos de serviço
  const serviceTypes = [
    { id: 0, name: 'Todos os Serviços', icon: '🔍' },
    { id: 1, name: 'Eletricista', icon: '⚡' },
    { id: 2, name: 'Encanador', icon: '🔧' },
    { id: 3, name: 'Fotógrafo', icon: '📷' },
    { id: 4, name: 'Pedreiro', icon: '🏗️' }
  ];

  // Carregar serviços ao abrir a tela
  useEffect(() => {
    loadServices();
  }, []);

  // Filtrar serviços quando o tipo selecionado mudar
  useEffect(() => {
    filterServices();
  }, [selectedServiceType, services]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const servicesData = await XMLStorageService.loadServices();
      console.log('Serviços carregados:', servicesData); // Debug
      setServices(servicesData);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      Alert.alert('Erro', 'Não foi possível carregar os serviços');
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    console.log('Filtrando serviços...', { 
      selectedServiceType, 
      totalServices: services.length 
    }); // Debug
    
    if (selectedServiceType === 0) {
      // Todos os serviços - sem filtro
      setFilteredServices(services);
      console.log('Mostrando TODOS os serviços:', services.length); // Debug
    } else {
      // Filtro por tipo específico
      const filtered = services.filter(service => {
        console.log('Comparando:', { 
          serviceTipo: service.tipoServico, 
          selectedType: selectedServiceType,
          match: service.tipoServico === selectedServiceType 
        }); // Debug
        return service.tipoServico === selectedServiceType;
      });
      setFilteredServices(filtered);
      console.log('Serviços filtrados:', filtered.length); // Debug
    }
  };

  // Função para selecionar tipo de serviço
  const selectServiceType = (typeId) => {
    setSelectedServiceType(typeId);
    setModalVisible(false);
  };

  // Função para obter nome do tipo selecionado
  const getSelectedTypeName = () => {
    const selectedType = serviceTypes.find(type => type.id === selectedServiceType);
    return selectedType ? `${selectedType.icon} ${selectedType.name}` : 'Selecionar';
  };

  // Função para abrir WhatsApp com mensagem de agendamento
  const openWhatsApp = async (phoneNumber, serviceName) => {
    try {
      const message = `Olá vi seu numero no Conexão Serviço e desejo realizar um agendamento para o serviço: ${serviceName}`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      const supported = await Linking.canOpenURL(whatsappUrl);
      
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Erro', 'WhatsApp não está instalado no dispositivo');
      }
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    }
  };

  // Função para obter ícone do tipo de serviço
  const getServiceIcon = (tipoServico) => {
    const serviceType = serviceTypes.find(type => type.id === tipoServico);
    return serviceType ? serviceType.icon : '🔧';
  };

  // Função para obter nome do tipo de serviço
  const getServiceTypeName = (tipoServico) => {
    const serviceType = serviceTypes.find(type => type.id === tipoServico);
    return serviceType ? serviceType.name : 'Serviço';
  };

  // Renderizar item da lista
  const renderServiceItem = ({ item }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceIcon}>{getServiceIcon(item.tipoServico)}</Text>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.nome}</Text>
          <Text style={styles.serviceType}>{getServiceTypeName(item.tipoServico)}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐ {item.avaliacao || '5.0'}</Text>
        </View>
      </View>
      
      <Text style={styles.serviceDescription}>{item.informacoes || 'Serviço profissional de qualidade'}</Text>
      
      <TouchableOpacity 
        style={styles.contactButton}
        onPress={() => openWhatsApp(item.telefone, item.nome)}
      >
        <Text style={styles.contactButtonText}>💬 Agendar via WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando serviços...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Serviços Disponíveis</Text>
        <Text style={styles.subtitle}>Encontre os melhores profissionais</Text>
      </View>

      {/* Combobox de Filtro */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por:</Text>
        <TouchableOpacity
          style={styles.combobox}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.comboboxText}>{getSelectedTypeName()}</Text>
          <Text style={styles.comboboxArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Modal do Combobox */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o tipo de serviço</Text>
            {serviceTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.modalOption,
                  selectedServiceType === type.id && styles.modalOptionSelected
                ]}
                onPress={() => selectServiceType(type.id)}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedServiceType === type.id && styles.modalOptionTextSelected
                ]}>
                  {type.icon} {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Contador de resultados */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredServices.length} {filteredServices.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}
        </Text>
      </View>

      {/* Lista de serviços */}
      {filteredServices.length > 0 ? (
        <FlatList
          data={filteredServices}
          renderItem={renderServiceItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.servicesList}
          contentContainerStyle={styles.servicesListContent}
          showsVerticalScrollIndicator={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Nenhum serviço encontrado</Text>
          <Text style={styles.emptySubtext}>
            {services.length === 0 
              ? 'Não há serviços cadastrados no momento' 
              : 'Tente selecionar outro filtro'
            }
          </Text>
          {services.length > 0 && (
            <TouchableOpacity 
              style={styles.resetFilterButton}
              onPress={() => setSelectedServiceType(0)}
            >
              <Text style={styles.resetFilterButtonText}>Mostrar todos os serviços</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Botão Voltar */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Voltar ao Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  filterContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  combobox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginLeft: 10,
  },
  comboboxText: {
    fontSize: 16,
    color: '#333',
  },
  comboboxArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  modalOptionSelected: {
    backgroundColor: '#007AFF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  resultsContainer: {
    padding: 15,
    backgroundColor: '#E8F4FD',
  },
  resultsText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  servicesList: {
    flex: 1,
  },
  servicesListContent: {
    padding: 15,
  },
  serviceCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetFilterButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetFilterButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    margin: 20,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8E8E93',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  backButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
});