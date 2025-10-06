// script.js - Lógica do Login

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Senha genérica para todos os usuários
    const SENHA_GENERICA = 'biologia2024';
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value.trim();
        const senha = document.getElementById('senha').value;
        
        // Validações básicas
        if (!nome) {
            alert('Por favor, digite seu nome completo.');
            return;
        }
        
        if (senha !== SENHA_GENERICA) {
            alert('Senha incorreta. Use: ' + SENHA_GENERICA);
            return;
        }
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('darwinia_user', JSON.stringify({
            nome: nome,
            timestamp: new Date().toISOString()
        }));
        
        // Redirecionar para a página de configuração
        window.location.href = 'config.html';
    });
});