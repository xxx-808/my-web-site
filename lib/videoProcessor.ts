import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import { promises as fs } from 'fs';

// 设置 FFmpeg 路径
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export interface VideoInfo {
  duration: number;
  width: number;
  height: number;
  format: string;
  size: number;
}

export class VideoProcessor {
  /**
   * 获取视频信息
   */
  static async getVideoInfo(videoPath: string): Promise<VideoInfo> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(new Error(`Failed to get video info: ${err.message}`));
          return;
        }

        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          format: metadata.format.format_name || 'unknown',
          size: parseInt(metadata.format.size || '0')
        });
      });
    });
  }

  /**
   * 生成视频缩略图
   */
  static async generateThumbnail(
    videoPath: string,
    outputPath: string,
    timeOffset: string = '00:00:01'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timeOffset)
        .frames(1)
        .size('800x450')
        .output(outputPath)
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err) => {
          reject(new Error(`Failed to generate thumbnail: ${err.message}`));
        })
        .run();
    });
  }

  /**
   * 压缩视频（可选）
   */
  static async compressVideo(
    inputPath: string,
    outputPath: string,
    quality: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let crf: number;
      switch (quality) {
        case 'low':
          crf = 28;
          break;
        case 'medium':
          crf = 23;
          break;
        case 'high':
          crf = 18;
          break;
      }

      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .addOptions([`-crf ${crf}`, '-preset medium'])
        .output(outputPath)
        .on('progress', (progress) => {
          console.log(`Compression progress: ${progress.percent}%`);
        })
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err) => {
          reject(new Error(`Failed to compress video: ${err.message}`));
        })
        .run();
    });
  }

  /**
   * 转换视频格式为 Web 友好格式
   */
  static async convertToWebFormat(
    inputPath: string,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .addOptions([
          '-movflags faststart', // 优化 Web 播放
          '-preset medium',
          '-crf 23'
        ])
        .output(outputPath)
        .on('progress', (progress) => {
          console.log(`Conversion progress: ${progress.percent}%`);
        })
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err) => {
          reject(new Error(`Failed to convert video: ${err.message}`));
        })
        .run();
    });
  }

  /**
   * 清理临时文件
   */
  static async cleanupTempFiles(filePaths: string[]): Promise<void> {
    const deletePromises = filePaths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
        console.log(`Deleted temp file: ${filePath}`);
      } catch (error) {
        console.warn(`Failed to delete temp file ${filePath}:`, error);
      }
    });

    await Promise.all(deletePromises);
  }
}

export default VideoProcessor;
