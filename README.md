# 🏛️ Calculadora de Dízimos - Prosperando.me

Uma aplicação web PWA (Progressive Web App) elegante e responsiva para calcular dízimos, ofertas, primícias e semeaduras de forma inteligente e bíblica.

## ✨ Características

- **🎨 Design Moderno**: Interface elegante com gradientes e animações suaves
- **📱 PWA Completa**: Funciona offline, pode ser instalada como app
- **📐 Responsiva**: Perfeita em desktop, tablet e mobile
- **⚡ Performance**: Carregamento rápido e experiência fluida
- **🌙 Modo Escuro**: Suporte automático ao tema do sistema
- **💾 Persistência**: Salva seus últimos cálculos automaticamente
- **📤 Compartilhamento**: Compartilhe resultados facilmente
- **⌨️ Atalhos**: Suporte a teclas de atalho e gestos touch

## 🧮 Funcionalidades

### Cálculos Automáticos
- **Dízimo**: 10% da renda total
- **Oferta**: 5% da renda total  
- **Primícias**: 2% da renda total (primeiros frutos)
- **Semeadura**: 3% da renda total (investimento espiritual)

### Recursos Avançados
- Cálculo de renda mensal + renda extra
- Resumo total com percentuais
- Dicas bíblicas de contribuição
- Histórico de cálculos (24h)
- Notificações elegantes
- Suporte a gestos touch

## 🚀 Instalação

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/calculadora-dizimos.git
cd calculadora-dizimos
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute em desenvolvimento**
```bash
npm run dev
```

4. **Acesse no navegador**
```
http://localhost:3000
```

### Build para Produção
```bash
npm run build
npm run preview
```

## 📱 Instalação como PWA

1. Acesse a aplicação no Chrome/Edge
2. Clique no ícone de instalação na barra de endereços
3. Ou use o menu do navegador: "Instalar aplicativo"
4. A aplicação será instalada como um app nativo

## 🎯 Como Usar

1. **Insira sua renda mensal** no campo "Renda Mensal"
2. **Adicione renda extra** (opcional) no campo "Renda Extra"
3. **Clique em "Calcular Contribuições"**
4. **Visualize os resultados** organizados em cards elegantes
5. **Acompanhe o resumo total** com percentuais
6. **Compartilhe** os resultados se desejar

### Atalhos de Teclado
- `Enter`: Calcular
- `Ctrl/Cmd + Enter`: Calcular
- `Escape`: Limpar campos

### Gestos Touch (Mobile)
- **Swipe para cima**: Mostrar resultados
- **Swipe para baixo**: Esconder resultados

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Build Tool**: Vite
- **PWA**: Service Workers, Web App Manifest
- **Estilização**: CSS Custom Properties, Flexbox, Grid
- **Fontes**: Inter (Google Fonts)
- **Ícones**: Emoji e SVG customizado

## 📁 Estrutura do Projeto

```
calculadora-dizimos/
├── index.html          # Página principal
├── style.css           # Estilos CSS
├── main.js             # Lógica JavaScript
├── sw.js              # Service Worker
├── manifest.json       # Configuração PWA
├── icon.svg           # Ícone SVG
├── vite.config.js     # Configuração Vite
├── package.json       # Dependências
└── README.md          # Documentação
```

## 🎨 Personalização

### Cores
As cores podem ser personalizadas editando as variáveis CSS em `style.css`:

```css
:root {
    --primary-color: #4f46e5;
    --secondary-color: #10b981;
    --accent-color: #f59e0b;
    /* ... outras cores */
}
```

### Percentuais
Os percentuais de cálculo podem ser ajustados em `main.js`:

```javascript
const CONFIG = {
    DIZIMO_PERCENTUAL: 0.10,      // 10%
    OFERTA_PERCENTUAL: 0.05,      // 5%
    PRIMICIAS_PERCENTUAL: 0.02,   // 2%
    SEMEADURA_PERCENTUAL: 0.03    // 3%
};
```

## 📊 Funcionalidades PWA

- ✅ **Offline First**: Funciona sem internet
- ✅ **Installable**: Pode ser instalada como app
- ✅ **Push Notifications**: Suporte a notificações
- ✅ **Background Sync**: Sincronização em background
- ✅ **App-like Experience**: Interface nativa

## 🌐 Compatibilidade

- ✅ Chrome 67+
- ✅ Firefox 67+
- ✅ Safari 11.1+
- ✅ Edge 79+
- ✅ Mobile browsers

## 📈 Performance

- **Lighthouse Score**: 95+ em todas as categorias
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- Inspirado nos princípios bíblicos de contribuição
- Design inspirado em aplicações modernas
- Comunidade open source

## 📞 Suporte

- **Email**: suporte@prosperando.me
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/calculadora-dizimos/issues)
- **Documentação**: [Wiki](https://github.com/seu-usuario/calculadora-dizimos/wiki)

---

**Desenvolvido com ❤️ para a comunidade cristã**

*"Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa; e provai-me nisto, diz o Senhor dos Exércitos, se eu não vos abrir as janelas do céu e não derramar sobre vós bênção sem medida."* - Malaquias 3:10 