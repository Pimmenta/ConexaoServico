// src/services/XMLStorageService.js
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import xml2js from 'react-native-xml2js';

class XMLStorageService {
  constructor() {
    this.profileStorageKey = 'perfil_usuario_xml';
    this.servicesStorageKey = 'servicos_prestadores_xml';
    this.isWeb = Platform.OS === 'web';
  }

  // ========== MÉTODOS PARA PERFIL ==========
  
 async profileFileExists() {
    try {
      const data = await AsyncStorage.getItem(this.profileStorageKey);
      return data !== null;
    } catch (error) {
      console.error('Erro ao verificar arquivo de perfil:', error);
      return false;
    }
  }

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

      await AsyncStorage.setItem(this.profileStorageKey, xml);
      console.log('Perfil salvo com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      return false;
    }
  }

  async loadProfile() {
    try {
      const fileExists = await this.profileFileExists();
      
      if (!fileExists) {
        console.log('Arquivo de perfil não existe, criando novo...');
        const defaultXml = this.createDefaultProfile();
        await AsyncStorage.setItem(this.profileStorageKey, defaultXml);
        return await this.parseProfileData(defaultXml);
      }

      const xmlContent = await AsyncStorage.getItem(this.profileStorageKey);
      
      if (xmlContent) {
        console.log('Perfil carregado com sucesso');
        return await this.parseProfileData(xmlContent);
      } else {
        return this.getEmptyProfile();
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      return this.getEmptyProfile();
    }
  }

  async parseProfileData(xmlContent) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xmlContent, (err, result) => {
        if (err) {
          console.error('Erro no parse XML do perfil:', err);
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

  // ========== MÉTODOS PARA SERVIÇOS ==========

  async servicesFileExists() {
    try {
      const data = await AsyncStorage.getItem(this.servicesStorageKey);
      return data !== null;
    } catch (error) {
      console.error('Erro ao verificar arquivo de serviços:', error);
      return false;
    }
  }

  createDefaultServices() {
    const servicesData = {
      servicos: {
        prestador: [
          {
            nome: ['João Silva - Eletricista'],
            avaliacao: ['4.8'],
            informacoes: ['Especialista em instalações residenciais e comerciais. 10 anos de experiência.'],
            tipoServico: ['1'],
            telefone: ['5511999999991']
          },
          {
            nome: ['Maria Santos - Encanadora'],
            avaliacao: ['4.9'],
            informacoes: ['Resolve vazamentos e instalações hidráulicas. Atendimento rápido.'],
            tipoServico: ['2'],
            telefone: ['5511999999992']
          },
          {
            nome: ['Carlos Oliveira - Fotógrafo'],
            avaliacao: ['4.7'],
            informacoes: ['Fotografia de eventos, ensaios e produtos. Equipamento profissional.'],
            tipoServico: ['3'],
            telefone: ['5511999999993']
          },
          {
            nome: ['Pedro Costa - Pedreiro'],
            avaliacao: ['4.6'],
            informacoes: ['Construção, reformas e acabamentos. Trabalho garantido.'],
            tipoServico: ['4'],
            telefone: ['5511999999994']
          },
          {
            nome: ['Ana Pereira - Eletricista'],
            avaliacao: ['4.5'],
            informacoes: ['Instalações elétricas prediais. Orçamento sem compromisso.'],
            tipoServico: ['1'],
            telefone: ['5511999999995']
          }
        ]
      }
    };

    const builder = new xml2js.Builder();
    return builder.buildObject(servicesData);
  }

  async saveServices(servicesData) {
    try {
      const xmlData = {
        servicos: {
          prestador: servicesData.map(service => ({
            nome: [service.nome || ''],
            avaliacao: [service.avaliacao || ''],
            informacoes: [service.informacoes || ''],
            tipoServico: [service.tipoServico?.toString() || ''],
            telefone: [service.telefone || '']
          }))
        }
      };

      const builder = new xml2js.Builder();
      const xml = builder.buildObject(xmlData);

      await AsyncStorage.setItem(this.servicesStorageKey, xml);
      console.log('Serviços salvos com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar serviços:', error);
      return false;
    }
  }

  async loadServices() {
    try {
      const fileExists = await this.servicesFileExists();
      
      if (!fileExists) {
        console.log('Arquivo de serviços não existe, criando novo...');
        const defaultXml = this.createDefaultServices();
        await AsyncStorage.setItem(this.servicesStorageKey, defaultXml);
        return await this.parseServicesData(defaultXml);
      }

      const xmlContent = await AsyncStorage.getItem(this.servicesStorageKey);
      
      if (xmlContent) {
        console.log('Serviços carregados com sucesso');
        return await this.parseServicesData(xmlContent);
      } else {
        return this.getEmptyServices();
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      return this.getEmptyServices();
    }
  }

  async parseServicesData(xmlContent) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xmlContent, (err, result) => {
        if (err) {
          console.error('Erro no parse XML de serviços:', err);
          resolve(this.getEmptyServices());
          return;
        }

        if (result && result.servicos && result.servicos.prestador) {
          const services = result.servicos.prestador.map(prestador => ({
            nome: prestador.nome && prestador.nome[0] ? prestador.nome[0] : '',
            avaliacao: prestador.avaliacao && prestador.avaliacao[0] ? prestador.avaliacao[0] : '',
            informacoes: prestador.informacoes && prestador.informacoes[0] ? prestador.informacoes[0] : '',
            tipoServico: prestador.tipoServico && prestador.tipoServico[0] ? parseInt(prestador.tipoServico[0]) : 0,
            telefone: prestador.telefone && prestador.telefone[0] ? prestador.telefone[0] : ''
          }));
          resolve(services);
        } else {
          resolve(this.getEmptyServices());
        }
      });
    });
  }

  getEmptyServices() {
    return [];
  }

  async deleteServices() {
    try {
      await AsyncStorage.removeItem(this.servicesStorageKey);
      console.log('Serviços deletados com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar serviços:', error);
      return false;
    }
  }

  getStorageInfo() {
    return {
      isWeb: this.isWeb,
      storageType: 'AsyncStorage',
      profileKey: this.profileStorageKey,
      servicesKey: this.servicesStorageKey
    };
  }
}

export default new XMLStorageService();