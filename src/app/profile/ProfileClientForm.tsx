'use client'

import { useState, useRef } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { SubmitButton } from '@/components/SubmitButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSearchParams } from 'next/navigation'
import { Camera, AlertCircle, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

export default function ProfileClientForm({ profile }: { profile: any }) {
    const searchParams = useSearchParams()
    const errorMsg = searchParams.get('error')
    const successMsg = searchParams.get('message')

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null)

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Create a preview URL immediately so the user sees the change before saving
            const objectUrl = URL.createObjectURL(file)
            setAvatarPreview(objectUrl)
        }
    }

    return (
        <form action={updateProfile} className="p-6 sm:p-8 space-y-8">
            {errorMsg && (
                <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-md flex items-center gap-2 font-medium">
                    <AlertCircle className="h-5 w-5" />
                    {errorMsg}
                </div>
            )}
            
            {successMsg && (
                <div className="bg-green-500/15 text-green-600 dark:text-green-400 text-sm p-4 rounded-md flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    {successMsg}
                </div>
            )}

            {/* Avatar Upload Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/50">
                <div 
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-background bg-muted flex items-center justify-center relative shadow-sm transition-transform group-hover:scale-105">
                        {avatarPreview ? (
                            <Image 
                                src={avatarPreview} 
                                alt="Avatar Preview" 
                                fill 
                                className="object-cover"
                            />
                        ) : (
                            <Camera className="w-8 h-8 text-muted-foreground opacity-50" />
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
                
                <div className="text-center sm:text-left space-y-2">
                    <h3 className="font-semibold text-lg">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        JPG, GIF or PNG. 1MB max. Click the image to upload a new one.
                    </p>
                    <Input 
                        type="file" 
                        name="avatar" 
                        id="avatar" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                    />
                </div>
            </div>

            {/* Profile Details Sections */}
            <div className="space-y-4">
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
                        Will be displayed on your public storefront. Keep it brief and professional.
                    </p>
                </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
                <SubmitButton
                    defaultText="Save Changes"
                    loadingText="Saving..."
                    size="lg"
                    className="w-full sm:w-auto min-w-[150px]"
                />
            </div>
        </form>
    )
}
