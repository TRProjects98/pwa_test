'use server'

import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:reistiago64@gmail.com', // Substitui pelo teu email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// Em produção, guardarias isto numa base de dados
// Por agora, vamos usar uma variável simples para testar
import type { PushSubscription as WebPushSubscription } from 'web-push'

let subscription: WebPushSubscription | null = null

export async function subscribeUser(sub: WebPushSubscription) {
  subscription = sub
  // Em produção: await db.subscriptions.create({ data: sub })
  console.log('Utilizador subscrito às notificações:', sub.endpoint)
  return { success: true }
}

export async function unsubscribeUser() {
  subscription = null
  // Em produção: await db.subscriptions.delete({ where: { ... } })
  console.log('Utilizador cancelou subscrição')
  return { success: true }
}

export async function sendNotification(subscription: WebPushSubscription, message: string) {
  try {
    console.log('📤 Enviando notificação para:', subscription.endpoint.slice(0, 50) + '...')
    
    const payload = JSON.stringify({
      title: 'PWA Notification',
      body: message,
      icon: '/head.png',
      badge: '/head.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver mais',
          icon: '/head.png',
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/head.png',
        }
      ]
    })

    await webpush.sendNotification(subscription, payload)
    
    console.log('✅ Notificação enviada com sucesso!')
    return { success: true, message: 'Notificação enviada com sucesso!' }
    
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}