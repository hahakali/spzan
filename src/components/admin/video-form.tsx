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

const formSchema = z.object({
  title: z.string().min(3, '标题必须至少包含3个字符。'),
  description: z.string().min(10, '描述必须至少包含10个字符。'),
  type: z.enum(['free', 'paid'], { required_error: '请选择内容类型。' }),
  videoFile: z
    .instanceof(File)
    .refine((file) => file.size > 0, '请选择一个视频文件。')
    .refine((file) => file.size < 100 * 1024 * 1024, '视频文件不能超过100MB。')
    .refine(
      (file) => ['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(file.type),
      '只支持 MP4, MOV, AVI 格式。'
    ).optional(), // Make it optional for edit mode
}).refine(data => {
    // If it's a new video (no video prop), videoFile is required.
    // In edit mode, we don't require a new file upload.
    return data.videoFile !== undefined;
}, {
    message: "请选择一个视频文件进行上传。",
    path: ["videoFile"],
});

// We create a different schema for editing, where the file is not required.
const editFormSchema = formSchema.omit({ videoFile: true }).extend({
    videoFile: formSchema.shape.videoFile.optional(),
});


interface VideoFormProps {
  video: Video | null;
  onSuccess: () => void;
}

export function VideoForm({ video, onSuccess }: VideoFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const currentSchema = video ? editFormSchema : formSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      title: video?.title || '',
      description: video?.description || '',
      type: video?.type || 'free',
    },
  });

  async function onSubmit(values: z.infer<typeof currentSchema>) {
    setIsSubmitting(true);
    
    // In a real app, you would handle file upload to a server/cloud storage.
    // Here, we simulate the action and use a placeholder.
    if (video) { // Editing existing video
        try {
            const result = await updateVideoAction(video.id, {
              title: values.title,
              description: values.description,
              type: values.type,
            });
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
              description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    } else { // Adding a new video
        try {
            // This is where you'd typically handle the file upload via an API route.
            // For now, we'll continue using the server action which simulates the process.
             const result = await addVideoAction({
              title: values.title,
              description: values.description,
              type: values.type,
            });
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
              description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    }
  }
  
  const fileRef = form.register("videoFile");

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
        
        {!video && (
          <FormField
            control={form.control}
            name="videoFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>视频文件</FormLabel>
                <FormControl>
                  <Input type="file" accept="video/mp4,video/quicktime,video/x-msvideo" {...fileRef} />
                </FormControl>
                <FormDescription>
                  选择一个视频文件上传 (MP4, MOV, AVI)。
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
            {video ? '保存更改' : '添加视频'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
