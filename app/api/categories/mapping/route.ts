import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// 分类映射配置
const CATEGORY_MAPPING = {
  '雅思听力': {
    code: 'listening',
    icon: '👂',
    color: 'orange',
    colorClass: 'bg-orange-100 text-orange-800'
  },
  '雅思口语': {
    code: 'speaking', 
    icon: '🗣️',
    color: 'green',
    colorClass: 'bg-green-100 text-green-800'
  },
  '雅思阅读': {
    code: 'reading',
    icon: '📖', 
    color: 'purple',
    colorClass: 'bg-purple-100 text-purple-800'
  },
  '雅思写作': {
    code: 'writing',
    icon: '✍️',
    color: 'blue', 
    colorClass: 'bg-blue-100 text-blue-800'
  }
} as const

const CATEGORY_LABELS = {
  listening: '听力',
  speaking: '口语', 
  reading: '阅读',
  writing: '写作'
} as const

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    // 获取所有分类
    const categories = await sql`
      SELECT id, name, description, created_at
      FROM video_categories 
      ORDER BY name
    `
    
    // 映射分类数据
    const mappedCategories = categories.map(category => {
      const mapping = CATEGORY_MAPPING[category.name as keyof typeof CATEGORY_MAPPING]
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        code: mapping?.code || 'other',
        icon: mapping?.icon || '📚',
        color: mapping?.color || 'gray',
        colorClass: mapping?.colorClass || 'bg-gray-100 text-gray-800',
        label: mapping ? CATEGORY_LABELS[mapping.code] : category.name,
        createdAt: category.created_at
      }
    })
    
    return NextResponse.json({
      success: true,
      categories: mappedCategories,
      mapping: CATEGORY_MAPPING,
      labels: CATEGORY_LABELS
    })
    
  } catch (error) {
    console.error('Categories mapping API error:', error)
    return NextResponse.json(
      { error: '获取分类映射失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'update-videos-with-mapping') {
      const sql = neon(process.env.DATABASE_URL!)
      
      // 获取所有视频和分类
      const videosWithCategories = await sql`
        SELECT v.id, v.title, v.category_id, vc.name as category_name
        FROM videos v
        JOIN video_categories vc ON v.category_id = vc.id
      `
      
      const updatedVideos = []
      
      for (const video of videosWithCategories) {
        const mapping = CATEGORY_MAPPING[video.category_name as keyof typeof CATEGORY_MAPPING]
        if (mapping) {
          updatedVideos.push({
            id: video.id,
            title: video.title,
            categoryName: video.category_name,
            categoryCode: mapping.code
          })
        }
      }
      
      return NextResponse.json({
        success: true,
        message: '视频分类映射更新完成',
        updatedVideos: updatedVideos.length,
        videos: updatedVideos
      })
    }
    
    return NextResponse.json(
      { error: '不支持的操作' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Categories mapping update error:', error)
    return NextResponse.json(
      { error: '更新分类映射失败' },
      { status: 500 }
    )
  }
}
