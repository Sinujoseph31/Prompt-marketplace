'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'

const CATEGORIES: Record<string, string[]> = {
    'Models': ['ChatGPT Prompts', 'Claude Prompts', 'Gemini Prompts', 'DeepSeek Prompts', 'MidJourney Prompts', 'DALL‑E Prompts', 'Stable Diffusion Prompts', 'Other AI Models'],
    'Art & Illustrations': ['Drawing & Sketches', 'Cartoons & Comics', 'Painting Styles (gouache, pop art, surrealism)', 'Character & Portrait Art', 'Fantasy & Surrealism', 'Decorative Art (coloring books, posters, stickers)', 'Experimental & Mixed Media'],
    'Logos & Icons': ['All'],
    'Graphics & Design': ['Posters & Flyers', 'Infographics', 'UI/UX Elements', 'Profile Picture'],
    'Productivity & Writing': ['Copywriting Prompts', 'Blog/Article Generation', 'Email Templates', 'Task Management & Workflow Prompts'],
    'Marketing & Business': ['Social Media Content', 'Ad Copy Generation', 'Branding Concepts', 'Business Pitch Decks'],
    'Photography': ['Portrait Styles', 'Landscape Prompts', 'Product Photography', 'Cinematic Photography'],
    'Games & 3D': ['Character Models', 'Environment/World Design', 'Game Asset Packs', '3D Object Rendering']
}

// Fallback for any model not explicitly defined
const DEFAULT_CATEGORIES = ['Other']

export default function CategorySelector({ defaultCategory, defaultSubcategory }: { defaultCategory?: string, defaultSubcategory?: string }) {
    const mainCategories = Object.keys(CATEGORIES)
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory || mainCategories[0])

    // If a default Subcategory is passed and it belongs to the selected category, use it. Otherwise use the first one available.
    const availableSubcategories = CATEGORIES[selectedCategory] || DEFAULT_CATEGORIES
    const initialSubcategory = defaultSubcategory && availableSubcategories.includes(defaultSubcategory)
        ? defaultSubcategory
        : availableSubcategories[0]

    const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory)

    return (
        <div className="grid gap-6">
            <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select
                    id="category"
                    name="category"
                    required
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    {mainCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <select
                    id="subcategory"
                    name="subcategory"
                    required
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    {availableSubcategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}
