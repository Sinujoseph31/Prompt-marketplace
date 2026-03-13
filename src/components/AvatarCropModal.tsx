'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { X, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react'

interface AvatarCropModalProps {
    imageSrc: string          // Data URL of the selected image
    onCropComplete: (croppedFile: File) => void
    onCancel: () => void
    originalFileName: string
}

// Utility: Read a crop area from a canvas and return it as a File
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    rotation: number = 0,
    originalFileName: string
): Promise<File> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('Canvas not supported')

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    // Draw a large enough canvas for rotation
    canvas.width = safeArea
    canvas.height = safeArea

    // Translate & rotate
    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    // Draw image centered on the large canvas
    ctx.drawImage(
        image,
        safeArea / 2 - image.width / 2,
        safeArea / 2 - image.height / 2
    )

    // Extract cropped region
    const data = ctx.getImageData(
        pixelCrop.x + safeArea / 2 - image.width / 2,
        pixelCrop.y + safeArea / 2 - image.height / 2,
        pixelCrop.width,
        pixelCrop.height
    )

    // Use a final canvas at exact crop dimensions
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    ctx.putImageData(data, 0, 0)

    // Scale to max 400x400 for avatars at max quality
    const OUTPUT_SIZE = 400
    const out = document.createElement('canvas')
    out.width = OUTPUT_SIZE
    out.height = OUTPUT_SIZE
    const outCtx = out.getContext('2d')!
    outCtx.drawImage(canvas, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    return new Promise((resolve, reject) => {
        out.toBlob((blob) => {
            if (!blob) return reject(new Error('Canvas toBlob failed'))
            const safeName = originalFileName.replace(/\.[^/.]+$/, '') + '_crop.jpeg'
            resolve(new File([blob], safeName, { type: 'image/jpeg' }))
        }, 'image/jpeg', 0.92)
    })
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', reject)
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
    })
}

export default function AvatarCropModal({
    imageSrc,
    onCropComplete,
    onCancel,
    originalFileName,
}: AvatarCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const onCropChange = useCallback((c: { x: number; y: number }) => {
        setCrop(c)
    }, [])

    const onZoomChange = useCallback((z: number) => {
        setZoom(z)
    }, [])

    const onCropCompleteInternal = useCallback(
        (_: Area, croppedPixels: Area) => {
            setCroppedAreaPixels(croppedPixels)
        },
        []
    )

    const handleApply = async () => {
        if (!croppedAreaPixels) return
        setIsProcessing(true)
        try {
            const file = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, originalFileName)
            onCropComplete(file)
        } catch (e) {
            console.error('Crop error:', e)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        // Backdrop
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="text-base font-semibold">Crop Profile Photo</h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-muted"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative w-full" style={{ height: 320 }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteInternal}
                        classes={{
                            containerClassName: 'rounded-none',
                            mediaClassName: 'rounded-none',
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-4 px-5 py-4 border-t border-border bg-muted/30">
                    {/* Zoom Slider */}
                    <div className="flex items-center gap-3">
                        <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-2 rounded-full accent-primary cursor-pointer"
                        />
                        <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>

                    {/* Rotation */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">Rotate</span>
                        <div className="flex gap-1">
                            {[-90, -45, -15, 15, 45, 90].map((deg) => (
                                <button
                                    key={deg}
                                    type="button"
                                    onClick={() => setRotation((r) => r + deg)}
                                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted-foreground/20 px-2 py-1 rounded transition-colors"
                                >
                                    {deg > 0 ? `+${deg}°` : `${deg}°`}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setRotation(0)}
                                className="text-[11px] font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors"
                                title="Reset rotation"
                            >
                                <RotateCw className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-5 py-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button type="button" className="flex-1" onClick={handleApply} disabled={isProcessing}>
                        {isProcessing ? (
                            'Processing...'
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-1.5" />
                                Apply Crop
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
