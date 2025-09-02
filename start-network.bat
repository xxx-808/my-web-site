@echo off
echo 启动网络访问模式...
echo.

REM 获取本机IP地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :found
    )
)
:found

echo 检测到本机IP地址: %LOCAL_IP%
echo.
echo 其他电脑可以通过以下地址访问：
echo http://%LOCAL_IP%:3000
echo.
echo 按任意键启动服务器...
pause >nul

REM 设置环境变量
set DATABASE_URL=file:./dev.db
set NEXTAUTH_URL=http://%LOCAL_IP%:3000
set NEXTAUTH_SECRET=your-secret-key-here

REM 启动开发服务器
npm run dev
