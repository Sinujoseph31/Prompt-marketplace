import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata = {
  title: 'Contact Us | Prompt4life',
  description: 'Have questions or feedback? Contact the Prompt4life team. We are here to help you with your prompt marketplace experience.',
}

export default function ContactPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <section className="w-full bg-muted/30 border-b py-20 px-5 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Get in Touch.</h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Whether you have a question about using the platform, need support with a prompt, or want to discuss a partnership, we're here to help.
        </p>
      </section>

      <div className="w-full max-w-6xl px-5 py-20 grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Contact info */}
        <div className="space-y-12">
            <div className="space-y-6">
                <h2 className="text-3xl font-bold">Contact Information</h2>
                <p className="text-muted-foreground text-lg">
                    We typicaly respond to all inquiries within 24-48 business hours. For immediate assistance, please check our FAQ page.
                </p>
            </div>

            <div className="space-y-8">
                <div className="flex items-start gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-1">Email Support</h4>
                        <p className="text-muted-foreground">support@prompt4life.com</p>
                        <p className="text-xs text-muted-foreground mt-1 italic">Best for general inquiries & support</p>
                    </div>
                </div>

                <div className="flex items-start gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-1">X (Twitter)</h4>
                        <p className="text-muted-foreground">@prompt4life</p>
                        <p className="text-xs text-muted-foreground mt-1 italic">Follow us for updates & tips</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Form */}
        <div className="bg-card border rounded-[2rem] p-8 md:p-12 shadow-sm">
            <h3 className="text-2xl font-bold mb-8">Send us a Message</h3>
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input placeholder="John Doe" className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input type="email" placeholder="john@example.com" className="rounded-xl" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="How can we help?" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea placeholder="Type your message here..." className="rounded-xl min-h-[150px]" />
                </div>
                <Button className="w-full py-6 rounded-xl font-bold text-lg">Send Message</Button>
            </form>
        </div>
      </div>
    </div>
  )
}
