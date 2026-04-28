import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import ProductEditor from './ProductEditor'

export default async function AdminProduseePage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/')
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, price, stock, purity, category, short_desc, description, image_url, is_active')
    .order('name')

  return <ProductEditor initialProducts={products ?? []} />
}
