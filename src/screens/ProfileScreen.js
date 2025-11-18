// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Switch
} from 'react-native';
import DatabaseService from '../services/DatabaseService';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    cep: '',
    dataNascimento: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modoPrestador, setModoPrestador] = useState(false);
  const [servicosPrestador, setServicosPrestador] = useState([]);
  const [showServicoModal, setShowServicoModal] = useState(false);
  const [servicoEditando, setServicoEditando] = useState(null);
  const [novoServico, setNovoServico] = useState({
    nome: '',
    descricao: '',
    tipoServico: '1',
    valor: '',
    tempoEstimado: ''
  });

  const tiposServico = [
    { id: '1', nome: 'Eletricista', icon: '⚡' },
    { id: '2', nome: 'Encanador', icon: '🔧' },
    { id: '3', nome: 'Fotógrafo', icon: '📷' },
    { id: '4', nome: 'Pedreiro', icon: '🏗️' }
  ];

  useEffect(() => {
    loadProfileData();
    checkModoPrestador();
  }, []);

  useEffect(() => {
    if (modoPrestador) {
      loadServicosPrestador();
    }
  }, [modoPrestador]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const profileData = await DatabaseService.getPerfil();
      setProfile(profileData);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar o perfil');
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

  const loadServicosPrestador = async () => {
    try {
      const servicos = await DatabaseService.getServicosPrestador();
      setServicosPrestador(servicos);
    } catch (error) {
      console.error('Erro ao carregar serviços do prestador:', error);
    }
  };

  const handleSave = async () => {
    if (!profile.nome.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o nome');
      return;
    }

    if (!profile.email.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o email');
      return;
    }

    setSaving(true);
    
    try {
      await DatabaseService.savePerfil(profile);
      Alert.alert('Sucesso!', 'Perfil salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveServico = async () => {
    if (!novoServico.nome.trim() || !novoServico.descricao.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha nome e descrição do serviço');
      return;
    }

    setSaving(true);
    
    try {
      if (servicoEditando) {
        await DatabaseService.editarServicoPrestador(servicoEditando.id, novoServico);
        Alert.alert('Sucesso!', 'Serviço atualizado com sucesso!');
      } else {
        await DatabaseService.saveServicoPrestador(novoServico);
        Alert.alert('Sucesso!', 'Serviço cadastrado com sucesso!');
      }
      
      setShowServicoModal(false);
      setNovoServico({ nome: '', descricao: '', tipoServico: '1', valor: '', tempoEstimado: '' });
      setServicoEditando(null);
      await loadServicosPrestador();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      Alert.alert('Erro', 'Não foi possível salvar o serviço');
    } finally {
      setSaving(false);
    }
  };

  const handleEditarServico = (servico) => {
    setServicoEditando(servico);
    setNovoServico({
      nome: servico.nome,
      descricao: servico.descricao,
      tipoServico: servico.tipoServico,
      valor: servico.valor || '',
      tempoEstimado: servico.tempoEstimado || ''
    });
    setShowServicoModal(true);
  };

  const handleExcluirServico = (servico) => {
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
              await loadServicosPrestador();
            } catch (error) {
              console.error('Erro ao excluir serviço:', error);
              Alert.alert('Erro', 'Não foi possível excluir o serviço');
            }
          }
        }
      ]
    );
  };

  const updateField = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateServicoField = (field, value) => {
    setNovoServico(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTipoServicoNome = (tipoId) => {
    const tipo = tiposServico.find(t => t.id === tipoId);
    return tipo ? `${tipo.icon} ${tipo.nome}` : 'Serviço';
  };

  const renderServicoItem = ({ item }) => (
    <View style={styles.servicoCard}>
      <View style={styles.servicoHeader}>
        <Text style={styles.servicoNome}>{item.nome}</Text>
        <Text style={styles.servicoTipo}>{getTipoServicoNome(item.tipoServico)}</Text>
      </View>
      <Text style={styles.servicoDescricao}>{item.descricao}</Text>
      {(item.valor || item.tempoEstimado) && (
        <View style={styles.servicoDetalhes}>
          {item.valor && <Text style={styles.servicoValor}>💰 R$ {item.valor}</Text>}
          {item.tempoEstimado && <Text style={styles.servicoTempo}>⏱️ {item.tempoEstimado}</Text>}
        </View>
      )}
      <View style={styles.servicoActions}>
        <TouchableOpacity 
          style={styles.editarButton}
          onPress={() => handleEditarServico(item)}
        >
          <Text style={styles.editarButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.excluirButton}
          onPress={() => handleExcluirServico(item)}
        >
          <Text style={styles.excluirButtonText}>🗑️ Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Meu Perfil</Text>
          <Text style={styles.subtitle}>
            {modoPrestador ? '🔧 Perfil Prestador de Serviços' : '👤 Meus Dados Pessoais'}
          </Text>
        </View>

        <View style={styles.form}>
          {/* Dados Pessoais */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo *</Text>
              <TextInput
                style={styles.input}
                value={profile.nome}
                onChangeText={(value) => updateField('nome', value)}
                placeholder="Digite seu nome completo"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={profile.telefone}
                onChangeText={(value) => updateField('telefone', value)}
                placeholder="(11) 99999-9999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <TextInput
                style={styles.input}
                value={profile.dataNascimento}
                onChangeText={(value) => updateField('dataNascimento', value)}
                placeholder="DD/MM/AAAA"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CEP</Text>
              <TextInput
                style={styles.input}
                value={profile.cep}
                onChangeText={(value) => updateField('cep', value)}
                placeholder="00000-000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={styles.input}
                value={profile.cidade}
                onChangeText={(value) => updateField('cidade', value)}
                placeholder="Sua cidade"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Endereço</Text>
              <TextInput
                style={styles.input}
                value={profile.endereco}
                onChangeText={(value) => updateField('endereco', value)}
                placeholder="Seu endereço completo"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profile.bio}
                onChangeText={(value) => updateField('bio', value)}
                placeholder="Fale um pouco sobre você..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Seção de Serviços do Prestador */}
          {modoPrestador && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔧 Meus Serviços</Text>
              <Text style={styles.sectionDescription}>
                Gerencie os serviços que você oferece
              </Text>

              {servicosPrestador.length > 0 ? (
                <FlatList
                  data={servicosPrestador}
                  renderItem={renderServicoItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  style={styles.servicosList}
                />
              ) : (
                <View style={styles.emptyServicos}>
                  <Text style={styles.emptyServicosText}>
                    Você ainda não cadastrou nenhum serviço
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.addServicoButton}
                onPress={() => {
                  setServicoEditando(null);
                  setNovoServico({ nome: '', descricao: '', tipoServico: '1', valor: '', tempoEstimado: '' });
                  setShowServicoModal(true);
                }}
              >
                <Text style={styles.addServicoButtonText}>➕ Adicionar Serviço</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botão Salvar */}
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Perfil</Text>
            )}
          </TouchableOpacity>

          {/* Botão Voltar */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar ao Menu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para Cadastrar/Editar Serviço */}
      <Modal
        visible={showServicoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowServicoModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {servicoEditando ? 'Editar Serviço' : 'Cadastrar Serviço'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do serviço *"
              value={novoServico.nome}
              onChangeText={(value) => updateServicoField('nome', value)}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição do serviço *"
              value={novoServico.descricao}
              onChangeText={(value) => updateServicoField('descricao', value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Serviço</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.tiposContainer}
              >
                {tiposServico.map((tipo) => (
                  <TouchableOpacity
                    key={tipo.id}
                    style={[
                      styles.tipoButton,
                      novoServico.tipoServico === tipo.id && styles.tipoButtonActive
                    ]}
                    onPress={() => updateServicoField('tipoServico', tipo.id)}
                  >
                    <Text style={[
                      styles.tipoButtonText,
                      novoServico.tipoServico === tipo.id && styles.tipoButtonTextActive
                    ]}>
                      {tipo.icon} {tipo.nome}
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
                />
              </View>
              <View style={styles.halfInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Tempo estimado"
                  value={novoServico.tempoEstimado}
                  onChangeText={(value) => updateServicoField('tempoEstimado', value)}                 
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowServicoModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveServico}
                disabled={saving}
              >
                <Text style={styles.confirmButtonText}>
                  {saving ? 'Salvando...' : (servicoEditando ? 'Atualizar' : 'Cadastrar')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  form: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // Serviços do Prestador
  servicosList: {
    marginBottom: 16,
  },
  servicoCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  servicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  servicoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  servicoTipo: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  servicoDescricao: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  servicoDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  servicoValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  servicoTempo: {
    fontSize: 14,
    color: '#6c757d',
  },
  servicoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editarButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  editarButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  excluirButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 6,
  },
  excluirButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyServicos: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyServicosText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addServicoButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addServicoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
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
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
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