import { useState, useRef, ChangeEvent } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export default function MediaPlayer() {
  const [file, setFile] = useState<File | null>(null)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
    }
  }

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value)
    setVolume(newVolume)
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Media Player</h2>
      <input
        type="file"
        accept=".mp4,.mkv,.mp3"
        onChange={handleFileSelect}
        className="mb-4"
      />
      {file && (
        <div className="mb-4">
          {file.type.startsWith('video') ? (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={URL.createObjectURL(file)}
              controls
              className="w-full max-w-3xl mx-auto"
            />
          ) : (
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={URL.createObjectURL(file)}
              controls
              className="w-full max-w-3xl mx-auto"
            />
          )}
          <div className="flex items-center mt-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="mr-2 flex-grow"
            />
            <button
              onClick={handleMuteToggle}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

