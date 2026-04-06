/**
 * Utility to generate deep-links for various AI interfaces based on prompt text and categories.
 */

export const getAiInterfaceUrl = (
    promptText: string,
    category?: string,
    subcategory?: string
): string | null => {
    if (!promptText) return null;

    const sub = subcategory?.toLowerCase() || '';
    const cat = category?.toLowerCase() || '';
    const encodedPrompt = encodeURIComponent(promptText);

    // Subcategory-based matching (Highest specificity)
    if (sub.includes('chatgpt')) return `https://chatgpt.com/?q=${encodedPrompt}`;
    if (sub.includes('claude')) return `https://claude.ai/`;
    if (sub.includes('gemini')) return `https://gemini.google.com/app?q=${encodedPrompt}`;
    if (sub.includes('deepseek')) return `https://chat.deepseek.com/`;
    if (sub.includes('midjourney')) return `https://www.midjourney.com/`;
    if (sub.includes('dall-e') || sub.includes('dalle')) return `https://chatgpt.com/`;
    if (sub.includes('stable diffusion')) return `https://dreamstudio.ai/`;

    // Category-based matching
    if (cat.includes('models')) {
        // Fallback for general models category
        return `https://chatgpt.com/?q=${encodedPrompt}`;
    }

    // Default fallback to ChatGPT as the most universal interface
    return `https://chatgpt.com/?q=${encodedPrompt}`;
};
