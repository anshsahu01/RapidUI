import ChatView from "@/components/custom/ChatView";
import CodeView from "@/components/custom/CodeView";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import React from "react";

function Workspace() {
  return (
    <>
      {/* Background Gradient Animation - same as Hero */}
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(12, 20, 30)"
        gradientBackgroundEnd="rgb(30, 18, 10)"
        firstColor="245, 158, 11"
        secondColor="20, 184, 166"
        thirdColor="251, 146, 60"
        fourthColor="14, 165, 233"
        fifthColor="249, 115, 22"
        pointerColor="45, 212, 191"
        size="80%"
        blendingValue="hard-light"
        interactive={true}
        containerClassName="fixed inset-0 -z-10"
      />

      {/* Workspace Content */}
      <div className="p-3 pr-5 mt-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ChatView />
          <div className="col-span-2">
            <CodeView />
          </div>
        </div>
      </div>
    </>
  );
}

export default Workspace;
