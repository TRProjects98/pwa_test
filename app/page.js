'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from './actions'

// Função utilitária para converter chave VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Componente para gerir Push Notifications
function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      console.log('A registar Service Worker...')
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      console.log('Service Worker registado:', registration)
      
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
      console.log('Subscrição atual:', sub)
    } catch (error) {
      console.error('Erro ao registar Service Worker:', error)
    }
  }

  async function subscribeToPush() {
    try {
      setIsLoading(true)
      console.log('A subscrever às notificações push...')
      
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      })
      
      setSubscription(sub)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub)
      console.log('Subscrito com sucesso!')
    } catch (error) {
      console.error('Erro ao subscrever:', error)
      alert('Erro ao subscrever às notificações. Verifica as permissões.')
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    try {
      setIsLoading(true)
      await subscription?.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
      console.log('Subscrição cancelada')
    } catch (error) {
      console.error('Erro ao cancelar subscrição:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function sendTestNotification() {
    if (!message.trim()) {
      alert('Por favor, escreve uma mensagem!')
      return
    }

    try {
      setIsLoading(true)
      console.log('A enviar notificação...')
      const result = await sendNotification(message)
      if (result.success) {
        alert('Notificação enviada!')
        setMessage('')
      } else {
        alert('Erro ao enviar notificação')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao enviar notificação')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Push notifications não são suportadas neste browser.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">🔔 Push Notifications</h3>
      
      {subscription ? (
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ Estás subscrito às notificações push!
          </div>
          
          <button 
            onClick={unsubscribeFromPush}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? 'A processar...' : 'Cancelar Subscrição'}
          </button>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Mensagem de teste:
            </label>
            <input
              type="text"
              placeholder="Escreve a tua mensagem aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-500"
            />
            <button 
              onClick={sendTestNotification}
              disabled={isLoading || !message.trim()}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? 'A enviar...' : 'Enviar Notificação Teste'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            ⚠️ Não estás subscrito às notificações push.
          </div>
          <button 
            onClick={subscribeToPush}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? 'A processar...' : 'Subscrever Notificações'}
          </button>
        </div>
      )}
    </div>
  )
}

// Componente para instalar a PWA
function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window).MSStream
    )
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  if (isStandalone) {
    return null // Não mostra se já estiver instalada
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">📱 Instalar App</h3>
      <p className="mb-4">Instala esta PWA no teu dispositivo para uma melhor experiência!</p>
      
      {isIOS ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p>
            Para instalar no iOS: toca no botão partilhar 
            <span className="mx-1">⎋</span> 
            e depois "Adicionar ao Ecrã Principal"
            <span className="mx-1">➕</span>
          </p>
        </div>
      ) : (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p>O teu browser mostrará automaticamente um prompt de instalação quando estiver pronto.</p>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">My First PWA Test</h1>
          <p className="text-gray-600 mt-2">Progressive Web App com Push Notifications</p>
        </div>
        
        <PushNotificationManager />
        <InstallPrompt />
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">ℹ️ Como testar:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Clica em "Subscrever Notificações" e aceita as permissões</li>
            <li>Escreve uma mensagem de teste</li>
            <li>Clica em "Enviar Notificação Teste"</li>
            <li>Deves ver a notificação aparecer!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}