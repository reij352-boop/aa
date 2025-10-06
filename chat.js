// chat.js - Lógica do Chat e Integrações

// Configurações da API
const GEMINI_API_KEY = 'SUA_CHAVE_API_AQUI'; // Substitua pela sua chave da API Gemini
const GOOGLE_SHEETS_URL = 'SUA_URL_DA_PLANILHA_AQUI'; // URL do Google Apps Script

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
            addMessage('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.', false);
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
        
        // Fazer requisição para a API do Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro na API do Gemini');
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
    
    // Função para construir o prompt contextualizado
    function construirPrompt(userMessage) {
        let prompt = `Você é a DarwinIA, uma tutora especialista em Biologia para ensino médio. 
        
CONTEXTO:
- Aluno: ${userData.nome}
- Tema: ${sessionData.tema}
- Nível: ${sessionData.dificuldade}
- Arquivo de referência: ${sessionData.arquivoConteudo ? 'Fornecido' : 'Não fornecido'}

DIRETRIZES PEDAGÓGICAS:
1. NUNCA dê respostas diretas ou completas de imediato
2. Faça perguntas orientadoras para ajudar o aluno a construir o conhecimento
3. Adapte a complexidade conforme o nível (${sessionData.dificuldade})
4. Use analogias e exemplos quando apropriado
5. Verifique a compreensão do aluno periodicamente
6. Corrija conceitos equivocados de forma construtiva

HISTÓRICO DA CONVERSA:
${chatHistory.map(msg => `${msg.type === 'user' ? 'Aluno' : 'Tutor'}: ${msg.content}`).join('\n')}

CONVERSA ATUAL:
Aluno: ${userMessage}

DarwinIA:`;

        // Adicionar conteúdo do arquivo se disponível
        if (sessionData.arquivoConteudo) {
            prompt += `\n\nCONTEÚDO DO ARQUIVO DE REFERÊNCIA:\n${sessionData.arquivoConteudo}`;
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
        
        // Preparar dados para envio
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
            // Enviar dados para o Google Sheets
            await enviarParaSheets(evaluationData);
            
            // Fechar modal e mostrar confirmação
            evaluationModal.style.display = 'none';
            alert('Avaliação enviada com sucesso! Obrigado por usar a DarwinIA.');
            
            // Limpar dados da sessão
            localStorage.removeItem('darwinia_session');
            
            // Redirecionar para login após alguns segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            console.error('Erro ao enviar avaliação:', error);
            alert('Erro ao enviar avaliação. Por favor, tente novamente.');
        }
    }
    
    // Função para determinar nível final baseado na avaliação
    function determinarNivelFinal(entendimento) {
        if (entendimento >= 4) return 'Avançado';
        if (entendimento >= 3) return 'Intermediário';
        return 'Iniciante';
    }
    
    // Função para enviar dados para o Google Sheets
    async function enviarParaSheets(data) {
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao enviar dados para a planilha');
        }
        
        return response.json();
    }
});