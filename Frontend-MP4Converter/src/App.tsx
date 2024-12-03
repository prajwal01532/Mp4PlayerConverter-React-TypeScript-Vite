import { useState } from 'react'
import { Music } from 'lucide-react'
import MediaPlayer from './components/MediaPlayer'
import FileConverter from './components/FileConverter'

export default function App() {
  const [showMain, setShowMain] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900" />
      
      {!showMain ? (
        <button
          onClick={() => setShowMain(true)}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200 animate-pulse-slow" />
          <div className="relative flex items-center justify-center w-32 h-32 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors">
            <Music size={64} className="text-primary-400 group-hover:text-primary-300 transition-colors" />
          </div>
        </button>
      ) : (
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-200">
            MP4 to MP3 Converter
          </h1>
          <div className="space-y-8">
            <MediaPlayer />
            <FileConverter />
          </div>
        </div>
      )}
    </div>
  )
}
