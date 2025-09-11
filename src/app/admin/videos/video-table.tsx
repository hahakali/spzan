'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { MoreHorizontal, PlusCircle, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import type { Video } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { VideoForm } from '@/components/admin/video-form';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from 'use-debounce';
import { useToast } from '@/hooks/use-toast';
import { deleteVideoAction } from './actions';


interface VideoTableProps {
  initialVideos: Video[];
}

export function VideoTable({ initialVideos }: VideoTableProps) {
  // We don't use state for videos anymore as filtering is handled by search params
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const { toast } = useToast();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleAddVideo = () => {
    setSelectedVideo(null);
    setIsFormOpen(true);
  };

  const handleEditVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsFormOpen(true);
  };

  const handleDeleteVideo = async (videoId: string) => {
    setIsDeleting(true);
    try {
        const result = await deleteVideoAction(videoId);
        if (result.success) {
            toast({ title: '成功', description: result.message });
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '发生未知错误';
        toast({
            variant: 'destructive',
            title: '删除失败',
            description: errorMessage,
        });
    } finally {
        setIsDeleting(false);
    }
  };
  
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    // Revalidation is handled by the server action, so the page will refresh with new data.
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="按标题搜索..."
            className="pl-8"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get('query')?.toString()}
          />
        </div>
        <Button onClick={handleAddVideo} className="w-full sm:w-auto">
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
            {initialVideos.map((video) => (
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
                   <AlertDialog>
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
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                       <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>您确定要删除吗?</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作无法撤销。这将永久删除视频 "{video.title}"。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteVideo(video.id)}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            确定删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
            <DialogDescription>
                {selectedVideo ? '编辑现有视频的详细信息。' : '上传新视频并填写其详细信息。'}
            </DialogDescription>
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
