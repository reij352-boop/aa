// chat.js - DarwinIA Chat com Google Sheets Integration

// Configurações da API
const GEMINI_API_KEY = 'AIzaSyCID-mSLQ8jPgHRSSiqX84C6DpcowiuP3w';
const SHEET_ID = '1vTCX7-kRWedfbGTBcpaMFBVQbHJvUOsQiS_NeDqaRNM';

// Service Account Credentials
const SERVICE_ACCOUNT = {
    "type": "service_account",
    "project_id": "biobot-474018",
    "private_key_id": "1be3d3636c1c9bb0d052008b42c110c6f05f40c5",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDCdIASF6WuuJtl\nr5NrMGLDg2vsrUuOWgNOlvGV4RipX4RNoBFUMDUqK2Yx1YHwR9HLkvkTtFXj7oUv\nTf9iP03rD5CJyxdnHSVZYvYFayWD4LfgZUI8jhA6yNUxh0hFIoPai76PechNNPDq\nETxHmyAf4YXBUw47th3cG+NtexyRUpPkU0UfPRBP1dVDkOIUeEA4KB6cMEptk8PY\nay0K1DJHRZXVTxa4FhGA4cgm06jA0plgwIe6qqn2mIwPviDfKckFqRcTy/0H7yyr\nhGp67QNPSodWOihEKoR5PlmzLIVcpEGQJmeC6a1wolxDIXhu7p1Ka07yHX3tD2QR\nDTSqYqPfAgMBAAECggEAHleTtP8CnSufd95N2E/BrB9MI69Qwa1y+abc8IBMsFUV\nWGV4fr9SSbphj7dwjJUwUR3QXCOWCWMVCMduE58Bd1huOx9jufUWzbFUO+PhrofN\n4/z4475ecvBr2nbGWfSjnWI+gbXE1viX+ktmhrKCcJG9+hIN1QG6/AxP+wEsTn0j\nMcJ6MiotZArqfPpkDx37vlQqCcNFgUn/vGl3+qfsDsNOtUtxw3pXJNv4bwH+LlQ8\nH7zs+lQKtcAsTM+AMjTOUUc+rpZmsvAzc+bIALoGiqF0r2nUokx/6y/K/6xa3bMd\n+bYO1eI8mYNZGBEOmXIzu8oMljWh5jy/y99DRzO1lQKBgQDvGH2EDdDOr5oWgpBi\n18Ooxg6Qf0d4KtREVewuhHEjwazPaDN1h1wOpGE4Cyr0z71qhSCzSWVjYd+I1INo\nrAfg22oi0ES+67sfzdgwuFdAI1fxGXwwbVh09q99sIbxL0OG8YUjgI91rUIc+txK\nHXxi5u8YgYcNXdqTR9vdyAvtywKBgQDQNAnCRTIsHcl4GlAoalyklsfl7M/OS6fi\n6scU877XkFb0HVJCpMsV2lNYMg/arGrGW+zzEKKp1SzZ5qQS/gGnho1pQEJhQvzF\nHLxFQS0X7IZFJ/BFu5jbZs+kbYHfCy+t3oUDikv4RnzbsQqUuRudax8tdW0cPHp0\nYyDdBkmfvQKBgQCXT7VnU+L4WpM2eaxskUXG0oi3E4WkW9533LSaf8CmM1Rs8fHX\nCDHPJmJMOG0X/zxNZDDcpa9fZLo1euAq5uwZdmJF4+4NsVt79iZCNvcopPVrpIg+\nkYSwiMlozsWnbxTaGpD6dcrUWzCC7JNq6Bwm7yUTKi3Q3LuOB6TyRz6dXwKBgQC7\nYPofc3MyLSSzCMt3dDIoluMVVUm42nIgUTgW7T+mdessDG+KNxHnevRjfbqzDVWT\nbAwWvbQHsSmKen7T8PLAOOJwBTs4mbcwFyqCEaRp0Z8OAmHGAI4Td7YMv9mQSVsB\n2jBP/Vld+uJIPk/NhcMKq+wFV5d5QBzdPpHHGe+M6QKBgQDJiPUnntKx0e1ngv9r\n5bvkS/Qpe+KtGe++DArHe7XiFjDv1tZJpbLsGdsm9bH+ta7qktv22Fg90u7KxIRB\nS/72NH6DteWu+6ws8XyNgbngtO/UHldieyZDESgOrJsA5YxroiahcCRrdv9ydAxn\nOanHKNSJQNprNoa9cq4KU0Uluw==\n-----END PRIVATE KEY-----\n",
    "client_email": "biobot@biobot-474018.iam.gserviceaccount.com",
    "client_id": "115438737887774544725",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token"
};

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
            // Salvar localmente como backup
            salvarDadosLocalmente(evaluationData);
            
            // Enviar para Google Sheets
            await enviarParaGoogleSheets(evaluationData);
            
            evaluationModal.style.display = 'none';
            alert('✅ Avaliação salva com sucesso no Google Sheets!');
            
            // Limpar dados da sessão
            localStorage.removeItem('darwinia_session');
            
            // Redirecionar para login
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            console.error('Erro ao salvar avaliação:', error);
            evaluationModal.style.display = 'none';
            alert('⚠️ Dados salvos localmente. Erro ao conectar com Google Sheets: ' + error.message);
            
            // Limpar e redirecionar mesmo com erro
            localStorage.removeItem('darwinia_session');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
    
    // Função para determinar nível final baseado na avaliação
    function determinarNivelFinal(entendimento) {
        if (entendimento >= 4) return 'Avançado';
        if (entendimento >= 3) return 'Intermediário';
        return 'Iniciante';
    }
    
    // Função para salvar dados localmente (backup)
    function salvarDadosLocalmente(data) {
        let dadosExistentes = JSON.parse(localStorage.getItem('darwinia_avaliacoes') || '[]');
        dadosExistentes.push(data);
        localStorage.setItem('darwinia_avaliacoes', JSON.stringify(dadosExistentes));
        console.log('Dados salvos localmente:', data);
    }
    
    // Função para enviar para Google Sheets
    async function enviarParaGoogleSheets(data) {
        try {
            // Obter access token
            const accessToken = await getAccessToken();
            
            // Preparar dados para a planilha
            const rowData = [
                data.nome,
                data.dataHora,
                data.tema,
                data.dificuldadeInicial,
                data.conversa,
                data.avaliacaoAjuda,
                data.avaliacaoEntendimento,
                data.nivelFinal
            ];

            console.log('Enviando para Sheets:', rowData);
            
            // Fazer requisição para a API do Google Sheets
            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [rowData]
                })
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                throw new Error(`Erro Sheets API: ${response.status} - ${errorDetails}`);
            }

            const result = await response.json();
            console.log('Dados salvos no Sheets:', result);
            return result;
            
        } catch (error) {
            console.error('Erro no enviarParaGoogleSheets:', error);
            throw error;
        }
    }
    
    // Função para obter access token JWT
    async function getAccessToken() {
        try {
            // Criar JWT
            const jwt = await createJWT();
            
            // Trocar JWT por access token
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao obter access token: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Access token obtido com sucesso');
            return data.access_token;
            
        } catch (error) {
            console.error('Erro no getAccessToken:', error);
            throw error;
        }
    }
    
    // Função para criar JWT
    async function createJWT() {
        const header = {
            alg: 'RS256',
            typ: 'JWT'
        };

        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: SERVICE_ACCOUNT.client_email,
            scope: 'https://www.googleapis.com/auth/spreadsheets',
            aud: SERVICE_ACCOUNT.token_uri,
            exp: now + 3600,
            iat: now
        };

        // Codificar header e payload em Base64URL
        const encodedHeader = base64urlEncode(JSON.stringify(header));
        const encodedPayload = base64urlEncode(JSON.stringify(payload));
        
        // Assinar usando jsrsasign
        const signatureInput = `${encodedHeader}.${encodedPayload}`;
        const signature = signDataWithRSA(signatureInput);
        const encodedSignature = base64urlEncode(signature);

        return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
    }
    
    // Função para codificar Base64URL
    function base64urlEncode(str) {
        return btoa(str)
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }
    
    // Função para assinar dados com RSA usando jsrsasign
    function signDataWithRSA(data) {
        try {
            // Usando a biblioteca jsrsasign para assinatura RSA
            const signature = KJUR.crypto.Sign.sign({alg: 'SHA256withRSA'}, data, SERVICE_ACCOUNT.private_key);
            return signature;
        } catch (error) {
            console.error('Erro na assinatura RSA:', error);
            throw new Error('Erro na assinatura JWT');
        }
    }
});
