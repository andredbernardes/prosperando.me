# Solução para Erros do Firebase Firestore

## Problema Identificado
O erro `net::ERR_ABORTED 400 (Bad Request)` no Firestore indica problemas de configuração ou regras de segurança.

## Soluções Implementadas

### 1. Configuração Melhorada do Firebase
- ✅ Adicionado melhor tratamento de erros
- ✅ Implementado verificação de conectividade
- ✅ Adicionado sistema de reconexão automática
- ✅ Configurações otimizadas para estabilidade

### 2. Monitor de Conectividade
- ✅ Criado sistema de monitoramento em tempo real
- ✅ Indicador visual de status (em desenvolvimento)
- ✅ Logs detalhados para depuração

### 3. Tratamento de Erros Aprimorado
- ✅ Mensagens de erro mais específicas
- ✅ Tratamento de diferentes tipos de erro
- ✅ Fallback para operações críticas

## Passos para Resolver

### 1. Atualizar Regras do Firestore
1. Acesse o [Console do Firebase](https://console.firebase.google.com)
2. Selecione seu projeto `prosperando-me`
3. Vá para **Firestore Database** > **Rules**
4. Substitua as regras atuais pelas regras do arquivo `firestore-rules.txt`

### 2. Verificar Configuração do Projeto
1. No console do Firebase, vá para **Project Settings**
2. Verifique se o `projectId` está correto: `prosperando-me`
3. Confirme que o Firestore está habilitado

### 3. Testar Conectividade
1. Abra o console do navegador (F12)
2. Execute: `testFirebaseConnection()`
3. Verifique os logs para identificar problemas

### 4. Regras Temporárias para Desenvolvimento
Se os problemas persistirem, use temporariamente estas regras mais permissivas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANTE**: Use estas regras apenas em desenvolvimento!

## Monitor de Status

### Em Desenvolvimento
- O monitor de status aparece automaticamente em `localhost`
- Mostra status de Auth e Firestore em tempo real
- Posicionado no canto superior direito

### Em Produção
- O monitor é desabilitado automaticamente
- Logs são mantidos no console para depuração

## Comandos Úteis

### Testar Conectividade
```javascript
// No console do navegador
import('/js/firebase-utils.js').then(({ testFirebaseConnection }) => {
  testFirebaseConnection().then(console.log);
});
```

### Reconectar Manualmente
```javascript
// No console do navegador
import('/js/firebase-utils.js').then(({ firebaseMonitor }) => {
  firebaseMonitor.reconnect();
});
```

### Ver Status Atual
```javascript
// No console do navegador
import('/js/firebase-utils.js').then(({ firebaseMonitor }) => {
  console.log(firebaseMonitor.getStatus());
});
```

## Logs de Erro Comuns

### Erro 400 (Bad Request)
- **Causa**: Regras de segurança incorretas
- **Solução**: Atualizar regras do Firestore

### Erro de Permissão
- **Causa**: Usuário não autenticado ou sem permissão
- **Solução**: Verificar autenticação e regras

### Erro de Rede
- **Causa**: Problemas de conectividade
- **Solução**: Sistema de reconexão automática implementado

## Contato para Suporte

Se os problemas persistirem após seguir estas instruções:
1. Verifique os logs no console do navegador
2. Teste a conectividade usando os comandos acima
3. Verifique se as regras do Firestore foram atualizadas corretamente

## Arquivos Modificados

- `js/firebase.js` - Configuração melhorada
- `js/cadastro-firebase.js` - Tratamento de erros aprimorado
- `js/login-firebase.js` - Tratamento de erros aprimorado
- `js/firebase-utils.js` - Sistema de monitoramento (novo)
- `cadastro.html` - Adicionado monitor de desenvolvimento
- `login.html` - Adicionado monitor de desenvolvimento 