'use client'
import PushNotificationManager from './components/PushNotificationManager'
import InstallPrompt from './components/InstallPrompt'
 
export default function Page() {

  console.log('Hello from MAC')
  return (
    <div className='flex flex-col gap-4 h-screen justify-center items-center'>
      <PushNotificationManager />
      <InstallPrompt />
    </div>
  )
}