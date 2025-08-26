import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // 模拟用户验证 - 在实际部署时替换为数据库查询
        if (credentials.email === 'student@example.com' && credentials.password === 'password123') {
          return {
            id: 'student_001',
            email: 'student@example.com',
            name: '张同学',
            role: 'STUDENT'
          } as any
        }

        if (credentials.email === 'admin@tiffanyscollege.com' && credentials.password === 'admin123') {
          return {
            id: 'admin_001',
            email: 'admin@tiffanyscollege.com',
            name: '管理员',
            role: 'ADMIN'
          } as any
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && typeof (user as any).role === 'string') {
        (token as any).role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && typeof (token as any).role === 'string') {
        (session.user as any).role = (token as any).role
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}
