import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onFinish: () => void
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1500)
    const finishTimer = setTimeout(onFinish, 2100)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinish])

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-white dark:bg-slate-950 transition-opacity duration-600 ease-out ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <span className="text-5xl sm:text-6xl font-extrabold tracking-tight animate-splash">
        Swop
      </span>
    </div>
  )
}
