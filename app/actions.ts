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

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error('Nenhuma subscrição disponível')
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'PWA Test Notification',
        body: message,
        icon: '/head.png',
        badge: '/head.png',
      })
    )
    console.log('Notificação enviada com sucesso')
    return { success: true }
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return { success: false, error: 'Falha ao enviar notificação' }
  }
}