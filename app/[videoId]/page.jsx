"use client";
import { useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { useEffect, useState } from 'react';

export default function VideoPage({ params }) {
  const { videoId } = params; 
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/videos/progress/video/${videoId}`);
        const data = await response.json();
        setProgress(data.progress.progress);
      } catch (err) {
        console.error('Error fetching video progress:', err);
        setProgress(0);
      }
    };

    fetchProgress();
  }, [videoId]);

  useEffect(() => {
    if (progress === 1) {
      setIsNextEnabled(true);
    }
  }, [progress]);

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    sources: [
      {
        src: `/videos/Video${videoId}.mp4`,
        type: 'video/mp4',
      },
    ],
  };

  const videoContent = {
    2: {
      title: "Module 1: Personal Protective Equipment (PPE)",
      content: `Importance of PPE: Explain the significance of PPE in preventing injuries and illnesses in the workplace.
        Types of PPE: Introduce various types of PPE, such as hard hats, safety glasses, gloves, earplugs, respirators, and steel-toed boots.
        Proper Use and Maintenance: Demonstrate how to properly use and maintain PPE, including inspection procedures and storage guidelines.`,
      nextModule: "Module 2: Fire Safety and Prevention",
    },
    4: {
      title: "Module 2: Fire Safety and Prevention",
      content: "Fire Hazards: Identify potential fire hazards in the workplace such as electrical equipment, open flames and chemical reactions.Fire Extinguisher Training: Train learners on how to use a fire extinguisher correctly, including the PASS method (Pull, Aim, Squeeze, Sweep)",
      
      nextModule: "Module 3: Slip, Trip, and Fall Prevention",
    },
    6: {
      title: "Module 3: Slip, Trip, and Fall Prevention",
      content: `Hazards: Identify potential hazards that can lead to slips,
      trips, and falls, such as wet floors, uneven surfaces, loose
      cords, and cluttered walkways.
      Prevention Measures:Explain prevention measures to prevent
      slips, trips, and falls, including:
      Cleaning up spills promptly
      Using non-slip mats or signs on stairs
      Securing cords and cables
      Maintaining a clean and organized workspace
      Wearing proper footwear
      Reporting Incidents: Emphasize the importance of reporting
      incidents to supervisors or safety personnel.
`,
      
      nextModule: "Module 4: Electrical Safety",
    },
  };

  const content = videoContent[videoId];
  const prevVideoId = Math.max(parseInt(videoId) - 2, 2); 
  const nextVideoId = Math.min(parseInt(videoId) + 2, 6);

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (isNextEnabled) {
      router.push(`/${nextVideoId}`);
    }
  };

  const handlePrevious = () => {
    router.push(`/${prevVideoId}`);
  };

  const handleHome = () => {
    router.push(`/`);
  };

  const handleVideoEnd = () => {
    setProgress(1);
  };

  return (
    <div className="container mx-auto p-4">
      <button 
          onClick={handleHome} 
          className="my-4 px-4 py-2 text-white bg-black hover:bg-black-700 rounded"
        >
          Dashboard
      </button>
      <div className="flex flex-row md:flex-row items-center mb-4">
        <button 
          onClick={handleBack} 
          className="mr-4 mb-2 md:mb-0 px-4 py-2 text-white bg-blue-500 hover:bg-blue-700 rounded"
        >
          Back
        </button>
        <button 
          onClick={handlePrevious} 
          className="px-4 py-2 text-white bg-gray-500 hover:bg-gray-700 rounded"
          disabled={prevVideoId <= 0} 
        >
          &#9664; 
        </button>
      </div>

      {content && (
        <>
          <h1 className="text-2xl font-bold mb-4">{content.title}</h1>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3 mb-4 md:mb-0">
              <p>{content.content}</p>
            </div>
            <div className="md:w-1/3">
              <VideoPlayer options={videoJsOptions} video={{ id: videoId }} onVideoEnd={handleVideoEnd} />
            </div>
          </div>
          <div className="mt-4 flex flex-col md:flex-row">
            <button 
              onClick={handleNext} 
              className={`mb-2 md:mb-0 md:mr-2 px-4 py-2 text-white rounded ${
                isNextEnabled ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
              disabled={!isNextEnabled}
            >
              Next: {content.nextModule}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
