"use client";
import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'; // Import video.js styles

const VideoPlayer = ({ options, video }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const lastTimeRef = useRef(0); // Use a ref to persist lastTime across renders
  const isFullyWatchedRef = useRef(false); // Flag to track fully watched state

  useEffect(() => {
    const loadVideoProgress = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/videos/progress/video/${video.id}`);
        const data = await response.json();
        return data.progress.progress;
      } catch (err) {
        console.error('Error loading video progress:', err);
        return 0;
      }
    };

    // Initialize the player only once
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, options, async () => {
        console.log('Player is ready');

        // Load progress and set the start time accordingly
        const savedProgress = await loadVideoProgress();
        playerRef.current.on('loadedmetadata', () => {
          console.log('Metadata loaded. Duration:', playerRef.current.duration());

          // Immediately set lastTimeRef to 0 (or savedProgress * duration if applicable)
          if (savedProgress === 1) {
            lastTimeRef.current = playerRef.current.duration() || 0;
            playerRef.current.currentTime(lastTimeRef.current);
          }

          // Check if the saved progress is 1 (fully watched)
          if (savedProgress === 1) {
            isFullyWatchedRef.current = true;
          }

          // Set the current time based on saved progress
          playerRef.current.currentTime(savedProgress * playerRef.current.duration());
        });

        // Track the last playback time
        playerRef.current.on('timeupdate', () => {
          lastTimeRef.current = playerRef.current.currentTime();

          // Check if the video has reached the end
          if (lastTimeRef.current >= playerRef.current.duration()) {
            isFullyWatchedRef.current = true;
          }

          // Track progress
          const progress = Math.min(lastTimeRef.current / playerRef.current.duration(), 1);
          console.log('Progress:', progress);

          if (video && video.id) {
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/videos/progress`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: 1, videoId: video.id, progress }),
            }).catch(err => console.error('Error sending progress:', err));
          }
        });

        // Hide the seek bar
        const controlBar = playerRef.current.controlBar;
        if (controlBar) {
          controlBar.getChild('progressControl').hide(); // Hide the seek bar
        }
      });
    }

    return () => {
      // Dispose of the player on component unmount
      if (!playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [options, video, videoRef, playerRef]);

  return (
    <div>
      <div data-vjs-player>
        <video
          ref={videoRef} // Attach the ref to the video element
          className="video-js vjs-default-skin w-[100%] h-[360px]"
          controls
          preload="auto"
          // width="640" // Set width and height for consistency
          // height="360"
        >
          {/* Video source is provided via options */}
          <source src={options.sources[0].src} type={options.sources[0].type} />
          {/* Fallback content */}
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoPlayer;