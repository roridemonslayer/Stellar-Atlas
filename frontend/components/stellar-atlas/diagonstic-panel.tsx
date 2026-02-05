"use client";

/**
 * Diagnostic Component for Stellar Atlas
 * Add this to your app temporarily to test audio and constellation features
 * 
 * Usage: Import and render in your page.tsx temporarily
 */

import { useEffect, useState } from "react";
import { audioManager } from "@/lib/audio-manager";
import { fetchRandomStar } from "@/lib/api-services";

export function DiagnosticPanel() {
  const [audioStatus, setAudioStatus] = useState<string>("Not initialized");
  const [lastStar, setLastStar] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test audio initialization
  const testAudio = async () => {
    addResult("Testing audio...");
    const initialized = await audioManager.initialize();
    if (initialized) {
      addResult("✅ Audio initialized successfully");
      setAudioStatus("Ready");
      
      // Test a tone
      const played = await audioManager.playPlanetTone("test", "#ff6b6b");
      if (played) {
        addResult("✅ Test tone playing");
        setTimeout(() => {
          audioManager.stopPlanetTone("test");
          addResult("✅ Test tone stopped");
        }, 2000);
      } else {
        addResult("❌ Failed to play test tone");
      }
    } else {
      addResult("❌ Audio initialization failed");
      setAudioStatus("Failed");
    }
  };

  // Test constellation data
  const testConstellation = async () => {
    addResult("Fetching random star...");
    try {
      const star = await fetchRandomStar();
      setLastStar(star);
      
      if (star.location.constellation) {
        addResult(`✅ Star has constellation: ${star.location.constellation}`);
      } else {
        addResult("⚠️ Star missing constellation data");
      }
      
      addResult(`Star name: ${star.name}`);
      addResult(`Star type: ${star.type}`);
      addResult(`Planets: ${star.orbitingBodies?.length || 0}`);
    } catch (error) {
      addResult(`❌ Error fetching star: ${error}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-hidden
                    bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-semibold">🔧 Diagnostics</h3>
        <p className="text-xs text-white/50 mt-1">Audio: {audioStatus}</p>
      </div>
      
      <div className="p-4 space-y-2">
        <button
          onClick={testAudio}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
        >
          Test Audio System
        </button>
        
        <button
          onClick={testConstellation}
          className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm"
        >
          Test Constellation Data
        </button>
      </div>

      <div className="p-4 border-t border-white/10 max-h-64 overflow-y-auto">
        <h4 className="text-white/70 text-xs font-semibold mb-2">Results:</h4>
        <div className="space-y-1">
          {testResults.map((result, i) => (
            <p key={i} className="text-xs text-white/60 font-mono">
              {result}
            </p>
          ))}
        </div>
      </div>

      {lastStar && (
        <div className="p-4 border-t border-white/10 bg-white/5">
          <h4 className="text-white/70 text-xs font-semibold mb-2">Last Star Data:</h4>
          <pre className="text-xs text-white/60 overflow-auto max-h-32">
            {JSON.stringify(lastStar, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}