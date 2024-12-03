import { useState, ChangeEvent } from 'react';
import { Download, Upload, Loader2, AlertCircle } from 'lucide-react';

interface ConversionError {
  message: string;
  show: boolean;
}

export default function FileConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<ConversionError>({ message: '', show: false });

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file size (500MB limit)
      if (selectedFile.size > 500 * 1024 * 1024) {
        setError({ message: 'File size must be less than 500MB', show: true });
        return;
      }
      
      // Check file type
      if (!['video/mp4', 'video/x-matroska'].includes(selectedFile.type)) {
        setError({ message: 'Only MP4 and MKV files are allowed', show: true });
        return;
      }

      setFile(selectedFile);
      setConvertedFileUrl(null);
      setError({ message: '', show: false });
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setConverting(true);
    setConvertedFileUrl(null);
    setError({ message: '', show: false });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();
      if (blob.size > 0) {
        const url = URL.createObjectURL(blob);
        setConvertedFileUrl(url);
      } else {
        throw new Error('Conversion failed - received empty file');
      }
    } catch (error) {
      console.error('Error during conversion:', error);
      setError({ 
        message: error instanceof Error ? error.message : 'Conversion failed', 
        show: true 
      });
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (convertedFileUrl && file) {
      const a = document.createElement('a');
      a.href = convertedFileUrl;
      a.download = `${file.name.split('.')[0]}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(convertedFileUrl);
      
      // Reset state after successful download
      setConvertedFileUrl(null);
      setFile(null);
      if (document.querySelector<HTMLInputElement>('input[type="file"]')) {
        document.querySelector<HTMLInputElement>('input[type="file"]')!.value = '';
      }
    }
  };

  return (
    <div className="card p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-primary-300">Convert to MP3</h2>
        <p className="text-gray-400 text-center text-sm">
          Upload your MP4 or MKV video file (max 500MB) and convert it to MP3
        </p>
      </div>

      {error.show && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="file"
          accept=".mp4,.mkv"
          onChange={handleFileSelect}
          className="input-file"
        />

        {file && (
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-300 truncate">
              Selected: {file.name}
            </p>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || converting}
          className={`btn-primary w-full flex items-center justify-center gap-2 ${
            !file || converting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {converting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Convert to MP3
            </>
          )}
        </button>

        {convertedFileUrl && (
          <button
            onClick={handleDownload}
            className="btn-secondary w-full flex items-center justify-center gap-2 animate-fade-in"
          >
            <Download className="w-5 h-5" />
            Download MP3
          </button>
        )}
      </div>
    </div>
  );
}
