# 设置环境变量脚本
Write-Host "🔧 设置环境变量..." -ForegroundColor Green

# 检查是否已存在 .env.local 文件
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local 文件已存在" -ForegroundColor Green
} else {
    Write-Host "📝 创建 .env.local 文件..." -ForegroundColor Yellow
    
    # 创建 .env.local 文件内容
    $envContent = @"
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/ielts_videos"

# NextAuth 配置
NEXTAUTH_SECRET="your-super-secret-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# 环境
NODE_ENV="development"
"@
    
    # 写入文件
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local 文件已创建" -ForegroundColor Green
}

Write-Host "📋 当前环境变量状态:" -ForegroundColor Cyan
Write-Host "DATABASE_URL: $env:DATABASE_URL" -ForegroundColor White
Write-Host "NEXTAUTH_SECRET: $env:NEXTAUTH_SECRET" -ForegroundColor White
Write-Host "NEXTAUTH_URL: $env:NEXTAUTH_URL" -ForegroundColor White

Write-Host "⚠️  请编辑 .env.local 文件，填入正确的数据库连接信息" -ForegroundColor Yellow
Write-Host "🏁 环境变量设置完成" -ForegroundColor Green
