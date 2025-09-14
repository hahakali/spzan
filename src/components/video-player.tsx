'use client';

import type { Video } from '@/lib/types';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import {
  Play,
  Pause,
  Volume2,
  FastForward,
  Rewind,
  Lock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from './ui/badge';

interface VideoPlayerProps {
  video: Video;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: (videoId: string) => void;
  onVideoEnd: () => void;
}

export function VideoPlayer({ video, isActive, isPlaying, onPlay, onVideoEnd }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPaidLocked, setIsPaidLocked] = useState(video.type === 'paid');
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      if (isPlaying && isActive) {
        videoElement.play().catch(e => console.log("Play interrupted", e));
      } else {
        videoElement.pause();
      }
    }
  }, [isPlaying, isActive]);


  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setProgress(videoElement.currentTime);
      if (videoElement.currentTime > 0 && isBuffering) {
        setIsBuffering(false);
      }
    };
    const handleDurationChange = () => setDuration(videoElement.duration);
    const handleEnded = () => {
      onPlay(''); // Signal that no video is playing
      onVideoEnd();
    };
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('playing', handlePlaying);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('playing', handlePlaying);
    };
  }, [onVideoEnd, isBuffering, onPlay]);

  const togglePlay = () => {
    if (isPaidLocked) {
        setShowUnlockDialog(true);
        return;
    }
    if (isPlaying) {
      onPlay(''); // Pause
    } else {
      onPlay(video.id); // Play
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const handleSeekRelative = (amount: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + amount));
      videoRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePointerMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleUnlock = () => {
    setIsPaidLocked(false);
    setShowUnlockDialog(false);
    onPlay(video.id);
  }

  return (
    <div
      className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden"
      onPointerMove={handlePointerMove}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        src={isPaidLocked ? '' : video.src}
        playsInline
        loop={false}
        poster={video.thumbnail}
      />

      {isBuffering && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      )}

      {/* Video Info Overlay */}
      <div className="absolute bottom-24 left-4 text-white p-4 rounded-lg bg-black/20 max-w-md">
          <h2 className="text-2xl font-bold font-headline">{video.title}</h2>
          <p className="text-sm mt-2 text-neutral-300">{video.description}</p>
          <div className="flex gap-2 mt-3">
            {video.type === 'free' ? (
                <Badge variant="outline" className="border-accent text-accent">Free to Watch</Badge>
            ) : (
                <Badge variant="destructive">Premium</Badge>
            )}
            {video.category && <Badge variant="secondary">{video.category}</Badge>}
          </div>
      </div>

      {isPaidLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-10">
          <Lock className="h-16 w-16 text-primary mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">付费内容</h3>
          <p className="text-neutral-300 mb-6">解锁此视频即可观看。</p>
          <Button size="lg" onClick={(e) => { e.stopPropagation(); setShowUnlockDialog(true);}}>
            立即解锁
          </Button>
        </div>
      )}

      {/* Custom Controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-20 p-4 transition-opacity duration-300',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-black/40 backdrop-blur-md rounded-lg p-3">
          <Slider
            value={[progress]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            disabled={isPaidLocked}
            className="w-full"
          />
          <div className="flex items-center justify-between text-white mt-2">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/10">
                {isPlaying ? <Pause /> : <Play />}
              </Button>
              <div className='hidden sm:flex items-center gap-2'>
                <Button variant="ghost" size="icon" onClick={() => handleSeekRelative(-10)} className="text-white hover:bg-white/10">
                    <Rewind />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleSeekRelative(10)} className="text-white hover:bg-white/10">
                    <FastForward />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono">
                {formatTime(progress)} / {formatTime(duration)}
              </span>
              <Volume2 className="text-white" />
            </div>
          </div>
        </div>
      </div>

       <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>解锁付费内容</DialogTitle>
            <DialogDescription>
              要观看此视频，请完成付款。这是该视频的一次性购买。
            </DialogDescription>
          </DialogHeader>
          <div className='my-4 p-4 border rounded-lg'>
            <h4 className='font-bold'>{video.title}</h4>
            <p className='text-sm text-muted-foreground mt-1'>价格: $2.99</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnlockDialog(false)}>取消</Button>
            <Button onClick={handleUnlock}><Lock className='mr-2 h-4 w-4' /> 付款并观看</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
