'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { addComment } from '@/app/actions/comments'
import { Star } from 'lucide-react'

type Comment = {
    id: string
    content: string
    created_at: string
    rating: number
    profiles: { name: string }
}

export default function Comments({ promptId, initialComments, currentUser }: { promptId: string, initialComments: Comment[], currentUser: any }) {
    const [comments, setComments] = useState<Comment[]>(initialComments || [])
    const [newComment, setNewComment] = useState('')
    const [rating, setRating] = useState(5)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setIsSubmitting(true)
        setError('')

        try {
            await addComment(promptId, newComment, rating)

            // Optimistically add to UI
            const newCommentObj: Comment = {
                id: Math.random().toString(), // temporary id
                content: newComment.trim(),
                created_at: new Date().toISOString(),
                rating: rating,
                profiles: { name: currentUser?.user_metadata?.name || 'You' }
            }

            setComments([newCommentObj, ...comments])
            setNewComment('')
            setRating(5)
        } catch (err: any) {
            setError(err.message || 'Failed to post comment')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-3xl">
            <h3 className="text-xl font-bold tracking-tight border-b pb-2">Comments ({comments.length})</h3>

            {/* Comment Form */}
            {currentUser ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-6 h-6 cursor-pointer transition-colors ${(hoveredRating || rating) >= star
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground/30'
                                    }`}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                    <Textarea
                        placeholder="Leave a review or comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px] resize-y"
                        disabled={isSubmitting}
                    />
                    {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                            {isSubmitting ? 'Posting...' : 'Post Comment'}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="p-4 bg-muted/50 rounded-lg text-center border">
                    <p className="text-muted-foreground text-sm">You must be logged in to leave a comment.</p>
                </div>
            )}

            {/* Comments List */}
            <div className="flex flex-col gap-4 mt-4">
                {comments.length === 0 ? (
                    <p className="text-muted-foreground text-sm italic">No comments yet. Be the first to start the discussion!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex flex-col gap-2 p-4 bg-card rounded-xl border shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {comment.profiles?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm leading-tight">{comment.profiles?.name || 'Unknown User'}</span>
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-3 h-3 ${comment.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span suppressHydrationWarning className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap pl-10">
                                {comment.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
