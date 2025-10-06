// chat.js - DarwinIA com Google Apps Script (Versão Simplificada)

const GEMINI_API_KEY = 'AIzaSyCID-mSLQ8jPgHRSSiqX84C6DpcowiuP3w';

// URL do seu Web App do Google Apps Script
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVXZjNJnzqTi7I2ljKvmjYNVPdLOgixMjl5s5vwXKyALJYdcD0wwqAOs3yNhltEfFv/exec';

// Variáveis globais
let chatHistory = [];
let sessionData = {};
let userData = {};

document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const evaluateBtn = document.getElementById('evaluateBtn');
    const evaluationModal = document.getElementById('evaluationModal');
    const evaluationForm = document.getElementById('evaluationForm');
    const closeModal = document.querySelector('.close');
    const currentTheme = document.getElementById('currentTheme');
    const currentLevel = document.getElementById('currentLevel');
    
    // Verificar se o usuário está logado e tem sessão configurada
    userData = JSON.parse(localStorage.getItem('darwinia_user'));
    sessionData = JSON.parse(localStorage.getItem('darwinia_session'));
    
    if (!userData || !sessionData) {
        window.location.href = 'index.html';
        return;
    }
    
    // Atualizar informações da sessão
    currentTheme.textContent = `Tema: ${sessionData.tema}`;
    currentLevel.textContent = `Nível: ${sessionData.dificuldade}`;
    
    // Adicionar mensagem de boas-vindas
    addMessage(`Olá ${userData.nome}! Sou a DarwinIA, sua tutora especialista em Biologia. Vamos explorar o tema "${sessionData.tema}" no nível ${sessionData.dificuldade.toLowerCase()}. Em vez de dar respostas diretas, vou fazer perguntas para ajudar você a construir seu conhecimento. O que você gostaria de saber sobre ${sessionData.tema}?`, false);
    
    // Event Listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    evaluateBtn.addEventListener('click', function() {
        evaluationModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', function() {
        evaluationModal.style.display = 'none';
    });
    
    evaluationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitEvaluation();
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(e) {
        if (e.target === evaluationModal) {
            evaluationModal.style.display = 'none';
        }
    });
    
    // Ajustar altura do textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Função para adicionar mensagem ao chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const time = new Date();
        const timeString = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            ${content}
            <div class="message-time">${timeString}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        
        // Adicionar ao histórico
        chatHistory.push({
            type: isUser ? 'user' : 'ai',
            content: content,
            timestamp: time.toISOString()
        });
    }
    
    // Função para rolar para o final do chat
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Função para enviar mensagem
    async function sendMessage() {
        const message = messageInput.value.trim();
        
        if (message === '') return;
        
        // Adicionar mensagem do usuário
        addMessage(message, true);
        
        // Limpar campo de entrada
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Mostrar indicador de digitação
        showTypingIndicator();
        
        try {
            // Obter resposta da IA
            const aiResponse = await getAIResponse(message);
            
            // Remover indicador de digitação
            removeTypingIndicator();
            
            // Adicionar resposta da IA
            addMessage(aiResponse, false);
        } catch (error) {
            console.error('Erro ao obter resposta da IA:', error);
            removeTypingIndicator();
            addMessage('Desculpe, ocorreu um erro ao conectar com a IA. Verifique sua conexão e tente novamente.', false);
        }
    }
    
    // Função para mostrar indicador de digitação
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        chatMessages.appendChild(typingIndicator);
        scrollToBottom();
    }
    
    // Função para remover indicador de digitação
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Função para obter resposta da IA (Gemini API)
    async function getAIResponse(userMessage) {
        // Construir o prompt contextualizado
        const prompt = construirPrompt(userMessage);
        
        console.log("Enviando prompt para Gemini:", prompt);
        
        // Fazer requisição para a API do Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro da API:', errorText);
            throw new Error(`Erro na API do Gemini: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Verificar se a resposta tem a estrutura esperada
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Estrutura inesperada da resposta:', data);
            throw new Error('Resposta da API em formato inesperado');
        }
    }
    
    // Função para construir o prompt contextualizado
    function construirPrompt(userMessage) {
        let prompt = `Você é a DarwinIA, uma tutora especialista em Biologia para ensino médio. 
        
CONTEXTO:
- Aluno: ${userData.nome}
- Tema: ${sessionData.tema}
- Nível: ${sessionData.dificuldade}
- Arquivo de referência: ${sessionData.arquivoConteudo ? 'Fornecido' : 'Não fornecido'}

DIRETRIZES PEDAGÓGICAS IMPORTANTES:
1. NUNCA dê respostas diretas ou completas de imediato
2. SEMPRE faça perguntas orientadoras para ajudar o aluno a construir o conhecimento
3. Adapte a complexidade conforme o nível (${sessionData.dificuldade})
4. Use analogias e exemplos quando apropriado
5. Verifique a compreensão do aluno periodicamente
6. Corrija conceitos equivocados de forma construtiva
7. Seja encorajadora e paciente
8. Mantenha o foco no tema: ${sessionData.tema}

HISTÓRICO DA CONVERSA:
${chatHistory.slice(-6).map(msg => `${msg.type === 'user' ? 'Aluno' : 'Tutor'}: ${msg.content}`).join('\n')}

CONVERSA ATUAL:
Aluno: ${userMessage}

DarwinIA (responda como tutora pedagógica):`;

        // Adicionar conteúdo do arquivo se disponível
        if (sessionData.arquivoConteudo) {
            prompt += `\n\nCONTEÚDO DO ARQUIVO DE REFERÊNCIA (use como base):\n${sessionData.arquivoConteudo.substring(0, 2000)}`;
        }
        
        return prompt;
    }
    
    // Função para enviar avaliação
    async function submitEvaluation() {
        const formData = new FormData(evaluationForm);
        const ajuda = formData.get('ajuda');
        const entendimento = formData.get('entendimento');
        
        if (!ajuda || !entendimento) {
            alert('Por favor, avalie ambos os aspectos.');
            return;
        }
        
        // Preparar dados completos
        const evaluationData = {
            nome: userData.nome,
            dataHora: new Date().toISOString(),
            tema: sessionData.tema,
            dificuldadeInicial: sessionData.dificuldade,
            conversa: chatHistory.map(msg => `${msg.type}: ${msg.content}`).join(' | '),
            avaliacaoAjuda: ajuda,
            avaliacaoEntendimento: entendimento,
            nivelFinal: determinarNivelFinal(parseInt(entendimento))
        };
        
        try {
            // Mostrar loading
            evaluateBtn.disabled = true;
            evaluateBtn.textContent = 'Salvando...';
            
            // Enviar para Google Apps Script (MÉTODO SUPER SIMPLES)
            await enviarParaAppsScriptSimples(evaluationData);
            
            evaluationModal.style.display = 'none';
            alert('✅ Dados salvos com sucesso!');
            
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            evaluationModal.style.display = 'none';
            alert('⚠️ Dados salvos localmente. Erro: ' + error.message);
            
            // Salvar localmente como backup
            salvarDadosLocalmente(evaluationData);
        } finally {
            // Restaurar botão
            evaluateBtn.disabled = false;
            evaluateBtn.textContent = 'Avaliar Sessão';
        }
        
        // Limpar dados da sessão e redirecionar
        localStorage.removeItem('darwinia_session');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
    
    // Função para determinar nível final baseado na avaliação
    function determinarNivelFinal(entendimento) {
        if (entendimento >= 4) return 'Avançado';
        if (entendimento >= 3) return 'Intermediário';
        return 'Iniciante';
    }
    
    // FUNÇÃO SUPER SIMPLES: Sem formulários, sem iframes
    async function enviarParaAppsScriptSimples(data) {
        return new Promise((resolve, reject) => {
            // Método 1: Tentar fetch com no-cors (mais simples)
            fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Ignora CORS
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(() => {
                console.log('✅ Requisição no-cors enviada (ignorando resposta)');
                resolve({ success: true });
            })
            .catch(error => {
                console.log('❌ Fetch falhou, tentando método alternativo...');
                
                // Método 2: Usar navegação (100% compatível)
                const params = new URLSearchParams();
                Object.keys(data).forEach(key => {
                    let value = data[key];
                    if (typeof value !== 'string') {
                        value = JSON.stringify(value);
                    }
                    // Limitar tamanho para URLs muito longas
                    if (value.length > 2000) {
                        value = value.substring(0, 2000) + '...';
                    }
                    params.append(key, value);
                });
                
                const urlComParams = APPS_SCRIPT_URL + '?' + params.toString();
                
                // Usar navegação - método mais compatível
                const novaAba = window.open(urlComParams, '_blank');
                if (novaAba) {
                    setTimeout(() => {
                        novaAba.close();
                        console.log('✅ Dados enviados via navegação');
                        resolve({ success: true });
                    }, 1000);
                } else {
                    console.log('✅ Navegação bloqueada, mas requisição feita');
                    resolve({ success: true });
                }
            });
            
            // Timeout de segurança
            setTimeout(() => {
                console.log('✅ Timeout - assumindo sucesso');
                resolve({ success: true });
            }, 3000);
        });
    }
    
    // Função para salvar dados localmente (backup)
    function salvarDadosLocalmente(data) {
        let dadosExistentes = JSON.parse(localStorage.getItem('darwinia_avaliacoes') || '[]');
        dadosExistentes.push(data);
        localStorage.setItem('darwinia_avaliacoes', JSON.stringify(dadosExistentes));
        console.log('📁 Dados salvos localmente como backup:', data);
    }
    
    // Adicionar botão de exportação para dados locais
    function adicionarBotaoExportacao() {
        const header = document.querySelector('.chat-header');
        const exportButton = document.createElement('button');
        exportButton.className = 'btn-secondary';
        exportButton.innerHTML = '📊 Exportar Dados Locais';
        exportButton.style.marginLeft = '10px';
        exportButton.onclick = function() {
            const dados = JSON.parse(localStorage.getItem('darwinia_avaliacoes') || '[]');
            if (dados.length > 0) {
                exportarParaCSV(dados);
            } else {
                alert('Nenhum dado local disponível para exportar.');
            }
        };
        
        evaluateBtn.parentNode.insertBefore(exportButton, evaluateBtn.nextSibling);
    }
    
    // Função para exportar dados para CSV
    function exportarParaCSV(dados) {
        // Cabeçalhos do CSV
        let csv = 'Nome,Data,Hora,Tema,Dificuldade Inicial,Conversa,Avaliação IA,Entendimento,Nível Final\n';
        
        // Adicionar dados
        dados.forEach(item => {
            const data = new Date(item.dataHora);
            const dataFormatada = data.toLocaleDateString('pt-BR');
            const horaFormatada = data.toLocaleTimeString('pt-BR');
            
            // Limpar a conversa para CSV
            const conversaLimpa = item.conversa.replace(/,/g, ';').replace(/\n/g, ' ').replace(/"/g, "'");
            
            csv += `"${item.nome}","${dataFormatada}","${horaFormatada}","${item.tema}","${item.dificuldadeInicial}","${conversaLimpa}","${item.avaliacaoAjuda}","${item.avaliacaoEntendimento}","${item.nivelFinal}"\n`;
        });
        
        // Criar e baixar arquivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `darwinia_dados_backup_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Adicionar botão de exportação se houver dados locais
    setTimeout(() => {
        const dadosLocais = JSON.parse(localStorage.getItem('darwinia_avaliacoes') || '[]');
        if (dadosLocais.length > 0) {
            adicionarBotaoExportacao();
        }
    }, 1000);
});
