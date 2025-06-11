'use client'
import PushNotificationsDesktopMessage from './components/PushNotificationsDesktopMessage'
import PushNotificationManager from './components/PushNotificationManager'
import InstallPrompt from './components/InstallPrompt'
 
export default function Page() {

  console.log('Hello from MAC')
  return (
    <>
      <div className='flex flex-col gap-4 h-screen justify-center items-center block lg:hidden'>
        <PushNotificationManager />
        <InstallPrompt />
      </div>
      <div className='hidden lg:flex lg:block items-center justify-center h-screen'>
        <PushNotificationsDesktopMessage />
      </div>
    </>
  )
}