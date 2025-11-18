// src/services/DatabaseService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DatabaseService = {
  // ========== INICIALIZAÇÃO ==========
  init: async () => {
    console.log('Inicializando banco de dados (AsyncStorage)...');
    
    try {
      // Verifica se já existe usuário admin, se não, cria
      const usuarios = await DatabaseService._getUsuarios();
      if (usuarios.length === 0) {
        await DatabaseService._criarUsuarioAdmin();
      }
      
      // Verifica se já existe perfil, se não, cria vazio
      const perfil = await DatabaseService._getPerfil();
      if (!perfil.nome && !perfil.email) {
        await DatabaseService._criarPerfilVazio();
      }
      
      // Verifica se já existem serviços, se não, cria os padrão
      const servicos = await DatabaseService._getServicos();
      if (servicos.length === 0) {
        await DatabaseService._criarServicosPadrao();
      }
      
      console.log('Banco de dados inicializado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar banco:', error);
      throw error;
    }
  },

  // ========== MÉTODOS PRIVADOS (auxiliares) ==========
  _getUsuarios: async () => {
    try {
      const usuariosJSON = await AsyncStorage.getItem('usuarios');
      return usuariosJSON ? JSON.parse(usuariosJSON) : [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  _saveUsuarios: async (usuarios) => {
    try {
      await AsyncStorage.setItem('usuarios', JSON.stringify(usuarios));
      return true;
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
      throw error;
    }
  },

  _criarUsuarioAdmin: async () => {
    const usuarios = [{
      id: 1,
      username: 'admin',
      password: 'admin',
      primeiro_login: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];
    await AsyncStorage.setItem('usuarios', JSON.stringify(usuarios));
    console.log('Usuário admin criado com senha padrão');
  },

  _getPerfil: async () => {
    try {
      const perfilJSON = await AsyncStorage.getItem('perfil');
      return perfilJSON ? JSON.parse(perfilJSON) : {};
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return {};
    }
  },

  _criarPerfilVazio: async () => {
    const perfilVazio = {
      id: 1,
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      cep: '',
      dataNascimento: '',
      bio: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await AsyncStorage.setItem('perfil', JSON.stringify(perfilVazio));
    console.log('Perfil vazio criado');
  },

  _getServicos: async () => {
    try {
      const servicosJSON = await AsyncStorage.getItem('servicos');
      return servicosJSON ? JSON.parse(servicosJSON) : [];
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
  },

  _criarServicosPadrao: async () => {
    const servicosPadrao = [
      {
        id: 1,
        nome: 'João Silva - Eletricista',
        avaliacao: 4.8,
        informacoes: 'Especialista em instalações residenciais e comerciais. 10 anos de experiência.',
        tipoServico: 1,
        telefone: '5511999999991',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        nome: 'Maria Santos - Encanadora',
        avaliacao: 4.9,
        informacoes: 'Resolve vazamentos e instalações hidráulicas. Atendimento rápido.',
        tipoServico: 2,
        telefone: '5511999999992',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        nome: 'Carlos Oliveira - Fotógrafo',
        avaliacao: 4.7,
        informacoes: 'Fotografia de eventos, ensaios e produtos. Equipamento profissional.',
        tipoServico: 3,
        telefone: '5511999999993',
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        nome: 'Pedro Costa - Pedreiro',
        avaliacao: 4.6,
        informacoes: 'Construção, reformas e acabamentos. Trabalho garantido.',
        tipoServico: 4,
        telefone: '5511999999994',
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        nome: 'Ana Pereira - Eletricista',
        avaliacao: 4.5,
        informacoes: 'Instalações elétricas prediais. Orçamento sem compromisso.',
        tipoServico: 1,
        telefone: '5511999999995',
        created_at: new Date().toISOString()
      },
      {
        id: 6,
        nome: 'Roberto Alves - Encanador',
        avaliacao: 4.4,
        informacoes: 'Especialista em sistemas de água e gás. Atendimento 24h para emergências.',
        tipoServico: 2,
        telefone: '5511999999996',
        created_at: new Date().toISOString()
      }
    ];
    await AsyncStorage.setItem('servicos', JSON.stringify(servicosPadrao));
    console.log('Serviços padrão criados');
  },

  // ========== MÉTODOS PÚBLICOS PARA USUÁRIOS/LOGIN ==========
  verificarLogin: async (username, password) => {
    try {
      const usuarios = await DatabaseService._getUsuarios();
      const usuario = usuarios.find(u => u.username === username && u.password === password);
      
      if (usuario) {
        console.log('Usuário encontrado:', usuario.username);
        return usuario;
      } else {
        console.log('Usuário ou senha incorretos');
        return null;
      }
    } catch (error) {
      console.error('Erro ao verificar login:', error);
      throw error;
    }
  },

  alterarSenha: async (username, novaSenha) => {
    try {
      const usuarios = await DatabaseService._getUsuarios();
      const usuarioIndex = usuarios.findIndex(u => u.username === username);
      
      if (usuarioIndex !== -1) {
        usuarios[usuarioIndex].password = novaSenha;
        usuarios[usuarioIndex].primeiro_login = 0;
        usuarios[usuarioIndex].updated_at = new Date().toISOString();
        
        await DatabaseService._saveUsuarios(usuarios);
        console.log('Senha alterada com sucesso para:', username);
        return true;
      }
      
      console.log('Usuário não encontrado:', username);
      return false;
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  },

  redefinirSenhaAdmin: async () => {
    try {
      const usuarios = await DatabaseService._getUsuarios();
      const usuarioIndex = usuarios.findIndex(u => u.username === 'admin');
      
      if (usuarioIndex !== -1) {
        usuarios[usuarioIndex].password = 'admin';
        usuarios[usuarioIndex].primeiro_login = 1;
        usuarios[usuarioIndex].updated_at = new Date().toISOString();
        
        await DatabaseService._saveUsuarios(usuarios);
        console.log('Senha do admin redefinida para padrão');
        return true;
      }
      
      console.log('Usuário admin não encontrado');
      return false;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  },

  // ========== MÉTODOS PÚBLICOS PARA PERFIL ==========
  getPerfil: async () => {
    try {
      const perfil = await DatabaseService._getPerfil();
      
      // Se não existe perfil, cria um vazio
      if (!perfil.id) {
        await DatabaseService._criarPerfilVazio();
        return await DatabaseService._getPerfil();
      }
      
      console.log('Perfil carregado com sucesso');
      return perfil;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  },

  savePerfil: async (perfilData) => {
    try {
      const perfilExistente = await DatabaseService._getPerfil();
      
      const perfilAtualizado = {
        ...perfilExistente,
        ...perfilData,
        updated_at: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('perfil', JSON.stringify(perfilAtualizado));
      console.log('Perfil salvo com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      throw error;
    }
  },

  // ========== MÉTODOS PÚBLICOS PARA SERVIÇOS ==========
  getServicos: async (tipoServico = null) => {
    try {
      let servicos = await DatabaseService._getServicos();
      
      // Se não existem serviços, cria os padrão
      if (servicos.length === 0) {
        await DatabaseService._criarServicosPadrao();
        servicos = await DatabaseService._getServicos();
      }
      
      // Filtra por tipo se especificado
      if (tipoServico && tipoServico !== 0) {
        servicos = servicos.filter(s => s.tipoServico === tipoServico);
      }
      
      // Ordena por avaliação (decrescente) e nome (crescente)
      servicos.sort((a, b) => {
        if (b.avaliacao !== a.avaliacao) {
          return b.avaliacao - a.avaliacao;
        }
        return a.nome.localeCompare(b.nome);
      });
      
      console.log(`Carregados ${servicos.length} serviços`);
      return servicos;
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      throw error;
    }
  },

  // ========== MÉTODOS UTILITÁRIOS ==========
  clearDatabase: async () => {
    try {
      await AsyncStorage.multiRemove(['usuarios', 'perfil', 'servicos']);
      console.log('Banco de dados limpo com sucesso!');
      
      // Recria os dados padrão
      await DatabaseService.init();
      return true;
    } catch (error) {
      console.error('Erro ao limpar banco:', error);
      throw error;
    }
  },

  getDatabaseInfo: async () => {
    try {
      const usuarios = await DatabaseService._getUsuarios();
      const perfil = await DatabaseService._getPerfil();
      const servicos = await DatabaseService._getServicos();
      
      return {
        usuarios_count: usuarios.length,
        perfil_count: perfil.id ? 1 : 0,
        servicos_count: servicos.length,
        storage_type: 'AsyncStorage'
      };
    } catch (error) {
      console.error('Erro ao buscar informações do banco:', error);
      throw error;
    }
  },

  // ========== MÉTODO PARA DEBUG ==========
  debugDatabase: async () => {
    try {
      const usuarios = await DatabaseService._getUsuarios();
      const perfil = await DatabaseService._getPerfil();
      const servicos = await DatabaseService._getServicos();
      
      console.log('=== DEBUG DATABASE ===');
      console.log('Usuários:', usuarios);
      console.log('Perfil:', perfil);
      console.log('Serviços:', servicos);
      console.log('=====================');
      
      return { usuarios, perfil, servicos };
    } catch (error) {
      console.error('Erro no debug:', error);
      throw error;
    }
   },

    // ========== MÉTODOS PARA CONFIGURAÇÕES ==========
  getConfiguracoes: async () => {
    try {
        const configuracoesJSON = await AsyncStorage.getItem('configuracoes');
        if (configuracoesJSON) {
        return JSON.parse(configuracoesJSON);
        } else {
        // Configurações padrão
        const configuracoesPadrao = {
            modoPrestador: false,
            usuarioAtivo: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await AsyncStorage.setItem('configuracoes', JSON.stringify(configuracoesPadrao));
        return configuracoesPadrao;
        }
    } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        throw error;
    }
    },

    saveConfiguracoes: async (configuracoesData) => {
    try {
        const configuracoesExistente = await DatabaseService.getConfiguracoes();
        
        const configuracoesAtualizadas = {
        ...configuracoesExistente,
        ...configuracoesData,
        updated_at: new Date().toISOString()
        };
        
        await AsyncStorage.setItem('configuracoes', JSON.stringify(configuracoesAtualizadas));
        console.log('Configurações salvas com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        throw error;
    }
    },

    alterarUsuario: async (novoUsuario) => {
    try {
        if (!novoUsuario || novoUsuario.trim().length < 3) {
        throw new Error('Nome de usuário deve ter pelo menos 3 caracteres');
        }

        const usuarios = await DatabaseService._getUsuarios();
        const usuarioExistente = usuarios.find(u => u.username === novoUsuario);
        
        if (usuarioExistente && novoUsuario !== 'admin') {
        throw new Error('Nome de usuário já existe');
        }

        // Atualiza o usuário admin
        const adminIndex = usuarios.findIndex(u => u.username === 'admin');
        if (adminIndex !== -1) {
        usuarios[adminIndex].username = novoUsuario;
        usuarios[adminIndex].updated_at = new Date().toISOString();
        await DatabaseService._saveUsuarios(usuarios);
        }

        // Atualiza as configurações
        const configuracoes = await DatabaseService.getConfiguracoes();
        configuracoes.usuarioAtivo = novoUsuario;
        await DatabaseService.saveConfiguracoes(configuracoes);

        console.log('Usuário alterado para:', novoUsuario);
        return true;
    } catch (error) {
        console.error('Erro ao alterar usuário:', error);
        throw error;
    }
    },

    alternarModoPrestador: async () => {
    try {
        const configuracoes = await DatabaseService.getConfiguracoes();
        const novoModo = !configuracoes.modoPrestador;
        
        await DatabaseService.saveConfiguracoes({
        ...configuracoes,
        modoPrestador: novoModo
        });
        
        console.log('Modo prestador alterado para:', novoModo);
        return novoModo;
    } catch (error) {
        console.error('Erro ao alternar modo prestador:', error);
        throw error;
    }
    },

    excluirConta: async () => {
    try {
        // Remove apenas os dados do usuário, mantém serviços
        await AsyncStorage.multiRemove(['perfil', 'configuracoes']);
        
        // Recria perfil vazio
        await DatabaseService._criarPerfilVazio();
        
        // Recria configurações padrão
        const configuracoesPadrao = {
        modoPrestador: false,
        usuarioAtivo: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
        };
        await AsyncStorage.setItem('configuracoes', JSON.stringify(configuracoesPadrao));
        
        console.log('Conta excluída com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao excluir conta:', error);
        throw error;
    }
    },

    // ========== MÉTODO PARA DEBUG ==========
    debugConfiguracoes: async () => {
    try {
        const configuracoes = await DatabaseService.getConfiguracoes();
        const perfil = await DatabaseService._getPerfil();
        
        console.log('=== DEBUG CONFIGURAÇÕES ===');
        console.log('Configurações:', configuracoes);
        console.log('Perfil:', perfil);
        console.log('===========================');
        
        return { configuracoes, perfil };
    } catch (error) {
        console.error('Erro no debug:', error);
        throw error;
    }
    },
    // ========== MÉTODOS PARA SERVIÇOS DO PRESTADOR ==========
    getServicosPrestador: async () => {
    try {
        const servicosPrestadorJSON = await AsyncStorage.getItem('servicos_prestador');
        return servicosPrestadorJSON ? JSON.parse(servicosPrestadorJSON) : [];
    } catch (error) {
        console.error('Erro ao buscar serviços do prestador:', error);
        return [];
    }
    },

    saveServicoPrestador: async (servicoData) => {
    try {
        const servicos = await DatabaseService.getServicosPrestador();
        const novoId = servicos.length > 0 ? Math.max(...servicos.map(s => s.id)) + 1 : 1;
        
        const novoServico = {
        id: novoId,
        ...servicoData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
        };
        
        servicos.push(novoServico);
        await AsyncStorage.setItem('servicos_prestador', JSON.stringify(servicos));
        console.log('Serviço do prestador salvo com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao salvar serviço do prestador:', error);
        throw error;
    }
    },

    editarServicoPrestador: async (servicoId, servicoData) => {
    try {
        const servicos = await DatabaseService.getServicosPrestador();
        const servicoIndex = servicos.findIndex(s => s.id === servicoId);
        
        if (servicoIndex !== -1) {
        servicos[servicoIndex] = {
            ...servicos[servicoIndex],
            ...servicoData,
            updated_at: new Date().toISOString()
        };
        
        await AsyncStorage.setItem('servicos_prestador', JSON.stringify(servicos));
        console.log('Serviço do prestador atualizado com sucesso!');
        return true;
        }
        
        throw new Error('Serviço não encontrado');
    } catch (error) {
        console.error('Erro ao editar serviço do prestador:', error);
        throw error;
    }
    },

    excluirServicoPrestador: async (servicoId) => {
    try {
        const servicos = await DatabaseService.getServicosPrestador();
        const servicosFiltrados = servicos.filter(s => s.id !== servicoId);
        
        await AsyncStorage.setItem('servicos_prestador', JSON.stringify(servicosFiltrados));
        console.log('Serviço do prestador excluído com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao excluir serviço do prestador:', error);
        throw error;
    }
    },

    // ========== MÉTODO PARA VERIFICAR MODO PRESTADOR ==========
    isModoPrestador: async () => {
    try {
        const configuracoes = await DatabaseService.getConfiguracoes();
        return configuracoes.modoPrestador || false;
    } catch (error) {
        console.error('Erro ao verificar modo prestador:', error);
        return false;
    }
    }
};


export default DatabaseService;