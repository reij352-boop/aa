// config.js - Configuração de Sessão

document.addEventListener('DOMContentLoaded', function() {
    const configForm = document.getElementById('configForm');
    const userWelcome = document.getElementById('userWelcome');
    
    // Verificar se o usuário está logado
    const userData = JSON.parse(localStorage.getItem('darwinia_user'));
    
    if (!userData) {
        // Se não estiver logado, redirecionar para login
        window.location.href = 'index.html';
        return;
    }
    
    // Exibir saudação personalizada
    userWelcome.textContent = `Olá, ${userData.nome}!`;
    
    configForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const tema = document.getElementById('tema').value;
        const dificuldade = document.getElementById('dificuldade').value;
        const arquivoInput = document.getElementById('arquivo');
        
        // Validar seleção
        if (!tema || !dificuldade) {
            alert('Por favor, selecione um tema e nível de dificuldade.');
            return;
        }
        
        // Salvar configurações da sessão
        const sessionData = {
            tema: tema,
            dificuldade: dificuldade,
            timestamp: new Date().toISOString()
        };
        
        // Processar arquivo se fornecido
        if (arquivoInput.files.length > 0) {
            const file = arquivoInput.files[0];
            if (file.type !== 'text/plain') {
                alert('Por favor, envie apenas arquivos .txt');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                sessionData.arquivoConteudo = e.target.result;
                finalizarConfiguracao(sessionData);
            };
            reader.readAsText(file);
        } else {
            finalizarConfiguracao(sessionData);
        }
    });
    
    function finalizarConfiguracao(sessionData) {
        localStorage.setItem('darwinia_session', JSON.stringify(sessionData));
        window.location.href = 'chat.html';
    }
});