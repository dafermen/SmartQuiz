import { useEffect } from 'react'
import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { configureNativeMobileApp } from "@/components/mobile/mobileApp"
import { registerServiceWorker } from "@/components/mobile/pwa"
import { configureDailyReminder } from "@/components/mobile/notifications"

/**
 * Root React component.
 *
 * @returns {JSX.Element}
 */
function App() {
  useEffect(() => {
    configureNativeMobileApp()
    registerServiceWorker()
    configureDailyReminder()

    const handleMobileSettingsUpdate = () => configureDailyReminder()
    window.addEventListener("smartquiz-mobile-settings-updated", handleMobileSettingsUpdate)
    return () => window.removeEventListener("smartquiz-mobile-settings-updated", handleMobileSettingsUpdate)
  }, [])

  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App 
