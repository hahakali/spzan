import { getVideos } from '@/lib/data';
import { VideoTable } from './video-table';

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          视频管理
        </h1>
        <p className="text-muted-foreground mt-1">
          在这里添加、编辑和管理您的视频内容。
        </p>
      </div>
      <VideoTable initialVideos={videos} />
    </div>
  );
}
