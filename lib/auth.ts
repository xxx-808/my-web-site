import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import { prisma } from './prisma'

type AppRole = 'STUDENT' | 'ADMIN'

type AppJWT = JWT & { role?: AppRole; userId?: string }

type AppSession = Session & {
  user: Session['user'] & { role?: AppRole; userId?: string }
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

        try {
          // 从数据库查询用户
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              subscriptions: {
                where: {
                  status: 'ACTIVE',
                  endDate: { gte: new Date() }
                },
                include: {
                  plan: true
                }
              }
            }
          })

          if (!user) {
            return null
          }

          // 验证密码（这里简化处理，实际应该使用bcrypt）
          // 为了演示，我们暂时使用简单的密码验证
          const isValidPassword = await validatePassword(credentials.password, user)
          
          if (!isValidPassword) {
            return null
          }

          // 返回用户信息
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            // 添加订阅信息
            subscriptions: user.subscriptions
          } as unknown as User

        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30 // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<AppJWT> {
      const t = token as AppJWT
      if (user && hasRole(user)) {
        t.role = user.role
        t.userId = user.id
      }
      return t
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<AppSession> {
      const s = session as AppSession
      const t = token as AppJWT
      if (t.role) {
        s.user.role = t.role
      }
      if (t.userId) {
        s.user.userId = t.userId
      }
      return s
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}

// 密码验证函数（简化版本）
async function validatePassword(inputPassword: string, user: { email: string }): Promise<boolean> {
  // 这里应该使用bcrypt进行密码验证
  // 为了演示，我们暂时使用硬编码的密码
  
  // 模拟用户密码
  const mockPasswords: Record<string, string> = {
    'student@example.com': 'password123',
    'admin@tiffanyscollege.com': 'admin123'
  }
  
  return mockPasswords[user.email] === inputPassword
}
