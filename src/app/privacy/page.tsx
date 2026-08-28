import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy | Prompt4life',
    description: 'Privacy Policy for Prompt4life, explaining how we collect and use your data.',
}

export default function PrivacyPolicy() {
    return (
        <div className="w-full min-h-screen bg-background flex flex-col items-center py-12 px-5">
            <div className="w-full max-w-4xl bg-card border rounded-2xl p-8 md:p-12 shadow-sm prose prose-sm sm:prose-base dark:prose-invert">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                <p>
                    Welcome to Prompt4life ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy.
                    If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.
                </p>

                <p>
                    When you visit our website and use any of our services (the "App"), we appreciate that you are trusting us with your personal information.
                    We take your privacy very seriously. In this privacy notice, we seek to explain to you in the clearest way possible what information we collect,
                    how we use it, and what rights you have in relation to it.
                </p>

                <h2>1. What information do we collect?</h2>
                <h3>Personal information you disclose to us</h3>
                <p>
                    <strong>In Short:</strong> We collect personal information that you provide to us.
                </p>
                <p>
                    We collect personal information that you voluntarily provide to us when you register on the App, express an interest in obtaining information about
                    us or our products and Services, when you participate in activities on the App, or otherwise when you contact us.
                </p>
                <ul>
                    <li><strong>Account Data:</strong> We collect your email address and name when you create an account via our authentication provider (Supabase).</li>
                    <li><strong>User-Generated Content:</strong> We collect the text prompts, descriptions, and preview images/videos you upload to our platform.</li>
                </ul>

                <h3>Information automatically collected</h3>
                <p>
                    <strong>In Short:</strong> Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our App.
                </p>
                <p>
                    We automatically collect certain information when you visit, use, or navigate the App. This information does not reveal your specific identity
                    (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics,
                    operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our App, and other
                    technical information.
                </p>

                <h2>2. How do we use your information?</h2>
                <p>
                    <strong>In Short:</strong> We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent.
                </p>
                <p>We use personal information collected via our App for a variety of business purposes described below:</p>
                <ul>
                    <li><strong>To facilitate account creation and logon process.</strong></li>
                    <li><strong>To post user-generated content:</strong> Your name and uploaded prompt data are displayed publicly on the marketplace.</li>
                    <li><strong>To serve advertising:</strong> We use Google AdSense to serve advertisements when you visit our website. Google and its third-party advertising partners use cookies (such as the DoubleClick DART cookie) to serve ads based on your prior visits to our website or other websites across the Internet. You may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary underline">aboutads.info</a>.</li>
                </ul>

                <h2>3. Cookies and Third-Party Advertising (Google AdSense)</h2>
                <p>
                    <strong>In Short:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website.
                </p>
                <ul>
                    <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.</li>
                    <li>Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary underline">www.aboutads.info</a>.</li>
                    <li>If you have not opted out of third-party ad serving, the cookies of other third-party vendors or ad networks may also be used to serve ads on our site.</li>
                </ul>

                <h2>4. Will your information be shared with anyone?</h2>
                <p>
                    <strong>In Short:</strong> We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                </p>
                <p>We may process or share your data that we hold based on the following legal basis:</p>
                <ul>
                    <li><strong>Third-Party Vendors:</strong> We share necessary data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf (e.g., Supabase for database hosting and authentication, Vercel for web hosting).</li>
                    <li><strong>Advertising Partners:</strong> We allow Google AdSense to place tracking tools (like cookies) on our App to tailor advertising to your interests according to Google AdSense program policies.</li>
                </ul>

                <h2>5. How long do we keep your information?</h2>
                <p>
                    <strong>In Short:</strong> We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.
                </p>
                <p>
                    We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
                </p>

                <h2>6. How do we keep your information safe?</h2>
                <p>
                    <strong>In Short:</strong> We aim to protect your personal information through a system of organizational and technical security measures.
                </p>
                <p>
                    We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process.
                    Your data is encrypted in transit using industry-standard HTTPS protocols, and our database provider (Supabase) implements strict Row Level Security (RLS) policies.
                </p>

                <h2>7. What are your privacy rights?</h2>
                <p>
                    <strong>In Short:</strong> You may review, change, or terminate your account at any time.
                </p>
                <p>
                    If you would at any time like to review or change the information in your account or terminate your account, you can log in to your account settings or contact us directly.
                    Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases.
                </p>

                <div className="mt-12 pt-8 border-t text-sm text-muted-foreground flex flex-col gap-2">
                    <p>By using Prompt4life, you consent to this Privacy Policy.</p>
                </div>
            </div>
        </div>
    )
}
