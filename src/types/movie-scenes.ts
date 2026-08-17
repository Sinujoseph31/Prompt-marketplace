export type RightsStatus = 'licensed' | 'user_uploaded' | 'external';
export type SourceType = 'licensed_stream' | 'user_upload' | 'external_watch';

export interface Movie {
    id: string;
    title: string;
    originalTitle?: string;
    year: number;
    language: string;
    country: string;
    genres: string[];
    poster: string;
    backdrop?: string;
    director?: string;
    castMembers: string[];
    description: string;
}

export interface MovieScene {
    id: string;
    movieId: string;
    movieTitle: string;
    originalMovieTitle?: string;
    year: number;
    language: string;
    country: string;
    genres: string[];
    poster: string;
    backdrop?: string;
    actors: string[];
    
    // Scene Specifics
    title: string;
    description: string;
    transcript?: string;
    dialogue?: string;
    startTime?: string;
    endTime?: string;
    duration: number; // in seconds
    emotions: string[];
    categories: string[];
    characters: string[];
    keywords: string[];
    
    // Legitimate Sources & Rights
    sourceUrl?: string;
    videoUrl?: string; // Direct playable/remakeable video clip URL
    sourceType: SourceType;
    rightsStatus: RightsStatus;
    rightsNotice?: string;
    
    // Relevance score for search results
    relevanceScore?: number;
    matchReason?: string;
}

export interface SceneSearchFilter {
    query?: string;
    language?: string;
    category?: string;
    emotion?: string;
    durationRange?: string; // 'under_10', '10_15', '15_30', '30_plus', 'all'
    yearMin?: number;
    yearMax?: number;
    actor?: string;
    movie?: string;
    sortBy?: 'best_match' | 'most_relevant' | 'popular' | 'newest';
}

export interface AiQueryInterpretation {
    rawQuery: string;
    detectedLanguage: string;
    isManglishOrTransliterated: boolean;
    englishTranslation?: string;
    sceneType?: string;
    emotions: string[];
    tone?: string;
    relationship?: string;
    action?: string;
    characters: string[];
    actors: string[];
    movieTitle?: string;
    keywords: string[];
    searchTerms: string[];
}

export interface TextLayer {
    id: string;
    text: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    fontSize: number; // px or scale
    fontWeight: 'normal' | 'bold' | '800';
    fontFamily: string;
    color: string;
    backgroundColor?: string;
    textAlign: 'left' | 'center' | 'right';
    animation?: 'none' | 'pop' | 'typewriter' | 'fade';
    category?: string;
}

export interface ReelProjectData {
    id?: string;
    title: string;
    sceneId?: string;
    sourceClipUrl: string;
    videoDuration: number;
    trimStart: number;
    trimEnd: number;
    volume: number;
    playbackRate: number;
    textLayers: TextLayer[];
    caption: string;
    hashtags: string[];
    aspectRatio: '9:16';
    rightsConfirmed: boolean;
}
