export interface VideoClip {
    id: string;
    title: string;
    category: string;
    categoryLabel: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: string;
    quality: string;
    language?: string;
    movieOrShow?: string;
    actors?: string[];
    description: string;
    dialogue?: string;
    tags: string[];
    downloadsCount: number;
}

export const VIDEO_CLIPS_COLLECTION: VideoClip[] = [
    // --- 1. MOVIE & CINEMA MOMENTS ---
    {
        id: 'clip-sandesham-poland',
        title: 'Polandine Patti Oraksharam Mindaruth',
        category: 'cinema_regional',
        categoryLabel: '🎬 Cinema & Movies',
        movieOrShow: 'Sandesham (1991)',
        language: 'Malayalam',
        actors: ['Sreenivasan', 'Thilakan'],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
        duration: '0:35',
        quality: '1080p HD',
        description: 'Sreenivasan famously deflects a family question with his iconic political speech about Poland.',
        dialogue: 'പോളിനെ കുറിച്ച് ഒരക്ഷരം മിണ്ടരുത്! (Polandine patti oraksharam mindaruth!)',
        tags: ['malayalam', 'sandesham', 'sreenivasan', 'comedy', 'poland', 'salary', 'dialogue'],
        downloadsCount: 1420
    },
    {
        id: 'clip-spadikam-mass',
        title: 'Aadu Thoma Ray-Ban Glass Mass Entry',
        category: 'cinema_regional',
        categoryLabel: '🎬 Cinema & Movies',
        movieOrShow: 'Spadikam (1995)',
        language: 'Malayalam',
        actors: ['Mohanlal', 'Thilakan'],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
        duration: '0:45',
        quality: '1080p HD',
        description: 'Mohanlal unbuttons his mundu and delivers the ultimate mass punch with Ray-Ban sunglasses.',
        dialogue: 'ഇത് തോമയാടാ... ആടുതോമ! (Ithu Thomayada... Aadu Thoma!)',
        tags: ['malayalam', 'spadikam', 'mohanlal', 'mass', 'ray ban', 'hero entry', 'action'],
        downloadsCount: 2890
    },
    {
        id: 'clip-harihar-nagar-kadam',
        title: 'Paisa Illathappol Kadam Chodikkunna Scene',
        category: 'cinema_regional',
        categoryLabel: '🎬 Cinema & Movies',
        movieOrShow: 'In Harihar Nagar (1990)',
        language: 'Malayalam',
        actors: ['Mukesh', 'Jagadish', 'Siddique'],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
        duration: '0:40',
        quality: '1080p HD',
        description: 'The four broke friends discuss their empty pockets with hilarious confusion.',
        dialogue: 'കയ്യിൽ അഞ്ച് പൈസയില്ല സാറേ! (Paisa illa...)',
        tags: ['malayalam', 'in harihar nagar', 'mukesh', 'jagadish', 'paisa', 'kadam', 'broke comedy'],
        downloadsCount: 1980
    },
    {
        id: 'clip-dark-knight-joker',
        title: 'Joker Pencil Magic Trick in Mob Meeting',
        category: 'cinema_regional',
        categoryLabel: '🎬 Cinema & Movies',
        movieOrShow: 'The Dark Knight (2008)',
        language: 'English',
        actors: ['Heath Ledger'],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        duration: '0:50',
        quality: '4K Ultra HD',
        description: 'The Joker walks into the mob basement and makes a pencil disappear.',
        dialogue: 'How about a magic trick? Tada! It\'s gone.',
        tags: ['joker', 'dark knight', 'heath ledger', 'magic trick', 'batman', 'villain', 'hollywood'],
        downloadsCount: 5120
    },
    {
        id: 'clip-vikram-rolex',
        title: 'Rolex Sir Menacing Entry & Walk',
        category: 'cinema_regional',
        categoryLabel: '🎬 Cinema & Movies',
        movieOrShow: 'Vikram (2022)',
        language: 'Tamil',
        actors: ['Suriya', 'Kamal Haasan'],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
        duration: '0:45',
        quality: '4K Ultra HD',
        description: 'Suriya walks into the warehouse as Rolex and delivers cold menacing authority.',
        dialogue: 'Just call me Rolex!',
        tags: ['rolex', 'suriya', 'vikram', 'tamil', 'lokesh', 'mass entry', 'villain'],
        downloadsCount: 4310
    },

    // --- 2. VIRAL MEMES & REACTION CLIPS ---
    {
        id: 'clip-meme-pedro-pascal',
        title: 'Pedro Pascal Laughing to Weeping Crying',
        category: 'meme_reaction',
        categoryLabel: '😂 Meme Reactions',
        movieOrShow: 'Pedro Pascal Table Read',
        language: 'English',
        actors: ['Pedro Pascal'],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        duration: '0:15',
        quality: '1080p HD',
        description: 'Pedro Pascal suddenly transitioning from uncontrollable laughter to deep crying.',
        dialogue: 'Mood change from happy to instant regret.',
        tags: ['pedro pascal', 'crying meme', 'laughing', 'regret', 'reaction', 'relatable', 'salary'],
        downloadsCount: 8940
    },
    {
        id: 'clip-meme-patrick-bateman',
        title: 'Patrick Bateman Sigma Walk with Headphones',
        category: 'meme_reaction',
        categoryLabel: '😂 Meme Reactions',
        movieOrShow: 'American Psycho',
        language: 'English',
        actors: ['Christian Bale'],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
        duration: '0:20',
        quality: '1080p HD',
        description: 'Christian Bale walking with headphones with ultimate sigma main character energy.',
        dialogue: 'Walking into work with phonk music blasting.',
        tags: ['sigma', 'bateman', 'walk', 'headphones', 'christian bale', 'phonk', 'meme'],
        downloadsCount: 7650
    },
    {
        id: 'clip-meme-leo-cheers',
        title: 'Leonardo DiCaprio Laughing & Smug Toast',
        category: 'meme_reaction',
        categoryLabel: '😂 Meme Reactions',
        movieOrShow: 'Django Unchained / The Great Gatsby',
        language: 'English',
        actors: ['Leonardo DiCaprio'],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
        duration: '0:12',
        quality: '1080p HD',
        description: 'Leonardo DiCaprio smirking, raising his drink and laughing smugly.',
        dialogue: 'Cheers to those who doubted us!',
        tags: ['leo dicaprio', 'cheers', 'laugh', 'drink', 'smug', 'meme', 'celebration'],
        downloadsCount: 6240
    },
    {
        id: 'clip-meme-walter-white-fall',
        title: 'Walter White Devastated Desert Collapse',
        category: 'meme_reaction',
        categoryLabel: '😂 Meme Reactions',
        movieOrShow: 'Breaking Bad',
        language: 'English',
        actors: ['Bryan Cranston'],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        duration: '0:18',
        quality: '1080p HD',
        description: 'Walter White falling to the sand in total despair and disbelief.',
        dialogue: 'When you lose everything in a second.',
        tags: ['walter white', 'breaking bad', 'fall', 'collapse', 'shock', 'sad', 'meme'],
        downloadsCount: 5410
    },
    {
        id: 'clip-meme-michael-scott-no',
        title: 'Michael Scott "NO GOD PLEASE NO!" Panic',
        category: 'meme_reaction',
        categoryLabel: '😂 Meme Reactions',
        movieOrShow: 'The Office',
        language: 'English',
        actors: ['Steve Carell'],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
        duration: '0:14',
        quality: '1080p HD',
        description: 'Michael Scott screaming in horror when he sees Toby return.',
        dialogue: 'NO GOD PLEASE NO! NO! NO! NOOOOO!',
        tags: ['the office', 'michael scott', 'no god please no', 'panic', 'monday', 'meme'],
        downloadsCount: 9100
    },

    // --- 3. GAMING & SATISFYING CLIPS ---
    {
        id: 'clip-game-gta-ramp',
        title: 'GTA 5 Impossible High-Speed Sky Ramp Jump',
        category: 'gaming_satisfying',
        categoryLabel: '🎮 Gaming & Satisfying',
        movieOrShow: 'Grand Theft Auto V',
        language: 'Gameplay',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
        duration: '0:30',
        quality: '1080p 60fps',
        description: 'Supercar jumping off massive rainbow sky ramps with smooth flips and landing.',
        tags: ['gta 5', 'ramp jump', 'satisfying', 'gameplay', 'story background', 'car stunt'],
        downloadsCount: 11200
    },
    {
        id: 'clip-game-subway-surfers',
        title: 'Subway Surfers Smooth High Score Run',
        category: 'gaming_satisfying',
        categoryLabel: '🎮 Gaming & Satisfying',
        movieOrShow: 'Subway Surfers',
        language: 'Gameplay',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        duration: '0:30',
        quality: '1080p 60fps',
        description: 'Hypnotic Subway Surfers run with jetpack, train dodges, and coin magnets.',
        tags: ['subway surfers', 'gameplay background', 'satisfying', 'reddit story clip'],
        downloadsCount: 8900
    },
    {
        id: 'clip-game-minecraft-parkour',
        title: 'Minecraft Neon Glow Spiral Parkour Flow',
        category: 'gaming_satisfying',
        categoryLabel: '🎮 Gaming & Satisfying',
        movieOrShow: 'Minecraft',
        language: 'Gameplay',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1627856014754-2907e2355d54?w=600&auto=format&fit=crop&q=80',
        duration: '0:30',
        quality: '1080p 60fps',
        description: 'Ultra smooth 3D neon spiral parkour speedrun jumps.',
        tags: ['minecraft', 'parkour', 'speedrun', 'satisfying', 'asmr'],
        downloadsCount: 7800
    },

    // --- 4. AESTHETIC, CARS & NIGHT DRIVES ---
    {
        id: 'clip-aes-cyberpunk-drive',
        title: 'Cyberpunk Tokyo Rain Night Drive',
        category: 'aesthetic_drive',
        categoryLabel: '🌆 Aesthetic & Drives',
        movieOrShow: 'Night City Vibes',
        language: 'Cinematic',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        duration: '0:25',
        quality: '4K Ultra HD',
        description: 'Reflective neon streets, raindrops on windshield, and night Tokyo skyline.',
        tags: ['night drive', 'tokyo', 'rain', 'cyberpunk', 'aesthetic', 'chill', 'lofi'],
        downloadsCount: 6540
    },
    {
        id: 'clip-aes-sunset-cruise',
        title: 'Golden Hour Coastal Highway Cruise',
        category: 'aesthetic_drive',
        categoryLabel: '🌆 Aesthetic & Drives',
        movieOrShow: 'California Coastline',
        language: 'Cinematic',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop&q=80',
        duration: '0:20',
        quality: '4K Ultra HD',
        description: 'Warm golden sun setting over ocean cliff highway with vintage convertible.',
        tags: ['sunset', 'golden hour', 'highway', 'ocean', 'aesthetic', 'summer'],
        downloadsCount: 4890
    },

    // --- 5. GYM & MOTIVATION ---
    {
        id: 'clip-gym-deadlift-grind',
        title: 'Dark Room Heavy Deadlift Focus',
        category: 'gym_motivation',
        categoryLabel: '⚡ Gym & Motivation',
        movieOrShow: 'Iron Mindset',
        language: 'Cinematic',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
        duration: '0:22',
        quality: '4K Ultra HD',
        description: 'High intensity lifting session with chalk dust, heavy bar, and relentless focus.',
        tags: ['gym', 'motivation', 'deadlift', 'discipline', 'grind', 'fitness'],
        downloadsCount: 5210
    }
];

export function getClipsByCategory(category?: string): VideoClip[] {
    if (!category || category === 'all') return VIDEO_CLIPS_COLLECTION;
    return VIDEO_CLIPS_COLLECTION.filter(c => c.category === category);
}

export function searchClipsCollection(query: string, category?: string): VideoClip[] {
    let list = VIDEO_CLIPS_COLLECTION;
    if (category && category !== 'all') {
        list = list.filter(c => c.category === category);
    }

    const qLower = query.toLowerCase().trim();
    if (!qLower) return list;

    return list.filter(c => 
        c.title.toLowerCase().includes(qLower) ||
        (c.movieOrShow && c.movieOrShow.toLowerCase().includes(qLower)) ||
        (c.dialogue && c.dialogue.toLowerCase().includes(qLower)) ||
        (c.language && c.language.toLowerCase().includes(qLower)) ||
        (c.actors && c.actors.some(a => a.toLowerCase().includes(qLower))) ||
        c.description.toLowerCase().includes(qLower) ||
        c.tags.some(t => t.toLowerCase().includes(qLower))
    );
}
