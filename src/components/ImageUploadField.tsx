'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default function ImageUploadField() {
    const [filePreviews, setFilePreviews] = useState<{ url: string, name: string }[]>([])
    const [urlPreviews, setUrlPreviews] = useState<string[]>([])

    // primaryType is 'file' or 'url', primaryIndex is the index within that array
    const [primaryType, setPrimaryType] = useState<'file' | 'url'>('file')
    const [primaryIndex, setPrimaryIndex] = useState<number>(0)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            const previews = files.map(file => ({
                url: URL.createObjectURL(file),
                name: file.name
            }))
            setFilePreviews(previews)
            if (previews.length > 0 && urlPreviews.length === 0) {
                setPrimaryType('file')
                setPrimaryIndex(0)
            }
        }
    }

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const urls = value.split(',').map(s => s.trim()).filter(s => s.length > 0)
        setUrlPreviews(urls)
        if (urls.length > 0 && filePreviews.length === 0) {
            setPrimaryType('url')
            setPrimaryIndex(0)
        }
    }

    return (
        <div className="grid gap-2">
            <div className="flex justify-between items-end">
                <Label>Preview Images</Label>
                <span className="text-xs text-muted-foreground mr-1">Click an image below to set as Primary Display</span>
            </div>

            {/* Hidden inputs to pass primary selection to server action */}
            <input type="hidden" name="primary_image_type" value={primaryType} />
            <input type="hidden" name="primary_image_index" value={primaryIndex} />

            <div className="flex flex-col gap-4 p-4 border rounded-xl bg-muted/10 shadow-sm">
                <div className="grid gap-2">
                    <Label htmlFor="preview_files" className="text-sm text-foreground">Upload from Device (Multiple allowed)</Label>
                    <Input id="preview_files" name="preview_files" type="file" accept="image/*" multiple className="cursor-pointer" onChange={handleFileChange} />
                </div>

                {filePreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-2">
                        {filePreviews.map((file, idx) => (
                            <div
                                key={idx}
                                onClick={() => { setPrimaryType('file'); setPrimaryIndex(idx); }}
                                className={`relative aspect-[4/3] rounded-md overflow-hidden cursor-pointer transition-all ${primaryType === 'file' && primaryIndex === idx ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]' : 'hover:opacity-80 border'}`}
                            >
                                <img src={file.url} alt={`File ${idx + 1}`} className="w-full h-full object-cover" />
                                {primaryType === 'file' && primaryIndex === idx && (
                                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded shadow-sm uppercase font-bold tracking-wider">
                                        Primary
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">or</span>
                    <div className="h-px bg-border flex-1"></div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="preview_image_urls" className="text-sm text-foreground">Paste Image URLs (Comma separated)</Label>
                    <Input id="preview_image_urls" name="preview_image_urls" type="text" placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" onChange={handleUrlChange} />
                </div>

                {urlPreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-2">
                        {urlPreviews.map((url, idx) => (
                            <div
                                key={idx}
                                onClick={() => { setPrimaryType('url'); setPrimaryIndex(idx); }}
                                className={`relative aspect-[4/3] rounded-md overflow-hidden cursor-pointer transition-all ${primaryType === 'url' && primaryIndex === idx ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]' : 'hover:opacity-80 border'}`}
                            >
                                <img src={url} alt={`URL ${idx + 1}`} className="w-full h-full object-cover" />
                                {primaryType === 'url' && primaryIndex === idx && (
                                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded shadow-sm uppercase font-bold tracking-wider">
                                        Primary
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
