import { adminAuth } from './firebase/admin'

export async function verifyAdminToken(request: Request): Promise<boolean> {
  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) return false
  try {
    await adminAuth.verifyIdToken(header.slice(7))
    return true
  } catch {
    return false
  }
}
