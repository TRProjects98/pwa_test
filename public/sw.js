// Service Worker para Push Notifications
console.log('Service Worker carregado')

// Escuta eventos de push
self.addEventListener('push', function (event) {
  console.log('Push recebido:', event)
  
  if (event.data) {
    const data = event.data.json()
    console.log('Dados da notificação:', data)
    
    const options = {
      body: data.body,
      icon: data.icon || '/head.png',
      badge: data.badge || '/head.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1',
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver mais',
          icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icon-192x192.png'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Escuta cliques nas notificações
self.addEventListener('notificationclick', function (event) {
  console.log('Notificação clicada:', event.notification.tag)
  
  event.notification.close()
  
  if (event.action === 'close') {
    // Não faz nada, apenas fecha
    return
  }
  
  // Abre/foca na janela da app
  event.waitUntil(
    clients.matchAll().then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

// Escuta quando a notificação é fechada
self.addEventListener('notificationclose', function (event) {
  console.log('Notificação fechada:', event.notification.tag)
})