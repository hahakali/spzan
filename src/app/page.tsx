
'use client';

import { getVideos } from '@/app/admin/videos/actions';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { VideoPlayer } from '@/components/video-player';
import type { Video } from '@/lib/types';
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';


export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videoData = await getVideos();
        setVideos(videoData);
        if (videoData.length > 0) {
          // Automatically set the first video to be ready to play
          setPlayingVideoId(videoData[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }
    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrent(selectedIndex);
      // Automatically play the video when it's selected in the carousel
      if (videos[selectedIndex]) {
        setPlayingVideoId(videos[selectedIndex].id);
      }
    };
    
    api.on('select', handleSelect);
    
    // Initial setup
    handleSelect(); 

    return () => {
      api.off('select', handleSelect);
    };
  }, [api, videos]);

  const handleVideoEnd = useCallback(() => {
    if (api && api.canScrollNext()) {
      api.scrollNext();
    }
  }, [api]);

  const handlePlayToggle = useCallback((videoId: string) => {
    setPlayingVideoId(currentId => (currentId === videoId ? null : videoId));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <span className="sr-only">Loading videos...</span>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <Carousel
        setApi={setApi}
        orientation="vertical"
        className="h-full w-full"
        opts={{
          loop: false, 
          align: "start",
          dragFree: false,
        }}
      >
        <CarouselContent className="h-full">
          {videos.map((video, index) => (
            <CarouselItem key={video.id} className="p-0">
              <VideoPlayer
                video={video}
                isActive={index === current}
                isPlaying={playingVideoId === video.id}
                onPlayToggle={handlePlayToggle}
                onVideoEnd={handleVideoEnd}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </main>
  );
}
