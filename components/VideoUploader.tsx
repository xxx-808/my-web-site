"use client";

import { useState, useRef } from 'react';

interface VideoUploaderProps {
  onVideoUploaded: (videoData: {
    url: string;
    fileName: string;
    originalName: string;
    size: number;
  }) => void;
  onThumbnailUploaded: (thumbnailData: {
    url: string;
    fileName: string;
  }) => void;
}

interface UploadProgress {
  video: number;
  thumbnail: number;
}

export default function VideoUploader({ onVideoUploaded, onThumbnailUploaded }: VideoUploaderProps) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState({
    video: false,
    thumbnail: false
  });
  
  const [progress, setProgress] = useState<UploadProgress>({
    video: 0,
    thumbnail: 0
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<{
    video: File | null;
    thumbnail: File | null;
  }>({
    video: null,
    thumbnail: null
  });

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, video: true }));
    setProgress(prev => ({ ...prev, video: 0 }));

    try {
      const formData = new FormData();
      formData.append('video', file);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setProgress(prev => ({
          ...prev,
          video: Math.min(prev.video + 10, 90)
        }));
      }, 200);

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(prev => ({ ...prev, video: 100 }));

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadedFiles(prev => ({ ...prev, video: result.data }));
      onVideoUploaded(result.data);
      
      // 显示成功消息
      setTimeout(() => {
        setProgress(prev => ({ ...prev, video: 0 }));
        setUploading(prev => ({ ...prev, video: false }));
      }, 1000);

    } catch (error) {
      console.error('Video upload error:', error);
      alert(`视频上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setUploading(prev => ({ ...prev, video: false }));
      setProgress(prev => ({ ...prev, video: 0 }));
    }
  };

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, thumbnail: true }));
    setProgress(prev => ({ ...prev, thumbnail: 0 }));

    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setProgress(prev => ({
          ...prev,
          thumbnail: Math.min(prev.thumbnail + 15, 90)
        }));
      }, 100);

      const response = await fetch('/api/upload/thumbnail', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(prev => ({ ...prev, thumbnail: 100 }));

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadedFiles(prev => ({ ...prev, thumbnail: result.data }));
      onThumbnailUploaded(result.data);
      
      // 显示成功消息
      setTimeout(() => {
        setProgress(prev => ({ ...prev, thumbnail: 0 }));
        setUploading(prev => ({ ...prev, thumbnail: false }));
      }, 1000);

    } catch (error) {
      console.error('Thumbnail upload error:', error);
      alert(`缩略图上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setUploading(prev => ({ ...prev, thumbnail: false }));
      setProgress(prev => ({ ...prev, thumbnail: 0 }));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* 视频上传 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            🎥
          </div>
          <div className="text-sm text-gray-600 mb-4">
            <label htmlFor="video-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500 font-medium">
                点击上传视频文件
              </span>
              <input
                ref={videoInputRef}
                id="video-upload"
                type="file"
                className="sr-only"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                onChange={handleVideoUpload}
                disabled={uploading.video}
              />
            </label>
            <p className="mt-1">支持 MP4, WebM, QuickTime, AVI 格式，最大 500MB</p>
          </div>
        </div>

        {uploading.video && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.video}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-center">
              上传进度: {progress.video}%
            </p>
          </div>
        )}

        {uploadedFiles.video && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center">
              <div className="text-green-600 mr-2">✅</div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  视频上传成功
                </p>
                <p className="text-sm text-green-600">
                  {uploadedFiles.video.originalName} ({formatFileSize(uploadedFiles.video.size)})
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 缩略图上传 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            🖼️
          </div>
          <div className="text-sm text-gray-600 mb-4">
            <label htmlFor="thumbnail-upload" className="cursor-pointer">
              <span className="text-green-600 hover:text-green-500 font-medium">
                点击上传缩略图
              </span>
              <input
                ref={thumbnailInputRef}
                id="thumbnail-upload"
                type="file"
                className="sr-only"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailUpload}
                disabled={uploading.thumbnail}
              />
            </label>
            <p className="mt-1">支持 JPEG, PNG, WebP 格式，最大 10MB</p>
            <p className="text-xs text-gray-500">图片将自动调整为 800x450 像素</p>
          </div>
        </div>

        {uploading.thumbnail && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.thumbnail}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-center">
              上传进度: {progress.thumbnail}%
            </p>
          </div>
        )}

        {uploadedFiles.thumbnail && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center">
              <div className="text-green-600 mr-2">✅</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  缩略图上传成功
                </p>
                <p className="text-sm text-green-600">
                  已优化为 WebP 格式 (800x450)
                </p>
              </div>
              <img 
                src={uploadedFiles.thumbnail.url} 
                alt="缩略图预览" 
                className="w-20 h-12 object-cover rounded ml-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* 上传状态摘要 */}
      <div className="text-sm text-gray-500 text-center">
        {uploadedFiles.video && uploadedFiles.thumbnail ? (
          <p className="text-green-600 font-medium">
            ✅ 视频和缩略图上传完成，可以创建视频记录了
          </p>
        ) : uploadedFiles.video ? (
          <p>视频已上传，建议上传缩略图以获得更好的展示效果</p>
        ) : (
          <p>请先上传视频文件</p>
        )}
      </div>
    </div>
  );
}
