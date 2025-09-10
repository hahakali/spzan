'use client';

import { getVideos } from '@/lib/data';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { VideoPlayer } from '@/components/video-player';
import type { Video } from '@/lib/types';
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay"


export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videoData = await getVideos();
        setVideos(videoData);
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
    setCurrent(api.selectedScrollSnap());
    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    api.on('select', handleSelect);
    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

  const handleVideoEnd = () => {
    if (api && api.canScrollNext()) {
      api.scrollNext();
    }
  };

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
          loop: true,
        }}
      >
        <CarouselContent className="h-full">
          {videos.map((video, index) => (
            <CarouselItem key={video.id} className="relative h-full w-full p-0">
              <VideoPlayer
                video={video}
                isActive={index === current}
                onVideoEnd={handleVideoEnd}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </main>
  );
}
