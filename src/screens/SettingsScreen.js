// src/screens/SettingsScreen.js
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
  Switch,
  Modal
} from 'react-native';
import DatabaseService from '../services/DatabaseService';

export default function SettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [configuracoes, setConfiguracoes] = useState({
    modoPrestador: false,
    usuarioAtivo: 'admin'
  });
  const [showChangeUser, setShowChangeUser] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadConfiguracoes();
  }, []);

  const loadConfiguracoes = async () => {
    setLoading(true);
    try {
      const config = await DatabaseService.getConfiguracoes();
      setConfiguracoes(config);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUser = async () => {
    if (!novoUsuario.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome de usuário');
      return;
    }

    if (novoUsuario.trim().length < 3) {
      Alert.alert('Erro', 'O usuário deve ter pelo menos 3 caracteres');
      return;
    }

    setLoading(true);

    try {
      await DatabaseService.alterarUsuario(novoUsuario.trim());
      Alert.alert('Sucesso', 'Usuário alterado com sucesso!');
      setShowChangeUser(false);
      setNovoUsuario('');
      await loadConfiguracoes(); // Recarrega as configurações
    } catch (error) {
      console.error('Erro ao alterar usuário:', error);
      Alert.alert('Erro', error.message || 'Não foi possível alterar o usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModoPrestador = async () => {
    setLoading(true);
    try {
      const novoModo = await DatabaseService.alternarModoPrestador();
      setConfiguracoes(prev => ({ ...prev, modoPrestador: novoModo }));
      
      Alert.alert(
        'Modo Alterado', 
        novoModo 
          ? 'Agora você está no modo Prestador de Serviço' 
          : 'Agora você está no modo Cliente'
      );
    } catch (error) {
      console.error('Erro ao alternar modo:', error);
      Alert.alert('Erro', 'Não foi possível alterar o modo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await DatabaseService.excluirConta();
      Alert.alert(
        'Conta Excluída', 
        'Sua conta foi excluída com sucesso. Você será redirecionado para o login.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      Alert.alert('Erro', 'Não foi possível excluir a conta');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Todos os seus dados pessoais serão perdidos, mas os serviços permanecerão.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => setShowDeleteConfirm(true)
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>Gerencie sua conta e preferências</Text>
      </View>

      {/* Informações da Conta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações da Conta</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Usuário Atual</Text>
          <Text style={styles.infoValue}>{configuracoes.usuarioAtivo}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Modo Atual</Text>
          <Text style={styles.infoValue}>
            {configuracoes.modoPrestador ? 'Prestador de Serviço' : 'Cliente'}
          </Text>
        </View>
      </View>

      {/* Alterar Usuário */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alterar Usuário</Text>
        <Text style={styles.sectionDescription}>
          Altere seu nome de usuário para um de sua preferência
        </Text>
        
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => setShowChangeUser(true)}
        >
          <Text style={styles.optionButtonText}>✏️ Alterar Nome de Usuário</Text>
        </TouchableOpacity>
      </View>

      {/* Modo Prestador de Serviço */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modo de Trabalho</Text>
        <Text style={styles.sectionDescription}>
          {configuracoes.modoPrestador 
            ? 'No modo Prestador, você pode oferecer seus serviços' 
            : 'No modo Cliente, você busca por serviços'
          }
        </Text>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>
            {configuracoes.modoPrestador ? '🔧 Modo Prestador' : '👤 Modo Cliente'}
          </Text>
          <Switch
            value={configuracoes.modoPrestador}
            onValueChange={handleToggleModoPrestador}
            trackColor={{ false: '#f0f0f0', true: '#007AFF' }}
            thumbColor={configuracoes.modoPrestador ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Gerenciar Conta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gerenciar Conta</Text>
        <Text style={styles.sectionDescription}>
          Ações importantes relacionadas à sua conta
        </Text>
        
        <TouchableOpacity 
          style={[styles.optionButton, styles.dangerButton]}
          onPress={confirmDeleteAccount}
        >
          <Text style={[styles.optionButtonText, styles.dangerButtonText]}>
            🗑️ Excluir Minha Conta
          </Text>
        </TouchableOpacity>
      </View>

      {/* Informações */}
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxText}>
          💡 Suas configurações são salvas automaticamente no dispositivo.
        </Text>
      </View>

      {/* Botão Voltar */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Voltar ao Menu</Text>
      </TouchableOpacity>

      {/* Modal Alterar Usuário */}
      <Modal
        visible={showChangeUser}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChangeUser(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar Usuário</Text>
            <Text style={styles.modalSubtitle}>
              Digite seu novo nome de usuário
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Novo usuário"
              value={novoUsuario}
              onChangeText={setNovoUsuario}
              autoCapitalize="none"
              placeholderTextColor="#999"
              autoFocus={true}
            />

            <Text style={styles.inputRules}>
              • Mínimo 3 caracteres{'\n'}
              • Não pode ser um usuário já existente
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowChangeUser(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleChangeUser}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Alterando...' : 'Alterar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <Modal
        visible={showDeleteConfirm}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.deleteModalContent]}>
            <Text style={styles.modalTitle}>🗑️ Confirmar Exclusão</Text>
            <Text style={styles.modalSubtitle}>
              Esta ação não pode ser desfeita. Todos os seus dados pessoais serão perdidos.
            </Text>

            <Text style={styles.warningText}>
              Você perderá:
              {'\n'}• Seu perfil
              {'\n'}• Suas configurações
              {'\n'}• Seu histórico
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                <Text style={styles.deleteButtonText}>
                  {loading ? 'Excluindo...' : 'Excluir Conta'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: '#FFF2F2',
    borderColor: '#FF3B30',
  },
  dangerButtonText: {
    color: '#FF3B30',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoBoxText: {
    color: '#007AFF',
    fontSize: 14,
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
  },
  deleteModalContent: {
    backgroundColor: '#FFF9F9',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginBottom: 12,
  },
  inputRules: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    lineHeight: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});