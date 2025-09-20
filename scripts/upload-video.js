// 命令行视频上传脚本
// 使用方法: node scripts/upload-video.js <video-file-path> [title] [category] [description]

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// 配置
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'admin123';

// 分类映射
const CATEGORIES = {
  'listening': '雅思听力',
  'speaking': '雅思口语',
  'reading': '雅思阅读', 
  'writing': '雅思写作',
  '听力': '雅思听力',
  '口语': '雅思口语',
  '阅读': '雅思阅读',
  '写作': '雅思写作'
};

async function uploadVideo() {
  try {
    // 解析命令行参数
    const args = process.argv.slice(2);
    if (args.length < 1) {
      console.log('使用方法: node scripts/upload-video.js <video-file-path> [title] [category] [description]');
      console.log('');
      console.log('参数说明:');
      console.log('  video-file-path: 视频文件路径 (必需)');
      console.log('  title: 视频标题 (可选，默认使用文件名)');
      console.log('  category: 分类 (可选，默认为listening)');
      console.log('    - listening/听力: 雅思听力');
      console.log('    - speaking/口语: 雅思口语');
      console.log('    - reading/阅读: 雅思阅读');
      console.log('    - writing/写作: 雅思写作');
      console.log('  description: 视频描述 (可选)');
      console.log('');
      console.log('示例:');
      console.log('  node scripts/upload-video.js ./my-video.mp4');
      console.log('  node scripts/upload-video.js ./listening-lesson.mp4 "听力第1课" listening "雅思听力基础课程"');
      return;
    }

    const videoPath = args[0];
    const title = args[1] || path.basename(videoPath, path.extname(videoPath));
    const categoryInput = args[2] || 'listening';
    const description = args[3] || `${title} - 雅思学习视频`;

    // 验证文件存在
    if (!fs.existsSync(videoPath)) {
      console.error('❌ 视频文件不存在:', videoPath);
      return;
    }

    const fileStats = fs.statSync(videoPath);
    const fileSizeMB = fileStats.size / 1024 / 1024;

    console.log('🚀 开始上传视频...');
    console.log('==================');
    console.log('📁 文件路径:', videoPath);
    console.log('📝 标题:', title);
    console.log('📂 分类:', categoryInput, '->', CATEGORIES[categoryInput] || '未知分类');
    console.log('📄 描述:', description);
    console.log('📊 文件大小:', fileSizeMB.toFixed(2), 'MB');
    console.log('');

    // 验证文件大小
    if (fileSizeMB > 500) {
      console.error('❌ 文件过大，最大支持500MB');
      return;
    }

    // 第1步：管理员登录
    console.log('🔐 管理员登录...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'ADMIN'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.error('❌ 管理员登录失败:', error.error);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ 管理员登录成功');

    // 第2步：获取分类列表
    console.log('📂 获取视频分类...');
    const categoriesResponse = await fetch(`${BASE_URL}/api/categories/mapping`);
    let categoryId = null;

    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      const targetCategory = categoriesData.categories.find(cat => 
        cat.name === CATEGORIES[categoryInput] || 
        cat.code === categoryInput
      );
      
      if (targetCategory) {
        categoryId = targetCategory.id;
        console.log('✅ 找到分类:', targetCategory.name, '(ID:', categoryId, ')');
      } else {
        console.log('⚠️ 未找到指定分类，使用默认分类');
      }
    }

    // 第3步：上传视频文件
    console.log('📤 上传视频文件...');
    const videoFormData = new FormData();
    videoFormData.append('video', fs.createReadStream(videoPath));

    const uploadResponse = await fetch(`${BASE_URL}/api/upload/video`, {
      method: 'POST',
      body: videoFormData
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      console.error('❌ 视频上传失败:', error.error);
      return;
    }

    const uploadData = await uploadResponse.json();
    console.log('✅ 视频上传成功:', uploadData.data.fileName);
    console.log('🔗 访问URL:', uploadData.data.url);

    // 第4步：创建视频记录
    console.log('📝 创建视频记录...');
    const createVideoResponse = await fetch(`${BASE_URL}/api/admin/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title,
        description: description,
        categoryId: categoryId,
        duration: 1800, // 默认30分钟，实际应该通过视频处理获取
        url: uploadData.data.url,
        thumbnail: 'https://picsum.photos/800/450?random=' + Date.now(),
        accessLevel: 'BASIC'
      })
    });

    if (!createVideoResponse.ok) {
      const error = await createVideoResponse.json();
      console.error('❌ 创建视频记录失败:', error.error);
      console.log('💡 视频文件已上传，但数据库记录创建失败');
      console.log('🔗 文件URL:', uploadData.data.url);
      return;
    }

    const videoRecord = await createVideoResponse.json();
    console.log('✅ 视频记录创建成功');

    console.log('');
    console.log('🎉 视频上传完成！');
    console.log('==================');
    console.log('📝 标题:', title);
    console.log('🆔 视频ID:', videoRecord.video?.id || '未知');
    console.log('🔗 文件URL:', uploadData.data.url);
    console.log('📂 分类:', CATEGORIES[categoryInput] || categoryInput);
    console.log('');
    console.log('🌐 现在可以在网站上查看视频:');
    console.log('   学生端: ' + BASE_URL + '/videos');
    console.log('   管理端: ' + BASE_URL + '/admin/video-management');

  } catch (error) {
    console.error('❌ 上传失败:', error.message);
    console.error('详细错误:', error);
  }
}

// 检查是否有node-fetch
try {
  require('node-fetch');
  require('form-data');
} catch (error) {
  console.error('❌ 缺少依赖包，请先安装:');
  console.error('npm install node-fetch@2 form-data');
  process.exit(1);
}

uploadVideo();
