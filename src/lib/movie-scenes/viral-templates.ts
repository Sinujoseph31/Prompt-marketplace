export interface ViralVideoTemplate {
    id: string;
    title: string;
    category: 'meme_reaction' | 'gaming_satisfying' | 'aesthetic_drive' | 'cinema_viral' | 'gym_motivation';
    categoryLabel: string;
    videoUrl: string;
    thumbnailUrl: string;
    tags: string[];
    vibe: string;
    defaultTopText: string;
    defaultBottomText: string;
    authorOrSource: string;
}

export const VIRAL_VIDEO_TEMPLATES: ViralVideoTemplate[] = [
    // --- 1. MEME & REACTION CLIPS ---
    {
        id: 'meme-pedro-pascal',
        title: 'Pedro Pascal Laughing to Crying',
        category: 'meme_reaction',
        categoryLabel: '😂 Meme Reactions',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        tags: ['pedro pascal', 'laughing', 'crying', 'regret', 'mood swing', 'exam', 'salary', 'realization'],
        vibe: 'Emotional Rollercoaster / Regret',
        defaultTopText: 'ME LOOKING AT MY SALARY CREDIT SMS',
        defaultBottomText: 'ME LOOKING AT MY PENDING BILLS 10 MINUTES LATER 😭',
        authorOrSource: 'Viral Meme Classic'
    },
    {
        id: 'meme-patrick-bateman',
        title: 'Patrick Bateman Sigma Walk',
        category: 'meme_reaction',
        categoryLabel: '😂 Meme Reactions',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
        tags: ['sigma', 'patrick bateman', 'headphones', 'walk', 'confidence', 'focus', 'main character'],
        vibe: 'Sigma Focus / Main Character Energy',
        defaultTopText: 'WHEN THE PHONK MUSIC DROPS IN MY HEADPHONES',
        defaultBottomText: 'WALKING INTO WORK LIKE I OWN THE COMPANY 🗿',
        authorOrSource: 'American Psycho / Sigma Meme'
    },
    {
        id: 'meme-leo-dicaprio',
        title: 'Leonardo DiCaprio Smug Toast & Laugh',
        category: 'meme_reaction',
        categoryLabel: '😂 Meme Reactions',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
        tags: ['leo dicaprio', 'cheers', 'drink', 'laugh', 'smug', 'great gatsby', 'victory', 'sarcastic'],
        vibe: 'Smug Celebration / Sarcasm',
        defaultTopText: 'WHEN EVERYONE IS STRESSED ABOUT THE TEST',
        defaultBottomText: 'AND I HAVEN\'T EVEN OPENED THE BOOK YET 🥂',
        authorOrSource: 'Django / Great Gatsby Meme'
    },
    {
        id: 'meme-walter-white',
        title: 'Walter White Devastated Collapse',
        category: 'meme_reaction',
        categoryLabel: '😂 Meme Reactions',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        tags: ['walter white', 'breaking bad', 'fall', 'collapse', 'shock', 'lost everything', 'sad'],
        vibe: 'Extreme Shock / Loss',
        defaultTopText: 'WHEN YOU CLOSE THE BROWSER TAB',
        defaultBottomText: 'WITH 4 HOURS OF UNSAVED WORK 💀',
        authorOrSource: 'Breaking Bad Meme'
    },
    {
        id: 'meme-steve-carell-no',
        title: 'Michael Scott "NO GOD PLEASE NO"',
        category: 'meme_reaction',
        categoryLabel: '😂 Meme Reactions',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
        tags: ['michael scott', 'the office', 'no god please no', 'panic', 'toby', 'disaster', 'monday'],
        vibe: 'Pure Panic & Regret',
        defaultTopText: 'POV: YOUR ALARM GOES OFF ON MONDAY MORNING',
        defaultBottomText: 'NO GOD PLEASE NO! NOOOOO! 😭',
        authorOrSource: 'The Office Meme'
    },

    // --- 2. GAMING & SATISFYING BACKGROUNDS ---
    {
        id: 'game-gta-mega-ramp',
        title: 'GTA 5 Impossible Mega Ramp Stunt',
        category: 'gaming_satisfying',
        categoryLabel: '🎮 Gaming & Satisfying',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
        tags: ['gta 5', 'ramp', 'car jump', 'satisfying', 'storytime background', 'reddit story', 'viral'],
        vibe: 'High Adrenaline / Retention Hook',
        defaultTopText: 'POV: YOU OVERTHINKING AT 3 AM',
        defaultBottomText: 'ABOUT A RANDOM MISTAKE FROM 2017 🏎️💨',
        authorOrSource: 'GTA Viral Clips'
    },
    {
        id: 'game-subway-surfers',
        title: 'Subway Surfers Infinite High Score',
        category: 'gaming_satisfying',
        categoryLabel: '🎮 Gaming & Satisfying',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        tags: ['subway surfers', 'satisfying', 'tiktok brain rot', 'gameplay background', 'reddit story'],
        vibe: 'Hypnotic / High Watchtime',
        defaultTopText: 'FACTS THAT WILL RUIN YOUR SLEEP TONIGHT',
        defaultBottomText: 'WAIT TILL THE LAST ONE 🤯',
        authorOrSource: 'Mobile Gaming Background'
    },
    {
        id: 'game-minecraft-parkour',
        title: 'Minecraft Neon Parkour Flow',
        category: 'gaming_satisfying',
        categoryLabel: '🎮 Gaming & Satisfying',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1627856014754-2907e2355d54?w=600&auto=format&fit=crop&q=80',
        tags: ['minecraft', 'parkour', 'satisfying', 'spiral jump', 'speedrun', 'story narration'],
        vibe: 'Smooth Movement / ASMR Flow',
        defaultTopText: 'THINGS WE ALL DID IN SCHOOL',
        defaultBottomText: 'DON\'T LIE, YOU DID THIS TOO 😂',
        authorOrSource: 'Minecraft Viral Creator'
    },

    // --- 3. AESTHETIC & NIGHT DRIVE ---
    {
        id: 'aes-cyberpunk-rain',
        title: 'Rainy Tokyo Cyberpunk Night Drive',
        category: 'aesthetic_drive',
        categoryLabel: '🌆 Aesthetic & Drive',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        tags: ['night drive', 'tokyo', 'cyberpunk', 'neon rain', 'aesthetic', 'deep quotes', 'lonely'],
        vibe: 'Atmospheric / Chill / Deep Quotes',
        defaultTopText: 'PEOPLE CHANGE, MEMORIES DON\'T.',
        defaultBottomText: 'LATE NIGHT THOUGHTS HIT DIFFERENT 🌧️✨',
        authorOrSource: 'Cinematic Aesthetic Loop'
    },
    {
        id: 'aes-sunset-highway',
        title: 'Golden Hour Highway Convertible Cruise',
        category: 'aesthetic_drive',
        categoryLabel: '🌆 Aesthetic & Drive',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop&q=80',
        tags: ['sunset', 'golden hour', 'highway', 'summer', 'vibes', 'roadtrip', 'nostalgia'],
        vibe: 'Nostalgic / Uplifting / Summer Vibes',
        defaultTopText: 'REMEMBER TO ENJOY THE JOURNEY',
        defaultBottomText: 'NOT JUST THE DESTINATION 🌅',
        authorOrSource: 'Sunset Drive Creator'
    },

    // --- 4. GYM & MOTIVATION ---
    {
        id: 'gym-heavy-deadlift',
        title: 'Dark Room Heavy Lift Focus',
        category: 'gym_motivation',
        categoryLabel: '⚡ Gym & Discipline',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
        tags: ['gym', 'deadlift', 'discipline', 'motivation', 'mindset', 'grind', 'hard work'],
        vibe: 'High Intensity / Mindset Grind',
        defaultTopText: 'THEY LAUGHED AT YOUR GOALS',
        defaultBottomText: 'MAKE THEM WONDER HOW YOU DID IT 🔱',
        authorOrSource: 'Fitness & Mindset'
    },

    // --- 5. REGIONAL & MALAYALAM VIRAL MOMENTS ---
    {
        id: 'reg-malayalam-sandesham',
        title: 'Sandesham Sreenivasan Geo-Politics Rant',
        category: 'cinema_viral',
        categoryLabel: '🎬 Regional & Cinema Moments',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
        tags: ['sreenivasan', 'sandesham', 'poland', 'malayalam comedy', 'troll', 'salary', 'deflection'],
        vibe: 'Classic Malayalam Sarcasm',
        defaultTopText: 'വീട്ടുകാർ ചോദിക്കുന്നു: "ശമ്പളം എന്ത് ചെയ്തു?"',
        defaultBottomText: 'ഞാൻ: "പോളണ്ടിനെ പറ്റി ഒരക്ഷരം മിണ്ടരുത്!" 😂',
        authorOrSource: 'Cult Malayalam Classic'
    },
    {
        id: 'reg-malayalam-spadikam-mass',
        title: 'Spadikam Aadu Thoma Ray-Ban Walk',
        category: 'cinema_viral',
        categoryLabel: '🎬 Regional & Cinema Moments',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
        tags: ['aadu thoma', 'mohanlal', 'mass', 'ray ban', 'spadikam', 'swagger', 'lalettan'],
        vibe: 'Iconic Mass Entry & Swagger',
        defaultTopText: 'WHEN YOU FINALLY FIX THAT PRODUCTION BUG',
        defaultBottomText: 'ENTERING THE CLIENT MEETING LIKE AADU THOMA 🔥🕶️',
        authorOrSource: 'Spadikam Mass Moment'
    }
];

export function getTemplatesByCategory(category?: string): ViralVideoTemplate[] {
    if (!category || category === 'all') return VIRAL_VIDEO_TEMPLATES;
    return VIRAL_VIDEO_TEMPLATES.filter(t => t.category === category);
}

export function searchTemplates(query: string): ViralVideoTemplate[] {
    const qLower = query.toLowerCase().trim();
    if (!qLower) return VIRAL_VIDEO_TEMPLATES;

    return VIRAL_VIDEO_TEMPLATES.filter(t => 
        t.title.toLowerCase().includes(qLower) ||
        t.vibe.toLowerCase().includes(qLower) ||
        t.defaultTopText.toLowerCase().includes(qLower) ||
        t.defaultBottomText.toLowerCase().includes(qLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(qLower))
    );
}
