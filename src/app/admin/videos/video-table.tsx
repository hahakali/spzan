'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Video } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VideoForm } from '@/components/admin/video-form';

interface VideoTableProps {
  initialVideos: Video[];
}

export function VideoTable({ initialVideos }: VideoTableProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const handleAddVideo = () => {
    setSelectedVideo(null);
    setIsFormOpen(true);
  };

  const handleEditVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsFormOpen(true);
  };
  
  const handleFormSuccess = () => {
    // In a real app, you'd refetch the data. Here we just close the modal.
    setIsFormOpen(false);
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddVideo}>
          <PlusCircle className="mr-2 h-4 w-4" />
          添加视频
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">缩略图</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>观看次数</TableHead>
              <TableHead>上传日期</TableHead>
              <TableHead className="w-[50px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell>
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    width={80}
                    height={45}
                    className="rounded-md object-cover"
                    data-ai-hint="video thumbnail"
                  />
                </TableCell>
                <TableCell className="font-medium">{video.title}</TableCell>
                <TableCell>
                  <Badge variant={video.type === 'paid' ? 'destructive' : 'secondary'}>
                    {video.type === 'paid' ? '付费' : '免费'}
                  </Badge>
                </TableCell>
                <TableCell>{video.category || 'N/A'}</TableCell>
                <TableCell>{video.views.toLocaleString()}</TableCell>
                <TableCell>{video.uploadDate}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">打开菜单</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditVideo(video)}>
                        <Edit className="mr-2 h-4 w-4" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedVideo ? '编辑视频' : '添加新视频'}</DialogTitle>
          </DialogHeader>
          <VideoForm
            video={selectedVideo}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
