// src/screens/ContactScreen.js
import React, { useState } from 'react';
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
  Linking
} from 'react-native';

export default function ContactScreen({ navigation }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: '',
  });
  const [sending, setSending] = useState(false);


  const COMPANY_PHONE = '55169981565364'; 

  const updateField = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para enviar mensagem via WhatsApp
  const sendViaWhatsApp = async () => {
    if (!form.nome.trim() || !form.mensagem.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha pelo menos o nome e a mensagem.');
      return;
    }

    setSending(true);

    try {

      let whatsappMessage = `*Nova mensagem do app Conexão Serviço*%0A%0A`;
      
      if (form.nome) {
        whatsappMessage += `*Nome:* ${form.nome}%0A`;
      }
      
      if (form.email) {
        whatsappMessage += `*Email:* ${form.email}%0A`;
      }
      
      if (form.assunto) {
        whatsappMessage += `*Assunto:* ${form.assunto}%0A`;
      }
      
      if (form.mensagem) {
        whatsappMessage += `%0A*Mensagem:*%0A${form.mensagem}%0A`;
      }

      whatsappMessage += `%0A_Enviado via App Conexão Serviço_`;

      // Cria a URL do WhatsApp
      const whatsappUrl = `https://wa.me/${COMPANY_PHONE}?text=${whatsappMessage}`;

      console.log('URL do WhatsApp:', whatsappUrl);

 
      const supported = await Linking.canOpenURL(whatsappUrl);
      
      if (supported) {
       
        await Linking.openURL(whatsappUrl);
                
        setTimeout(() => {
          setForm({ nome: '', email: '', assunto: '', mensagem: '' });
        }, 1000);
        
      } else {
        Alert.alert('Erro', 'WhatsApp não está instalado no dispositivo');
      }

    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    } finally {
      setSending(false);
    }
  };

  const openWhatsAppChat = async () => {
    try {
      const whatsappUrl = `https://wa.me/${COMPANY_PHONE}`;
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

  const useQuickMessage = (type) => {
    const quickMessages = {
      duvida: 'Olá! Gostaria de tirar uma dúvida sobre os serviços.',
      orcamento: 'Olá! Gostaria de solicitar um orçamento.',
      suporte: 'Olá! Preciso de suporte técnico.',
      geral: 'Olá! Gostaria de mais informações.'
    };

    setForm(prev => ({
      ...prev,
      mensagem: quickMessages[type] || quickMessages.geral
    }));
  };

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
          <Text style={styles.title}>Fale Conosco</Text>
          <Text style={styles.subtitle}>Envie uma mensagem via WhatsApp</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              value={form.nome}
              onChangeText={(value) => updateField('nome', value)}
              placeholder="Digite seu nome completo"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assunto</Text>
            <TextInput
              style={styles.input}
              value={form.assunto}
              onChangeText={(value) => updateField('assunto', value)}
              placeholder="Motivo do contato"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mensagem *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.mensagem}
              onChangeText={(value) => updateField('mensagem', value)}
              placeholder="Escreva sua mensagem aqui..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Mensagens Rápidas */}
          <View style={styles.quickMessagesContainer}>
            <Text style={styles.quickMessagesTitle}>Mensagens Rápidas:</Text>
            <View style={styles.quickMessagesButtons}>
              <TouchableOpacity 
                style={styles.quickMessageButton}
                onPress={() => useQuickMessage('duvida')}
              >
                <Text style={styles.quickMessageText}>❓ Dúvida</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickMessageButton}
                onPress={() => useQuickMessage('orcamento')}
              >
                <Text style={styles.quickMessageText}>💰 Orçamento</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickMessageButton}
                onPress={() => useQuickMessage('suporte')}
              >
                <Text style={styles.quickMessageText}>🔧 Suporte</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão Principal - Enviar via WhatsApp */}
          <TouchableOpacity
            style={[styles.whatsappButton, sending && styles.buttonDisabled]}
            onPress={sendViaWhatsApp}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.whatsappButtonText}>💬 Enviar via WhatsApp</Text>
            )}
          </TouchableOpacity>

          {/* Botão Secundário - Apenas Abrir Chat */}
          <TouchableOpacity
            style={styles.chatButton}
            onPress={openWhatsAppChat}
          >
            <Text style={styles.chatButtonText}>Abrir Conversa no WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar ao Menu</Text>
          </TouchableOpacity>

          {/* Informações */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Sua mensagem será enviada diretamente para nosso WhatsApp. 
              Certifique-se de ter o WhatsApp instalado no seu dispositivo.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    minHeight: 120,
  },
  // Mensagens Rápidas
  quickMessagesContainer: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#25D366',
  },
  quickMessagesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  quickMessagesButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickMessageButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#25D366',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickMessageText: {
    color: '#25D366',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Botões WhatsApp
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatButton: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#25D366',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
  },
  chatButtonText: {
    color: '#25D366',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  backButton: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8E8E93',
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
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
    lineHeight: 20,
  },
});