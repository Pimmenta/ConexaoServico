// src/services/XMLStorageService.js
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import xml2js from 'react-native-xml2js';

class XMLStorageService {
  constructor() {
    this.storageKey = 'perfil_usuario_xml';
    this.isWeb = Platform.OS === 'web';
  }

  // Verifica se estamos no ambiente web
  isWebEnvironment() {
    return this.isWeb;
  }

  // Para web: usa AsyncStorage
  async fileExistsWeb() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data !== null;
    } catch (error) {
      console.error('Erro ao verificar arquivo no web:', error);
      return false;
    }
  }

  // Para mobile: usa expo-file-system (mantido para referência futura)
  async fileExistsMobile() {
    if (this.isWeb) return this.fileExistsWeb();
    
    // No mobile, você pode implementar com expo-file-system posteriormente
    // Por enquanto, vamos usar AsyncStorage para ambos
    return this.fileExistsWeb();
  }

  // Cria um XML padrão para o perfil
  createDefaultProfile() {
    const profileData = {
      perfil: {
        nome: [''],
        email: [''],
        telefone: [''],
        endereco: [''],
        cidade: [''],
        cep: [''],
        dataNascimento: [''],
        bio: ['']
      }
    };

    const builder = new xml2js.Builder();
    return builder.buildObject(profileData);
  }

  // Salva os dados no XML (usando AsyncStorage para web e mobile)
  async saveProfile(profileData) {
    try {
      const xmlData = {
        perfil: {
          nome: [profileData.nome || ''],
          email: [profileData.email || ''],
          telefone: [profileData.telefone || ''],
          endereco: [profileData.endereco || ''],
          cidade: [profileData.cidade || ''],
          cep: [profileData.cep || ''],
          dataNascimento: [profileData.dataNascimento || ''],
          bio: [profileData.bio || '']
        }
      };

      const builder = new xml2js.Builder();
      const xml = builder.buildObject(xmlData);

      // Salva no AsyncStorage (funciona em web e mobile)
      await AsyncStorage.setItem(this.storageKey, xml);
      
      console.log('Perfil salvo com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      return false;
    }
  }

  // Carrega os dados do XML
  async loadProfile() {
    try {
      const fileExists = await this.fileExistsWeb();
      
      if (!fileExists) {
        console.log('Arquivo não existe, criando novo...');
        // Se o arquivo não existe, cria um com dados padrão
        const defaultXml = this.createDefaultProfile();
        await AsyncStorage.setItem(this.storageKey, defaultXml);
        return await this.parseProfileData(defaultXml);
      }

      const xmlContent = await AsyncStorage.getItem(this.storageKey);
      
      if (xmlContent) {
        console.log('XML carregado com sucesso');
        return await this.parseProfileData(xmlContent);
      } else {
        return this.getEmptyProfile();
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      return this.getEmptyProfile();
    }
  }

  // Parse do XML para objeto JavaScript
  async parseProfileData(xmlContent) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xmlContent, (err, result) => {
        if (err) {
          console.error('Erro no parse XML:', err);
          // Se der erro no parse, retorna perfil vazio
          resolve(this.getEmptyProfile());
          return;
        }

        if (result && result.perfil) {
          const profile = result.perfil;
          const profileData = {
            nome: profile.nome && profile.nome[0] ? profile.nome[0] : '',
            email: profile.email && profile.email[0] ? profile.email[0] : '',
            telefone: profile.telefone && profile.telefone[0] ? profile.telefone[0] : '',
            endereco: profile.endereco && profile.endereco[0] ? profile.endereco[0] : '',
            cidade: profile.cidade && profile.cidade[0] ? profile.cidade[0] : '',
            cep: profile.cep && profile.cep[0] ? profile.cep[0] : '',
            dataNascimento: profile.dataNascimento && profile.dataNascimento[0] ? profile.dataNascimento[0] : '',
            bio: profile.bio && profile.bio[0] ? profile.bio[0] : ''
          };
          resolve(profileData);
        } else {
          resolve(this.getEmptyProfile());
        }
      });
    });
  }

  getEmptyProfile() {
    return {
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      cep: '',
      dataNascimento: '',
      bio: ''
    };
  }

  // Deleta o perfil (opcional)
  async deleteProfile() {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      console.log('Perfil deletado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      return false;
    }
  }

  // Obtém informações do storage
  getStorageInfo() {
    return {
      isWeb: this.isWeb,
      storageType: 'AsyncStorage',
      key: this.storageKey
    };
  }
}

export default new XMLStorageService();