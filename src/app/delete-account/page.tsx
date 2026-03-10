import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Delete Account | Prompt4life',
    description: 'Instructions on how to request deletion of your Prompt4life account and associated data.',
}

export default function DeleteAccount() {
    return (
        <div className="w-full min-h-[calc(100vh-64px)] bg-background flex flex-col items-center py-12 px-5">
            <div className="w-full max-w-2xl bg-card border rounded-2xl p-8 shadow-sm">
                <h1 className="text-3xl font-extrabold tracking-tight mb-4">Account Deletion Request</h1>
                
                <div className="prose prose-sm sm:prose-base dark:prose-invert">
                    <p className="text-muted-foreground mb-6">
                        We are sorry to see you go! If you would like to permanently delete your Prompt4life account and all associated data, please follow the instructions below.
                    </p>

                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-5 mb-8">
                        <h2 className="text-destructive font-semibold mt-0 mb-2">What happens when your account is deleted?</h2>
                        <ul className="text-sm">
                            <li>Your login credentials and profile information will be permanently erased.</li>
                            <li>All prompt submissions and generated content associated with your account will be removed from our database.</li>
                            <li>Any uploaded media or preview images linked exclusively to your account will be deleted from our storage servers.</li>
                            <li><strong>This action cannot be undone.</strong></li>
                        </ul>
                    </div>

                    <h3>How to request deletion:</h3>
                    <p>
                        To verify your identity and ensure the security of your account, deletion requests must be sent from the email address associated with your Prompt4life account.
                    </p>

                    <div className="bg-muted rounded-lg p-5 flex flex-col items-center text-center mt-6">
                        <p className="font-medium mb-2">Please send an email to our support team:</p>
                        <a 
                            href="mailto:support@prompt4life.com?subject=Account Deletion Request&body=Please delete my account and all associated data. My registered email address is: [Insert your email here]" 
                            className="text-lg font-bold text-primary hover:underline"
                        >
                            support@prompt4life.com
                        </a>
                        <p className="text-xs text-muted-foreground mt-4">
                            Please include "Account Deletion Request" in the subject line. We process all deletion requests within 7-14 business days.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
