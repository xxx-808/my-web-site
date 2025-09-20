import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { neon } from '@neondatabase/serverless'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          return null
        }

        try {
          const sql = neon(process.env.DATABASE_URL!)
          
          // 查询用户
          const users = await sql`
            SELECT id, email, name, password, role
            FROM users 
            WHERE email = ${credentials.email} AND role = ${credentials.role}
            LIMIT 1
          `
          
          if (users.length === 0) {
            return null
          }
          
          const user = users[0]
          
          // 简单的密码验证（实际项目中应该使用加密对比）
          if (user.password !== credentials.password) {
            return null
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.userId = token.userId as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/student-login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
