import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

type AppRole = 'STUDENT' | 'ADMIN'

type AppJWT = JWT & { role?: AppRole }

type AppSession = Session & {
  user: Session['user'] & { role?: AppRole }
}

function hasRole(u: unknown): u is { role: AppRole } {
  return (
    typeof u === 'object' &&
    u !== null &&
    'role' in (u as Record<string, unknown>) &&
    typeof (u as Record<string, unknown>).role === 'string'
  )
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Record<'email' | 'password', string> | undefined): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // 模拟用户验证 - 在实际部署时替换为数据库查询
        if (credentials.email === 'student@example.com' && credentials.password === 'password123') {
          const user: User & { role: AppRole } = {
            id: 'student_001',
            email: 'student@example.com',
            name: '张同学',
            role: 'STUDENT'
          }
          return user as unknown as User
        }

        if (credentials.email === 'admin@tiffanyscollege.com' && credentials.password === 'admin123') {
          const user: User & { role: AppRole } = {
            id: 'admin_001',
            email: 'admin@tiffanyscollege.com',
            name: '管理员',
            role: 'ADMIN'
          }
          return user as unknown as User
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<AppJWT> {
      const t = token as AppJWT
      if (user && hasRole(user)) {
        t.role = user.role
      }
      return t
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<AppSession> {
      const s = session as AppSession
      const t = token as AppJWT
      if (t.role) {
        s.user.role = t.role
      }
      return s
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}
