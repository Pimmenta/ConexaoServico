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
  Modal,
  TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DatabaseService from '../services/DatabaseService';

export default function ServicesScreen({ navigation }) {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [modoPrestador, setModoPrestador] = useState(false);
  const [meusServicos, setMeusServicos] = useState([]);
  const [showAddService, setShowAddService] = useState(false);
  const [novoServico, setNovoServico] = useState({
    nome: '',
    descricao: '',
    tipoServico: '1',
    valor: '',
    tempoEstimado: ''
  });
  
  const serviceTypes = [
    { id: 0, name: 'Todos os Serviços', icon: '🔍' },
    { id: 1, name: 'Eletricista', icon: '⚡' },
    { id: 2, name: 'Encanador', icon: '🔧' },
    { id: 3, name: 'Fotógrafo', icon: '📷' },
    { id: 4, name: 'Pedreiro', icon: '🏗️' }
  ];

  useEffect(() => {
    loadServices();
    checkModoPrestador();
  }, []);

  useEffect(() => {
    filterServices();
  }, [selectedServiceType, services]);

  useEffect(() => {
    if (modoPrestador) {
      loadMeusServicos();
    }
  }, [modoPrestador]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const servicesData = await DatabaseService.getServicos();
      setServices(servicesData);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      Alert.alert('Erro', 'Não foi possível carregar os serviços');
    } finally {
      setLoading(false);
    }
  };

  const checkModoPrestador = async () => {
    try {
      const isPrestador = await DatabaseService.isModoPrestador();
      setModoPrestador(isPrestador);
    } catch (error) {
      console.error('Erro ao verificar modo prestador:', error);
    }
  };

  const loadMeusServicos = async () => {
    try {
      const servicos = await DatabaseService.getServicosPrestador();
      setMeusServicos(servicos);
    } catch (error) {
      console.error('Erro ao carregar meus serviços:', error);
    }
  };

  const filterServices = async () => {
    try {
      const filtered = await DatabaseService.getServicos(
        selectedServiceType === 0 ? null : selectedServiceType
      );
      setFilteredServices(filtered);
    } catch (error) {
      console.error('Erro ao filtrar serviços:', error);
    }
  };

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

  const handleAddService = async () => {
    if (!novoServico.nome.trim() || !novoServico.descricao.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha nome e descrição do serviço');
      return;
    }

    setLoading(true);
    
    try {
      await DatabaseService.saveServicoPrestador(novoServico);
      Alert.alert('Sucesso!', 'Serviço cadastrado com sucesso!');
      setShowAddService(false);
      setNovoServico({ nome: '', descricao: '', tipoServico: '1', valor: '', tempoEstimado: '' });
      await loadMeusServicos();
    } catch (error) {
      console.error('Erro ao cadastrar serviço:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMyService = (servico) => {
    Alert.alert(
      'Excluir Serviço',
      `Tem certeza que deseja excluir o serviço "${servico.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.excluirServicoPrestador(servico.id);
              Alert.alert('Sucesso', 'Serviço excluído com sucesso!');
              await loadMeusServicos();
            } catch (error) {
              console.error('Erro ao excluir serviço:', error);
              Alert.alert('Erro', 'Não foi possível excluir o serviço');
            }
          }
        }
      ]
    );
  };

  const getServiceIcon = (tipoServico) => {
    const serviceType = serviceTypes.find(type => type.id === tipoServico);
    return serviceType ? serviceType.icon : '🔧';
  };

  const getServiceTypeName = (tipoServico) => {
    const serviceType = serviceTypes.find(type => type.id === tipoServico);
    return serviceType ? serviceType.name : 'Serviço';
  };

  const getSelectedTypeName = () => {
    const selectedType = serviceTypes.find(type => type.id === selectedServiceType);
    return selectedType ? selectedType.name : 'Todos os Serviços';
  };

  const getSelectedTypeIcon = () => {
    const selectedType = serviceTypes.find(type => type.id === selectedServiceType);
    return selectedType ? selectedType.icon : '🔍';
  };

  const handleServiceTypeSelect = (value) => {
    setSelectedServiceType(parseInt(value));
    setShowPicker(false);
  };

  const updateServicoField = (field, value) => {
    setNovoServico(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Renderizar item da lista de serviços disponíveis
  const renderServiceItem = ({ item }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceIcon}>{getServiceIcon(item.tipoServico)}</Text>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.nome}</Text>
          <Text style={styles.serviceType}>{getServiceTypeName(item.tipoServico)}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐ {item.avaliacao}</Text>
        </View>
      </View>
      
      <Text style={styles.serviceDescription}>{item.informacoes}</Text>
      
      <TouchableOpacity 
        style={styles.contactButton}
        onPress={() => openWhatsApp(item.telefone, item.nome)}
      >
        <Text style={styles.contactButtonText}>💬 Agendar via WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );

  // Renderizar item da lista dos meus serviços (modo prestador)
  const renderMyServiceItem = ({ item }) => (
    <View style={[styles.serviceCard, styles.myServiceCard]}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceIcon}>{getServiceIcon(parseInt(item.tipoServico))}</Text>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.nome}</Text>
          <Text style={styles.serviceType}>{getServiceTypeName(parseInt(item.tipoServico))}</Text>
        </View>
        <View style={styles.myServiceBadge}>
          <Text style={styles.myServiceBadgeText}>MEU SERVIÇO</Text>
        </View>
      </View>
      
      <Text style={styles.serviceDescription}>{item.descricao}</Text>
      
      {(item.valor || item.tempoEstimado) && (
        <View style={styles.serviceDetails}>
          {item.valor && <Text style={styles.serviceValue}>💰 R$ {item.valor}</Text>}
          {item.tempoEstimado && <Text style={styles.serviceTime}>⏱️ {item.tempoEstimado}</Text>}
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteMyService(item)}
      >
        <Text style={styles.deleteButtonText}>🗑️ Remover Serviço</Text>
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
        <Text style={styles.title}>
          {modoPrestador ? '🔧 Meus Serviços' : 'Serviços Disponíveis'}
        </Text>
        <Text style={styles.subtitle}>
          {modoPrestador 
            ? 'Gerencie os serviços que você oferece' 
            : 'Encontre os melhores profissionais'
          }
        </Text>
      </View>

      {/* Seção Meus Serviços (Modo Prestador) */}
      {modoPrestador && (
        <View style={styles.myServicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Meus Serviços Cadastrados</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddService(true)}
            >
              <Text style={styles.addButtonText}>➕ Novo</Text>
            </TouchableOpacity>
          </View>

          {meusServicos.length > 0 ? (
            <FlatList
              data={meusServicos}
              renderItem={renderMyServiceItem}
              keyExtractor={(item, index) => `my-${item.id}-${index}`}
              scrollEnabled={false}
              style={styles.myServicesList}
            />
          ) : (
            <View style={styles.emptyMyServices}>
              <Text style={styles.emptyIcon}>🔧</Text>
              <Text style={styles.emptyText}>Você ainda não cadastrou serviços</Text>
              <Text style={styles.emptySubtext}>
                Clique em "Novo" para começar a oferecer seus serviços
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Seção Buscar Serviços */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>
          {modoPrestador ? '👥 Serviços de Outros Prestadores' : '🔍 Buscar Serviços'}
        </Text>

        {/* Seletor de Tipo de Serviço */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Filtrar por tipo de serviço:</Text>
          
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.selectorButtonIcon}>{getSelectedTypeIcon()}</Text>
            <Text style={styles.selectorButtonText}>{getSelectedTypeName()}</Text>
            <Text style={styles.selectorButtonArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Contador de resultados */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {filteredServices.length} {filteredServices.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}
            {selectedServiceType !== 0 && ` em ${getSelectedTypeName()}`}
          </Text>
        </View>

        {/* Lista de serviços disponíveis */}
        {filteredServices.length > 0 ? (
          <FlatList
            data={filteredServices}
            renderItem={renderServiceItem}
            keyExtractor={(item, index) => `available-${index}`}
            style={styles.servicesList}
            contentContainerStyle={styles.servicesListContent}
            showsVerticalScrollIndicator={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Nenhum serviço encontrado</Text>
            <Text style={styles.emptySubtext}>
              {selectedServiceType !== 0 
                ? `Tente selecionar "Todos os Serviços" ou verifique mais tarde`
                : 'Verifique mais tarde ou tente outro filtro'
              }
            </Text>
          </View>
        )}
      </View>

      {/* Botão Voltar */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Voltar ao Menu</Text>
      </TouchableOpacity>

      {/* Modal Picker */}
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o tipo de serviço</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Picker
              selectedValue={selectedServiceType.toString()}
              onValueChange={handleServiceTypeSelect}
              style={styles.picker}
            >
              {serviceTypes.map((type) => (
                <Picker.Item 
                  key={type.id}
                  label={`${type.icon} ${type.name}`}
                  value={type.id.toString()}
                />
              ))}
            </Picker>
            
            <TouchableOpacity 
              style={styles.modalConfirmButton}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.modalConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Adicionar Serviço (Modo Prestador) */}
      <Modal
        visible={showAddService}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddService(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cadastrar Novo Serviço</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowAddService(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Nome do serviço *"
                value={novoServico.nome}
                onChangeText={(value) => updateServicoField('nome', value)}
                placeholderTextColor="#999"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descrição do serviço *"
                value={novoServico.descricao}
                onChangeText={(value) => updateServicoField('descricao', value)}
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Serviço</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.tiposContainer}
                >
                  {serviceTypes.filter(t => t.id !== 0).map((tipo) => (
                    <TouchableOpacity
                      key={tipo.id}
                      style={[
                        styles.tipoButton,
                        novoServico.tipoServico === tipo.id.toString() && styles.tipoButtonActive
                      ]}
                      onPress={() => updateServicoField('tipoServico', tipo.id.toString())}
                    >
                      <Text style={[
                        styles.tipoButtonText,
                        novoServico.tipoServico === tipo.id.toString() && styles.tipoButtonTextActive
                      ]}>
                        {tipo.icon} {tipo.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Valor (opcional)"
                    value={novoServico.valor}
                    onChangeText={(value) => updateServicoField('valor', value)}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Tempo estimado"
                    value={novoServico.tempoEstimado}
                    onChangeText={(value) => updateServicoField('tempoEstimado', value)}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddService(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleAddService}
                  disabled={loading}
                >
                  <Text style={styles.confirmButtonText}>
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  // Seção Meus Serviços
  myServicesSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  myServicesList: {
    marginBottom: 0,
  },
  myServiceCard: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
  },
  myServiceBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  myServiceBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  serviceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  serviceTime: {
    fontSize: 14,
    color: '#6c757d',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyMyServices: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  // Seção Buscar Serviços
  searchSection: {
    flex: 1,
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorContainer: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectorButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  selectorButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectorButtonArrow: {
    fontSize: 12,
    color: '#666',
  },
  resultsContainer: {
    padding: 12,
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    marginBottom: 16,
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
    paddingBottom: 10,
  },
  serviceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 12,
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
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: '#25D366',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalScroll: {
    padding: 20,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  tiposContainer: {
    flexDirection: 'row',
  },
  tipoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tipoButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tipoButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tipoButtonTextActive: {
    color: 'white',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    marginHorizontal: 10,
  },
  modalConfirmButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});