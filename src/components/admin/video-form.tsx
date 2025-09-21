'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { Video } from '@/lib/types';
import { addVideoAction, updateVideoAction } from '@/app/admin/videos/actions';
import { Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi', 'video/webm'];

// Schema for adding a new video (file is required)
const addFormSchema = z.object({
  title: z.string().min(3, '标题必须至少包含3个字符。'),
  description: z.string().min(10, '描述必须至少包含10个字符。'),
  type: z.enum(['free', 'paid'], { required_error: '请选择内容类型。' }),
  videoFile: z
    .any()
    .refine((files) => files?.length == 1, '请选择一个视频文件。')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `视频文件不能超过100MB。`)
    .refine(
      (files) => ACCEPTED_VIDEO_TYPES.includes(files?.[0]?.type),
      '只支持 MP4, MOV, AVI, WEBM 格式。'
    ),
});

// Schema for editing an existing video (file is optional)
const editFormSchema = z.object({
  title: z.string().min(3, '标题必须至少包含3个字符。'),
  description: z.string().min(10, '描述必须至少包含10个字符。'),
  type: z.enum(['free', 'paid'], { required_error: '请选择内容类型。' }),
  videoFile: z
    .any()
    .optional()
    .refine((files) => files?.length > 0 ? files?.[0]?.size <= MAX_FILE_SIZE : true, `视频文件不能超过100MB。`)
    .refine(
      (files) => files?.length > 0 ? ACCEPTED_VIDEO_TYPES.includes(files?.[0]?.type) : true,
      '只支持 MP4, MOV, AVI, WEBM 格式。'
    ),
});


interface VideoFormProps {
  video: Video | null;
  onSuccess: () => void;
}

export function VideoForm({ video, onSuccess }: VideoFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const isEditMode = !!video;
  const currentSchema = isEditMode ? editFormSchema : addFormSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      title: video?.title || '',
      description: video?.description || '',
      type: video?.type || 'free',
    },
  });
  
  const fileRef = form.register('videoFile');

  async function onSubmit(values: z.infer<typeof currentSchema>) {
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('type', values.type);
    
    // Only append file if it exists (for both add and edit)
    if (values.videoFile && values.videoFile.length > 0) {
      formData.append('videoFile', values.videoFile[0]);
    } else if (!isEditMode) {
      // This case should be caught by validation, but as a safeguard:
      toast({
        variant: 'destructive',
        title: '错误',
        description: `添加新视频时必须提供视频文件。`,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = isEditMode
        ? await updateVideoAction(video.id, formData)
        : await addVideoAction(formData);

      if (result.success) {
        toast({
          title: '成功!',
          description: result.message,
        });
        onSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '发生未知错误';
      toast({
        variant: 'destructive',
        title: '错误',
        description: `操作失败: ${errorMessage}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>视频标题</FormLabel>
              <FormControl>
                <Input placeholder="例如：我的精彩视频" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>视频描述</FormLabel>
              <FormControl>
                <Textarea placeholder="视频内容的详细描述..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {!isEditMode && (
          <FormField
            control={form.control}
            name="videoFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>视频文件</FormLabel>
                <FormControl>
                  <Input type="file" accept={ACCEPTED_VIDEO_TYPES.join(',')} {...fileRef} />
                </FormControl>
                <FormDescription>
                  选择一个视频文件上传 (MP4, MOV, AVI, WEBM)。最大100MB。
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>内容类型</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="free" />
                    </FormControl>
                    <FormLabel className="font-normal">免费</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="paid" />
                    </FormControl>
                    <FormLabel className="font-normal">付费</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? '保存更改' : '添加视频'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
