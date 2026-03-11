'use client'

import { useState, useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

export default function ImageUploadField({ defaultUrls = [] }: { defaultUrls?: string[] }) {
    const [accumulatedFiles, setAccumulatedFiles] = useState<File[]>([])
    const [filePreviews, setFilePreviews] = useState<{ url: string, name: string, size: number }[]>([])
    const [urlPreviews, setUrlPreviews] = useState<string[]>(defaultUrls)

    // Ref to the hidden input that actually submits the form
    const hiddenInputRef = useRef<HTMLInputElement>(null)

    // primaryType is 'file' or 'url', primaryIndex is the index within that array
    const [primaryType, setPrimaryType] = useState<'file' | 'url'>('file')
    const [primaryIndex, setPrimaryIndex] = useState<number>(0)

    // Sync state files to the hidden input whenever they change
    useEffect(() => {
        if (hiddenInputRef.current) {
            const dt = new DataTransfer()
            accumulatedFiles.forEach(file => dt.items.add(file))
            hiddenInputRef.current.files = dt.files
        }

        // Generate preview URLs when files update
        const previews = accumulatedFiles.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size
        }))
        setFilePreviews(previews)

        // Cleanup object URLs to avoid memory leaks
        return () => {
            previews.forEach(p => URL.revokeObjectURL(p.url))
        }
    }, [accumulatedFiles])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)

            // Add new files to our accumulated state (Additive upload)
            setAccumulatedFiles(prev => {
                const updated = [...prev, ...newFiles]
                // If it's the first batch of files, set it as primary
                if (prev.length === 0 && urlPreviews.length === 0) {
                    setPrimaryType('file')
                    setPrimaryIndex(0)
                }
                return updated
            })

            // Reset the visible input so the same file could technically be picked again if needed, 
            // but more importantly so the "No file chosen" visual resets visually to allow adding more cleanly.
            e.target.value = ''
        }
    }

    const removeFile = (e: React.MouseEvent, indexToRemove: number) => {
        e.stopPropagation() // Prevent triggering the primary selection click
        setAccumulatedFiles(prev => {
            const newFiles = prev.filter((_, idx) => idx !== indexToRemove)
            // Adjust primary target if needed
            if (primaryType === 'file') {
                if (primaryIndex === indexToRemove) {
                    setPrimaryIndex(0)
                    if (newFiles.length === 0 && urlPreviews.length === 0) {
                        // Nothing selected
                    } else if (newFiles.length === 0 && urlPreviews.length > 0) {
                        setPrimaryType('url')
                    }
                } else if (primaryIndex > indexToRemove) {
                    setPrimaryIndex(primaryIndex - 1)
                }
            }
            return newFiles
        })
    }

    const removeUrl = (e: React.MouseEvent, indexToRemove: number) => {
        e.stopPropagation()
        setUrlPreviews(prev => {
            const newUrls = prev.filter((_, idx) => idx !== indexToRemove)
            if (primaryType === 'url') {
                if (primaryIndex === indexToRemove) {
                    setPrimaryIndex(0)
                    if (newUrls.length === 0 && accumulatedFiles.length > 0) {
                        setPrimaryType('file')
                    }
                } else if (primaryIndex > indexToRemove) {
                    setPrimaryIndex(primaryIndex - 1)
                }
            }
            return newUrls
        })
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const totalFileSize = filePreviews.reduce((sum, file) => sum + file.size, 0)

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (!value.trim()) return

        const urls = value.split(',').map(s => s.trim()).filter(s => s.length > 0)

        // Additive URL appending
        setUrlPreviews(prev => {
            const newUrls = [...prev, ...urls]
            if (newUrls.length > 0 && filePreviews.length === 0 && prev.length === 0) {
                setPrimaryType('url')
                setPrimaryIndex(0)
            }
            return newUrls
        })

        // Clear input after processing
        e.target.value = ''
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
                    <div className="flex justify-between items-end">
                        <Label htmlFor="preview_files_visible" className="text-sm text-foreground">Upload from Device (Add Multiple)</Label>
                        {filePreviews.length > 0 && (
                            <span className={`text-xs font-semibold ${totalFileSize > 150 * 1024 * 1024 ? 'text-destructive' : 'text-primary'}`}>
                                Total Size: {formatSize(totalFileSize)} / 150 MB
                            </span>
                        )}
                    </div>
                    {/* The visible input just gathers files for our state */}
                    <Input id="preview_files_visible" type="file" accept="image/*" multiple className="cursor-pointer" onChange={handleFileChange} />
                    {/* The hidden input holds the actual Form Submission payload via DataTransfer */}
                    <input id="preview_files" name="preview_files" type="file" accept="image/*" multiple ref={hiddenInputRef} className="hidden" />
                </div>

                {filePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-2">
                        {filePreviews.map((file, idx) => (
                            <div
                                key={idx}
                                onClick={() => { setPrimaryType('file'); setPrimaryIndex(idx); }}
                                className={`relative group aspect-[4/3] rounded-md overflow-hidden cursor-pointer transition-all ${primaryType === 'file' && primaryIndex === idx ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]' : 'hover:opacity-80 border'}`}
                            >
                                <img src={file.url} alt={`File ${idx + 1}`} className="w-full h-full object-cover" />

                                {/* Overlay gradient for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                                {/* File Size Label */}
                                <div className="absolute bottom-1 right-1 text-[10px] text-white font-medium bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                    {formatSize(file.size)}
                                </div>

                                {/* Delete Button overlay */}
                                <button
                                    type="button"
                                    onClick={(e) => removeFile(e, idx)}
                                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-destructive text-white rounded-full transition-colors z-10"
                                    title="Remove Image"
                                >
                                    <X className="w-3 h-3" strokeWidth={3} />
                                </button>

                                {primaryType === 'file' && primaryIndex === idx && (
                                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded shadow-sm uppercase font-bold tracking-wider z-10 pointer-events-none">
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
                    <Label htmlFor="preview_image_urls_visible" className="text-sm text-foreground">Paste Image URLs (Comma separated)</Label>
                    {/* Use a simple text input. We listen to "Blur" or "Enter" to add the URL so we can clear it additively. */}
                    <Input
                        id="preview_image_urls_visible"
                        type="text"
                        placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg ..."
                        onBlur={handleUrlChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleUrlChange(e as any);
                            }
                        }}
                    />
                    {/* Hidden input to pass the actual comma list to the server */}
                    <input type="hidden" name="preview_image_urls" value={urlPreviews.join(',')} />
                </div>

                {urlPreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-2">
                        {urlPreviews.map((url, idx) => (
                            <div
                                key={idx}
                                onClick={() => { setPrimaryType('url'); setPrimaryIndex(idx); }}
                                className={`relative group aspect-[4/3] rounded-md overflow-hidden cursor-pointer transition-all ${primaryType === 'url' && primaryIndex === idx ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]' : 'hover:opacity-80 border'}`}
                            >
                                <img src={url} alt={`URL ${idx + 1}`} className="w-full h-full object-cover" />

                                <button
                                    type="button"
                                    onClick={(e) => removeUrl(e, idx)}
                                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-destructive text-white rounded-full transition-colors z-10"
                                    title="Remove URL"
                                >
                                    <X className="w-3 h-3" strokeWidth={3} />
                                </button>

                                {primaryType === 'url' && primaryIndex === idx && (
                                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded shadow-sm uppercase font-bold tracking-wider z-10 pointer-events-none">
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
