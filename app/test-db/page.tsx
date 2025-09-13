import { neon } from '@neondatabase/serverless';

export default function TestDbPage() {
  async function create(formData: FormData) {
    'use server';
    try {
      // Connect to the Neon database
      const sql = neon(`${process.env.DATABASE_URL}`);
      const comment = formData.get('comment');
      
      // Insert the comment from the form into the Postgres database
      await sql('INSERT INTO comments (comment) VALUES ($1)', [comment]);
      
      console.log('Comment inserted successfully');
    } catch (error) {
      console.error('Error inserting comment:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">数据库连接测试</h1>
        <form action={create} className="space-y-4">
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              输入评论
            </label>
            <input 
              type="text" 
              placeholder="写一个评论" 
              name="comment" 
              id="comment"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            提交
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          <p>数据库URL: {process.env.DATABASE_URL ? '已设置' : '未设置'}</p>
        </div>
      </div>
    </div>
  );
}
