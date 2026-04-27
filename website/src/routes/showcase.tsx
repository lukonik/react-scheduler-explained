import { Activity, Gauge, Play, RotateCcw, Square, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  scheduleCallback,
  UserBlockingPriority,
} from "@lonik/react-scheduler-experimental";
export const Route = createFileRoute("/showcase")({
  component: RouteComponent,
  ssr: false,
});


const SimpleJsAnimation = () => {
  // 1. Create a reference to the DOM element we want to animate
  const boxRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let position = 0;
    let direction = 1;

    // 2. Define the animation function
    const animate = () => {
      position += 2 * direction; // Move 2 pixels per frame
      
      // Reverse direction if it hits the bounds (0 to 200px)
      if (position >= 200 || position <= 0) {
        direction *= -1; 
      }

      // 3. Apply the new position directly to the DOM element
      if (boxRef.current) {
        boxRef.current.style.transform = `translateX(${position}px)`;
      }

      // 4. Request the next frame
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start the loop
    animate();

    // 5. Cleanup function: cancel the animation when the component unmounts
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', width: '250px' }}>
      <div
        ref={boxRef}
        style={{
          width: '50px',
          height: '50px',
          backgroundColor: '#3b82f6', // Blue color
          borderRadius: '8px',
        }}
      />
    </div>
  );
};



function RouteComponent() {
  useEffect(() => {
    let sum = 0;
    let i = 0;

    function execute() {
      i++;
      sum += 10;
      if (i < 100000) {
        return execute;
      }
      return null;
    }

    scheduleCallback(UserBlockingPriority, execute);
  }, []);

  return <div> <SimpleJsAnimation/> </div>;
}


