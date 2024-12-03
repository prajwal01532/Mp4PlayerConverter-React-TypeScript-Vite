import { useState, useRef } from 'react'

interface VideoPlayerProps {
  file: File
}

export default function VideoPlayer({ file }: VideoPlayerProps) {
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  return (
    <div className="mb-4">
      <video
        ref={videoRef}
        src={URL.createObjectURL(file)}
        controls
        className="w-full max-w-3xl mx-auto"
      />
      <div className="flex items-center mt-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="mr-2"
        />
        <button
          onClick={handleMuteToggle}
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  )
}

