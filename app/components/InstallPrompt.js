'use client'
import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
 
  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window).MSStream
    )
 
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    // Handle the beforeinstallprompt event for Android/Desktop
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired')
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Store the event so it can be triggered later
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // Handle the appinstalled event
    const handleAppInstalled = (e) => {
      console.log('PWA was installed')
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      // For iOS, we can't programmatically trigger install, so just show instructions
      return
    }

    if (!deferredPrompt) {
      console.log('No deferred prompt available')
      return
    }

    setIsInstalling(true)

    try {
      // Show the install prompt
      await deferredPrompt.prompt()
     
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
     
      console.log(`User response to the install prompt: ${outcome}`)
     
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
     
      // Clear the deferred prompt
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('Error during installation:', error)
    } finally {
      setIsInstalling(false)
    }
  }
 
  if (isStandalone) {
    return null // Don't show install button if already installed
  }

  // For Android/Desktop, only show if we have a deferred prompt or if it's iOS
  if (!isIOS && !showInstallPrompt) {
    return null
  }
 
  return (
    <div className='bg-gray-200 p-4 rounded-lg shadow-md flex flex-col gap-4 items-center'>
      <h1>Install App</h1>
      {isIOS && (
        <p className="text-center text-sm text-gray-600">
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {' '}
            ⎋{' '}
          </span>
          and then "Add to Home Screen"
          <span role="img" aria-label="plus icon">
            {' '}
            ➕{' '}
          </span>.
        </p>
      )}
      {!isIOS && showInstallPrompt && (
        <p className="text-center">
          Click the button to install this app on your device for a better experience!
        </p>
      )}
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isInstalling
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isInstalling ? 'Installing...' : 'Add to Home Screen'}
      </button>
    </div>
  )
}