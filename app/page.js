'use client'

import { useState, useEffect } from 'react'
import { sendNotification } from './actions'

export default function Home() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
      loadSubscriptionFromStorage()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      console.log('✅ Service Worker registado:', registration)
    } catch (error) {
      console.error('❌ Erro ao registar Service Worker:', error)
    }
  }

  // Carregar subscrição do localStorage
  const loadSubscriptionFromStorage = () => {
    try {
      const saved = localStorage.getItem('pushSubscription')
      if (saved) {
        const parsedSub = JSON.parse(saved)
        setSubscription(parsedSub)
        console.log('📱 Subscrição carregada do localStorage')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar subscrição:', error)
    }
  }

  // Guardar subscrição no localStorage
  const saveSubscriptionToStorage = (sub) => {
    try {
      localStorage.setItem('pushSubscription', JSON.stringify(sub))
      console.log('💾 Subscrição guardada no localStorage')
    } catch (error) {
      console.error('❌ Erro ao guardar subscrição:', error)
    }
  }

  // Remover subscrição do localStorage
  const removeSubscriptionFromStorage = () => {
    try {
      localStorage.removeItem('pushSubscription')
      console.log('🗑️ Subscrição removida do localStorage')
    } catch (error) {
      console.error('❌ Erro ao remover subscrição:', error)
    }
  }

  const subscribeToPush = async () => {
    setIsLoading(true)
    setStatus('A subscrever...')
    
    try {
      const registration = await navigator.serviceWorker.ready
      
      // Pedir permissão
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Permissão para notificações negada')
      }

      // Criar subscrição
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      setSubscription(sub)
      saveSubscriptionToStorage(sub)
      setStatus('✅ Subscrito com sucesso!')
      
      console.log('🔔 Nova subscrição criada:', sub)
      
    } catch (error) {
      console.error('❌ Erro ao subscrever:', error)
      setStatus(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    if (!subscription) return

    setIsLoading(true)
    setStatus('A cancelar subscrição...')
    
    try {
      await subscription.unsubscribe()
      setSubscription(null)
      removeSubscriptionFromStorage()
      setStatus('✅ Subscrição cancelada!')
      
      console.log('🔕 Subscrição cancelada')
      
    } catch (error) {
      console.error('❌ Erro ao cancelar subscrição:', error)
      setStatus(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestNotification = async () => {
    if (!subscription) {
      setStatus('❌ Nenhuma subscrição ativa!')
      return
    }

    if (!message.trim()) {
      setStatus('❌ Escreve uma mensagem!')
      return
    }

    setIsLoading(true)
    setStatus('A enviar notificação...')
    
    try {
      const result = await sendNotification(subscription, message)
      
      if (result.success) {
        setStatus('✅ Notificação enviada!')
        setMessage('')
      } else {
        setStatus(`❌ Erro: ${result.error}`)
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error)
      setStatus(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            ❌ Push Notifications não suportadas
          </h1>
          <p className="text-red-500">
            O teu browser não suporta push notifications ou não estás em HTTPS.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            🔔 PWA Push Notifications
          </h1>

          {/* Estado da subscrição */}
          <div className="mb-6 p-4 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2">Estado:</h3>
            <p className={`text-sm ${subscription ? 'text-green-600' : 'text-orange-600'}`}>
              {subscription ? '✅ Subscrito às notificações' : '⚠️ Não subscrito'}
            </p>
          </div>

          {/* Botões de subscrição */}
          <div className="space-y-3 mb-6">
            {!subscription ? (
              <button
                onClick={subscribeToPush}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 
                         text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? '⏳ A subscrever...' : '🔔 Subscrever Notificações'}
              </button>
            ) : (
              <button
                onClick={unsubscribeFromPush}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 
                         text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? '⏳ A cancelar...' : '🔕 Cancelar Notificações'}
              </button>
            )}
          </div>

          {/* Enviar notificação teste */}
          {subscription && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Testar Notificação:</h3>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreve a tua mensagem..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendTestNotification}
                disabled={isLoading || !message.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 
                         text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? '⏳ A enviar...' : '📤 Enviar Notificação Teste'}
              </button>
            </div>
          )}

          {/* Status */}
          {status && (
            <div className="mt-4 p-3 rounded-lg bg-gray-100">
              <p className="text-sm text-gray-700">{status}</p>
            </div>
          )}

          {/* Instruções */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Como usar:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Clica "Subscrever Notificações"</li>
              <li>2. Aceita as permissões do browser</li>
              <li>3. Escreve uma mensagem de teste</li>
              <li>4. Clica "Enviar Notificação Teste"</li>
              <li>5. Vê a notificação aparecer! 🎉</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}