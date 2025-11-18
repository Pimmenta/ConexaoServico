// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView
} from 'react-native';
import DatabaseService from '../services/DatabaseService';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('admin'); // Valor inicial
  const [password, setPassword] = useState('admin'); // Valor inicial
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validação básica
    if (!username || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const usuario = await DatabaseService.verificarLogin(username, password);
      
      if (usuario) {
        console.log('Login bem-sucedido:', { username });
        
        // Se for primeiro login, mostrar modal para alterar senha
        if (usuario.primeiro_login === 1 && username === 'admin') {
          setShowChangePassword(true);
        } else {
          // Login normal, navegar para o menu
          navigation.navigate('Menu');
        }
      } else {
        Alert.alert('Erro', 'Usuário ou senha incorretos');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', 'Não foi possível fazer login');
    } finally {
      setLoading(false);
    }
  };

  const validarSenha = (senha) => {
    // Mínimo 5 caracteres, pelo menos 1 letra e 1 número
    const regex = /^(?=.*[A-Za-z])(?=.*\d).{5,}$/;
    return regex.test(senha);
  };

  const handleChangePassword = async () => {
    // Validações da nova senha
    if (!novaSenha || !confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (!validarSenha(novaSenha)) {
      Alert.alert(
        'Senha inválida', 
        'A senha deve ter no mínimo 5 caracteres, incluindo letras e números'
      );
      return;
    }

    setLoading(true);

    try {
      const sucesso = await DatabaseService.alterarSenha(username, novaSenha);
      
      if (sucesso) {
        Alert.alert('Sucesso', 'Senha alterada com sucesso!');
        setShowChangePassword(false);
        setNovaSenha('');
        setConfirmarSenha('');
        navigation.navigate('Menu');
      } else {
        Alert.alert('Erro', 'Não foi possível alterar a senha');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      Alert.alert('Erro', 'Não foi possível alterar a senha');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    Alert.alert(
      'Redefinir Senha',
      'Deseja redefinir a senha para "admin"?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Redefinir', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const sucesso = await DatabaseService.redefinirSenhaAdmin();
              if (sucesso) {
                Alert.alert('Sucesso', 'Senha redefinida para "admin"');
                setPassword('admin'); // Atualiza o estado
              } else {
                Alert.alert('Erro', 'Não foi possível redefinir a senha');
              }
            } catch (error) {
              console.error('Erro ao redefinir senha:', error);
              Alert.alert('Erro', 'Não foi possível redefinir a senha');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>CS</Text>
          <Text style={styles.appName}>Conexão Serviço</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Login</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Usuário"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
          
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={handleResetPassword}
          >
            <Text style={styles.forgotPasswordText}>Redefinir senha para padrão</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Use: admin / admin para primeiro acesso
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal para alterar senha */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar Senha</Text>
            <Text style={styles.modalSubtitle}>
              Por segurança, altere sua senha padrão
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nova senha"
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmar nova senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
              placeholderTextColor="#999"
            />

            <Text style={styles.passwordRules}>
              • Mínimo 5 caracteres{'\n'}
              • Letras e números
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowChangePassword(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleChangePassword}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  infoBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    color: '#007AFF',
    fontSize: 14,
    textAlign: 'center',
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  passwordRules: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    lineHeight: 16,
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
});