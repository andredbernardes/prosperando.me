const CACHE_NAME = 'calculadora-dizimos-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/calculadora.html',
    '/dashboard.html',
    '/doacoes.html',
    '/sobre.html',
    '/cadastro.html',
    '/login.html',
    '/style.css',
    '/main.js',
    '/icon.svg',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Erro ao instalar cache:', error);
            })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retorna o cache se encontrado
                if (response) {
                    return response;
                }
                
                // Se não estiver no cache, busca na rede
                return fetch(event.request)
                    .then((response) => {
                        // Verifica se a resposta é válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clona a resposta para armazenar no cache
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Fallback para páginas HTML
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Aqui você pode implementar sincronização de dados
    // Por exemplo, salvar cálculos no servidor quando online
    console.log('Sincronização em background executada');
}

// Notificações push
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Nova atualização disponível!',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver Calculadora',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: '/icon-192x192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Calculadora de Dízimos', options)
    );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('Service Worker carregado com sucesso! 🚀'); 