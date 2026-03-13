'use client'

import { useState, useRef } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { SubmitButton } from '@/components/SubmitButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { Camera, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import AvatarCropModal from '@/components/AvatarCropModal'

export default function ProfileClientForm({ profile }: { profile: any }) {
    const searchParams = useSearchParams()
    const errorMsg = searchParams.get('error')
    const successMsg = searchParams.get('message')

    const fileInputRef = useRef<HTMLInputElement>(null)

    // The final saved avatar (from Supabase or after cropping)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null)
    // The File object to send to server
    const [avatarFile, setAvatarFile] = useState<File | null>(null)

    // Crop modal state
    const [cropSrc, setCropSrc] = useState<string | null>(null)       // raw data url before crop
    const [cropFileName, setCropFileName] = useState('')

    // When user picks a file, read it and show the crop modal instead of saving immediately
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.')
            return
        }

        // Read the file and open the crop modal
        const reader = new FileReader()
        reader.onload = (event) => {
            setCropSrc(event.target?.result as string)
            setCropFileName(file.name)
        }
        reader.readAsDataURL(file)

        // Reset native input so same file can be re-selected later
        e.target.value = ''
    }

    // Called when user confirms the crop
    const handleCropComplete = (croppedFile: File) => {
        setAvatarFile(croppedFile)
        setAvatarPreview(URL.createObjectURL(croppedFile))
        setCropSrc(null) // close modal
    }

    const handleCancelCrop = () => {
        setCropSrc(null)
    }

    const handleRemoveAvatar = () => {
        setAvatarPreview(null)
        setAvatarFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    // Intercept form action to safely append the cropped file to FormData (avoids DataTransfer/mobile issues)
    const handleAction = async (formData: FormData) => {
        if (avatarFile) {
            formData.set('avatar', avatarFile)
        } else if (!avatarPreview && profile.avatar_url) {
            formData.set('remove_avatar', 'true')
        }
        await updateProfile(formData)
    }

    return (
        <>
            {/* Crop Modal - renders above everything when active */}
            {cropSrc && (
                <AvatarCropModal
                    imageSrc={cropSrc}
                    originalFileName={cropFileName}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCancelCrop}
                />
            )}

            <form action={handleAction} className="p-6 sm:p-8 space-y-8">
                {errorMsg && (
                    <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-md flex items-center gap-2 font-medium">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="bg-green-500/15 text-green-600 dark:text-green-400 text-sm p-4 rounded-md flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        {successMsg}
                    </div>
                )}

                {/* Avatar Upload Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-border/50">
                    {/* Avatar Circle */}
                    <div className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="relative group w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-background bg-muted flex items-center justify-center shadow-md transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 cursor-pointer"
                            title="Click to change profile picture"
                        >
                            {avatarPreview ? (
                                <Image
                                    src={avatarPreview}
                                    alt="Avatar Preview"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <Camera className="w-10 h-10 text-muted-foreground opacity-40" />
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                                <span className="text-white text-[11px] font-semibold">
                                    {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                                </span>
                            </div>
                        </button>

                        {/* Remove button */}
                        {avatarPreview && (
                            <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                title="Remove profile picture"
                                className="absolute -bottom-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-md transition-transform hover:scale-110"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}

                        {/* Hidden file input */}
                        <Input
                            type="file"
                            id="avatar_input"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                        />
                    </div>

                    {/* Instructions */}
                    <div className="text-center sm:text-left space-y-2 sm:pt-2">
                        <h3 className="font-semibold text-lg">Profile Picture</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Click the circle to select a photo. You can crop, zoom, and rotate it before saving.
                        </p>
                        {avatarFile && (
                            <p className="text-xs font-medium text-primary flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                New photo ready — click Save to apply
                            </p>
                        )}
                        {!avatarPreview && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-1"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Upload Photo
                            </Button>
                        )}
                    </div>
                </div>

                {/* Profile Details */}
                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={profile.name || ''}
                            placeholder="e.g. PromptMaster99"
                            required
                            className="max-w-md"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Biography</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            defaultValue={profile.bio || ''}
                            placeholder="Tell the community a bit about yourself and what you create..."
                            rows={4}
                            className="resize-y"
                        />
                        <p className="text-xs text-muted-foreground">
                            Displayed on your public storefront. Keep it brief and professional.
                        </p>
                    </div>
                </div>

                <div className="pt-2 flex items-center gap-4">
                    <SubmitButton
                        defaultText="Save Changes"
                        loadingText="Saving..."
                        size="lg"
                        className="w-full sm:w-auto min-w-[150px]"
                    />
                </div>
            </form>
        </>
    )
}
