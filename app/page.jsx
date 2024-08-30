"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [progress, setProgress] = useState({}); // To store progress for each video
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Fetch videos data
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/videos`);
        if (!response.ok) throw new Error('Failed to fetch videos');
        const data = await response.json();
        setVideos(data);

        // Fetch progress for each video
        const progressPromises = data.map(video =>
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/videos/progress/video/${video.id}`)
            .then(res => res.json())
            .then(data => ({ id: video.id, progress: data.progress || 0 }))
            .catch(() => ({ id: video.id, progress: 0 }))
        );
      
        const progressData = await Promise.all(progressPromises);
        const progressMap = progressData.reduce((acc, { id, progress }) => {
          acc[id] = progress;
          return acc;
        }, {});
        console.log(progressMap);
        setProgress(progressMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchVideos();
  }, []);

  return (
    <>
      <div className="m-0 p-12 px-14 w-screen h-screen bg-cover bg-custom-pattern">
        <h1 className="inline-flex text-3xl p-2 my-8 font-black mb-6 text-white border">Training Modules</h1>
        {loading ? (
          <div class="border border-blue-300 shadow rounded-md p-4 max-w-xl w-full mx-auto">
          <div class="animate-pulse flex space-x-4">
            <div class="rounded-full bg-slate-700 h-10 w-10"></div>
            <div class="flex-1 space-y-6 py-1">
              <div class="h-2 bg-slate-700 rounded"></div>
              <div class="space-y-3">
                <div class="grid grid-cols-3 gap-4">
                  <div class="h-2 bg-slate-700 rounded col-span-2"></div>
                  <div class="h-2 bg-slate-700 rounded col-span-1"></div>
                </div>
                <div class="h-2 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <ul className="space-y-6">
            {videos.map(video => (
              <li key={video.id} className="bg-white shadow-lg text-white rounded-lg overflow-hidden border border-gray-200 w-auto hover:shadow-xl transition-shadow duration-300">
                <Link
                  href={`/${video.id}`}
                  className={`block p-4 ${
                    video.id === 2 || progress[video.id - 2]?.progress === 1
                      ? progress[video.id]?.progress === 1 
                        ? 'bg-green-500 hover:bg-green-700 pointer-events-auto' 
                        : 'bg-white hover:bg-slate-300 pointer-events-auto'
                      : 'bg-slate-100 pointer-events-none opacity-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold text-gray-900">{video.title}</span>
                      <span className="text-sm text-gray-600 mt-1">
                        {progress[video.id] !== undefined
                          ? `Progress: ${(((progress[video.id].progress || 0) * 100).toFixed(2))}%`
                          : 'Loading...'}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7 7l7-7-7-7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
