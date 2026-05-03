'use client'

import { useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageFile {
  file: File
  preview: string
}

interface Props {
  images: ImageFile[]
  onChange: (images: ImageFile[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, onChange, maxImages = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newImages = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, maxImages - images.length)
      .map(file => ({ file, preview: URL.createObjectURL(file) }))
    onChange([...images, ...newImages])
  }

  function remove(index: number) {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
      >
        <Upload className="mx-auto mb-2 text-blue-400" size={28} />
        <p className="text-sm text-gray-600">Clique ou arraste os prints aqui</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — até {maxImages} imagens</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt={`print ${i + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
