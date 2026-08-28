import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: 'Frequently Asked Questions | Prompt4life',
  description: 'Find answers to common questions about using AI prompts, our points system, and how to get the best results from ChatGPT and Midjourney.',
}

const faqs = [
    {
        category: "General",
        items: [
            {
                q: "What is a prompt marketplace?",
                a: "A prompt marketplace is a platform where users can find, share, and buy high-quality instructions (prompts) used to generate specific outputs from AI models like ChatGPT, Midjourney, and Stable Diffusion."
            },
            {
                q: "How do I use these prompts?",
                a: "Once you find a prompt you like, you can copy the text and paste it into the respective AI model's interface. Some prompts require you to fill in variables (indicated by brackets like [topic]) to customize the output."
            },
            {
                q: "Is Prompt4life free?",
                a: "Yes, currently all prompts on Prompt4life are free to access. We use a points system that allows you to unlock premium content by contributing to the community or participating in site activities."
            }
        ]
    },
    {
        category: "Prompt Quality",
        items: [
            {
                q: "How do you ensure prompt quality?",
                a: "Every prompt submitted to Prompt4life is manually reviewed by our moderation team. We check for clarity, reliability, and whether the prompt actually produces the results described in its preview images."
            },
            {
                q: "What makes a 'good' prompt?",
                a: "A good prompt is specific, provides context, and often uses advanced techniques like role-playing, step-by-step instructions, or style references to guide the AI toward a high-quality result."
            }
        ]
    },
    {
        category: "Points & Account",
        items: [
            {
                q: "How do I earn points?",
                a: "You can earn points by submitting high-quality AI prompts that get approved, sharing prompt engineering tips, and participating in the creator community."
            },
            {
                q: "Can I sell my own prompts?",
                a: "We are currently in a beta phase where most content is shared. However, we plan to launch a seller program soon where top prompt engineers can earn rewards for their expertise."
            }
        ]
    }
]

export default function FaqPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <section className="w-full bg-muted/30 border-b py-20 px-5 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">FAQ.</h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Everything you need to know about the platform and mastering the art of AI prompting.
        </p>
      </section>

      <div className="w-full max-w-4xl px-5 py-20 flex flex-col gap-16">
        {faqs.map((group, i) => (
            <div key={i} className="space-y-6">
                <h2 className="text-2xl font-bold border-b pb-2">{group.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                    {group.items.map((item, j) => (
                        <AccordionItem key={j} value={`${i}-${j}`} className="border-none mb-4">
                            <AccordionTrigger className="text-left text-lg font-semibold bg-card border rounded-2xl px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors data-[state=open]:rounded-b-none">
                                {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-md leading-relaxed bg-card border border-t-0 rounded-b-2xl px-6 py-6 border-muted-foreground/10">
                                {item.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        ))}

        <div className="bg-primary/5 rounded-[2.5rem] p-10 border border-primary/20 text-center">
            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">Can't find the answer you're looking for? Reach out to our team.</p>
            <a href="/contact" className="inline-block bg-primary text-primary-foreground font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors">
                Contact Support
            </a>
        </div>
      </div>
    </div>
  )
}
