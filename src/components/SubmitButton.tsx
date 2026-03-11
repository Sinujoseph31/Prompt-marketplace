'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Define a type for size that matches the Shadcn Button sizes
type ButtonSize = "default" | "sm" | "lg" | "icon" | null | undefined;
type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    defaultText: string
    loadingText?: string
    size?: ButtonSize
    variant?: ButtonVariant
}

export function SubmitButton({ 
    defaultText, 
    loadingText = "Processing...", 
    className, 
    variant, 
    size, 
    ...props 
}: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button 
            type="submit" 
            disabled={pending || props.disabled} 
            className={className} 
            variant={variant}
            size={size}
            {...props}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingText}
                </>
            ) : (
                defaultText
            )}
        </Button>
    )
}
