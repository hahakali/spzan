'use client';

import type { Video } from '@/lib/types';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
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
  onPlayToggle: (videoId: string) => void;
  onVideoEnd: () => void;
}

export function VideoPlayer({ video, isActive, isPlaying, onPlayToggle, onVideoEnd }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isPaidLocked, setIsPaidLocked] = useState(video.type === 'paid');
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mute/unmute based on state
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.muted = isMuted;
    }
  }, [isMuted]);

  // Play/pause based on props from parent
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      if (isPlaying && isActive && !isPaidLocked) {
        videoElement.play().catch(e => console.log("Play interrupted", e));
      } else {
        videoElement.pause();
      }
    }
  }, [isPlaying, isActive, isPaidLocked]);

  // Reset video time when it becomes inactive
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!isActive && videoElement) {
        videoElement.currentTime = 0;
        setProgress(0);
    }
  }, [isActive]);


  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      if(videoElement.currentTime > 0){
        setProgress(videoElement.currentTime);
        setIsBuffering(false);
      }
    };
    const handleDurationChange = () => setDuration(videoElement.duration);
    const handleEnded = () => {
      onPlayToggle(''); // Signal that no video is playing
      onVideoEnd();
    };
    const handleWaiting = () => {
      if(isPlaying && isActive) setIsBuffering(true);
    }
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
  }, [onVideoEnd, isPlaying, isActive, onPlayToggle]);

  const handleTogglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent main div click from firing if called from button
    if (isPaidLocked) {
        setShowUnlockDialog(true);
        return;
    }
    onPlayToggle(video.id);
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0:00';
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
      if(isPlaying){
        setShowControls(false);
      }
    }, 3000);
  };

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaidLocked(false);
    setShowUnlockDialog(false);
    // Directly trigger play after unlocking
    onPlayToggle(video.id);
  }

  return (
    <div
      className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden"
      onPointerMove={handlePointerMove}
      onClick={() => handleTogglePlay()}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        src={video.src}
        poster={video.thumbnail}
        playsInline
        loop={false}
        preload="auto"
      />

      {isBuffering && isActive && !isPaidLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      )}

      {/* Play/Pause Icon Overlay */}
      {!isPlaying && !isPaidLocked && showControls && isActive && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Play className="h-20 w-20 text-white/50" fill="white" />
        </div>
      )}


      {/* Video Info Overlay */}
      <div className={cn(
          "absolute bottom-24 left-4 text-white p-4 rounded-lg bg-black/20 max-w-md transition-opacity duration-300 pointer-events-none",
           showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        )}>
          <h2 className="text-2xl font-bold font-headline">{video.title}</h2>
          <p className="text-sm mt-2 text-neutral-300">{video.description}</p>
          <div className="flex gap-2 mt-3">
            {video.type === 'free' ? (
                <Badge variant="outline" className="border-accent text-accent">免费观看</Badge>
            ) : (
                <Badge variant="destructive">付费内容</Badge>
            )}
          </div>
      </div>

      {isPaidLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-10" onClick={e => e.stopPropagation()}>
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
            max={duration || 1}
            step={1}
            onValueChange={handleSeek}
            disabled={isPaidLocked}
            className="w-full"
          />
          <div className="flex items-center justify-between text-white mt-2">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={(e) => handleTogglePlay(e)} className="text-white hover:bg-white/10">
                {isPlaying && isActive && !isPaidLocked ? <Pause /> : <Play />}
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono">
                {formatTime(progress)} / {formatTime(duration)}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="text-white hover:bg-white/10">
                {isMuted ? <VolumeX /> : <Volume2 />}
              </Button>
            </div>
          </div>
        </div>
      </div>

       <Dialog open={showUnlockDialog} onOpenChange={(isOpen) => { setShowUnlockDialog(isOpen); }}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>解锁付费内容</DialogTitle>
            <DialogDescription>
             此为一次性购买，付款后即可永久观看该视频。
            </DialogDescription>
          </DialogHeader>
          <div className='my-4 p-4 border rounded-lg'>
            <h4 className='font-bold'>{video.title}</h4>
            <p className='text-sm text-muted-foreground mt-1'>价格: $2.99</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={(e) => {e.stopPropagation(); setShowUnlockDialog(false)}}>取消</Button>
            <Button onClick={handleUnlock}><Lock className='mr-2 h-4 w-4' /> 付款并观看</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
