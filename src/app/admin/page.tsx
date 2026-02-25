import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { approveUser, updatePromptStatus, deletePrompt, makeSeller, makeAdmin } from '@/app/actions/admin'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return (
            <div className="flex-1 w-full flex flex-col items-center justify-center p-8 text-center mt-20">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="text-muted-foreground">Admin privileges required.</p>
            </div>
        )
    }

    const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    const { data: prompts } = await supabase.from('prompts').select('*, profiles(name)').order('created_at', { ascending: false })

    return (
        <div className="w-full max-w-6xl px-5 py-8 flex flex-col gap-12 mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground mb-8">Manage users and prompts.</p>
            </div>

            <section>
                <h2 className="text-2xl font-semibold mb-4">Users</h2>
                <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="p-3 font-medium">Name</th>
                                <th className="p-3 font-medium">Role</th>
                                <th className="p-3 font-medium">Approved?</th>
                                <th className="p-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map(u => (
                                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20">
                                    <td className="p-3 font-medium">{u.name || 'Anonymous'}</td>
                                    <td className="p-3"><Badge variant="outline">{u.role}</Badge></td>
                                    <td className="p-3">
                                        {u.approved ? <Badge variant="secondary">Yes</Badge> : <Badge variant="destructive">No</Badge>}
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {!u.approved && u.role === 'seller' && (
                                                <form action={approveUser.bind(null, u.id)}>
                                                    <Button size="sm" variant="outline">Approve Seller</Button>
                                                </form>
                                            )}
                                            {u.role === 'buyer' && (
                                                <form action={makeSeller.bind(null, u.id)}>
                                                    <Button size="sm" variant="outline">Make Seller</Button>
                                                </form>
                                            )}
                                            {u.role !== 'admin' && (
                                                <form action={makeAdmin.bind(null, u.id)}>
                                                    <Button size="sm" variant="outline">Make Admin</Button>
                                                </form>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">Prompts</h2>
                <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="p-3 font-medium">Title</th>
                                <th className="p-3 font-medium">Seller</th>
                                <th className="p-3 font-medium">Status</th>
                                <th className="p-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prompts?.map(p => (
                                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                                    <td className="p-3 font-medium line-clamp-1">{p.title}</td>
                                    <td className="p-3">{p.profiles?.name}</td>
                                    <td className="p-3">
                                        <Badge variant={p.status === 'approved' ? 'default' : p.status === 'rejected' ? 'destructive' : 'secondary'}>
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td className="p-3 flex justify-end gap-2">
                                        {p.status === 'pending' && (
                                            <>
                                                <form action={updatePromptStatus.bind(null, p.id, 'approved')}>
                                                    <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">Approve</Button>
                                                </form>
                                                <form action={updatePromptStatus.bind(null, p.id, 'rejected')}>
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">Reject</Button>
                                                </form>
                                            </>
                                        )}
                                        <form action={deletePrompt.bind(null, p.id)}>
                                            <Button size="sm" variant="destructive">Delete</Button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}
