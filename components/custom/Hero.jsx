"use client";
import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessagesContext } from "@/context/MessagesContext";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import Lookup from "@/data/Lookup";
import Colors from "@/data/Colors";
import { ArrowRight, Link, Loader2, Wand2 } from "lucide-react";



function Hero() {
  const [userInput, setUserInput] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { messages, setMessages } = useContext(MessagesContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const CreateWorkspace = useMutation(api.workspace.CreateWorkSpace);
  const router = useRouter();

  const onGenerate = async (input) => {
    if (!input?.trim()) return;

    const msg = { role: "user", content: input };
    setMessages([msg]);

    try {
      setIsLoading(true);
      const workspaceId = await CreateWorkspace({
        messages: [msg],
      });

      setIsNavigating(true);
      router.push("/workspace/" + workspaceId);
    } catch (error) {
      console.error("Error creating workspace:", error);
      setIsLoading(false);
      setIsNavigating(false);
    }
  };

  const enhancePrompt = async () => {
    if (!userInput?.trim()) return;

    setIsEnhancing(true);
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await response.json();
      if (data.enhancedPrompt) {
        setUserInput(data.enhancedPrompt);
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const navigateToWorkspace = (workspaceId) => {
    setIsNavigating(true);
    router.push("/workspace/" + workspaceId);
  };

  // Extract first user message from workspace
  const getWorkspaceTitle = (workspace) => {
    if (workspace?.messages && workspace.messages.length > 0) {
      const firstUserMsg = workspace.messages.find((m) => m.role === "user");
      if (firstUserMsg?.content) {
        return (
          firstUserMsg.content.slice(0, 60) +
          (firstUserMsg.content.length > 60 ? "..." : "")
        );
      }
    }
    return "Untitled Workspace";
  };

  return (
    <>
      {/* Navigation Loader Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-amber-400 animate-spin" />
            <p className="text-white text-lg font-medium">
              Moving to your workspace...
            </p>
          </div>
        </div>
      )}

      {/* Background Gradient Animation */}
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(15, 23, 32)"
        gradientBackgroundEnd="rgb(35, 20, 12)"
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

      {/* Hero Content */}
      <div className="flex flex-col items-center mt-24 xl:mt-36 gap-2 px-4">
        <h2 className="font-bold text-4xl text-center">
          Turn your{" "}
          <span className="font-['Press_Start_2P'] bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-orange-400 to-teal-300 animate-gradient">
            ideas
          </span>{" "}
          into{" "}
          <span className="font-['Press_Start_2P'] bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-200 animate-gradient">
            apps
          </span>{" "}
          instantly
        </h2>
        <p className="text-gray-100 font-medium">{Lookup.HERO_DESC}</p>

        <div
          className="p-5 border rounded-xl max-w-xl w-full mt-3"
          style={{ backgroundColor: Colors.BACKGROUND }}
        >
          <div className="flex gap-2">
            <textarea
              value={userInput}
              placeholder={Lookup.INPUT_PLACEHOLDER}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (
                    userInput?.trim() &&
                    !isLoading &&
                    !isNavigating &&
                    !isEnhancing
                  ) {
                    onGenerate(userInput);
                  }
                }
              }}
              spellCheck={false}
              className="outline-none bg-transparent w-full h-32 max-h-56 resize-none"
              disabled={isLoading || isNavigating || isEnhancing}
            />
            {userInput && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={enhancePrompt}
                  disabled={isEnhancing || isLoading || isNavigating}
                  className={`p-2 h-10 w-10 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    isEnhancing || isLoading || isNavigating
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  } bg-teal-500 hover:bg-teal-600`}
                  title="Enhance prompt with AI"
                >
                  {isEnhancing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Wand2 className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() =>
                    !isLoading &&
                    !isNavigating &&
                    !isEnhancing &&
                    onGenerate(userInput)
                  }
                  disabled={isLoading || isNavigating || isEnhancing}
                  className={`p-2 h-10 w-10 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    isLoading || isNavigating || isEnhancing
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  } bg-amber-500 hover:bg-orange-500`}
                  title="Generate workspace"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          <div>
            <Link className="h-5 w-5" />
          </div>
        </div>

        <div className="flex mt-5 flex-wrap max-w-2xl items-center justify-center gap-3">
          {Lookup?.SUGGESTIONS.map((s, index) => (
            <h2
              key={index}
              onClick={() =>
                !isLoading && !isNavigating && !isEnhancing && onGenerate(s)
              }
              className="p-1 px-2 border rounded-full text-xs text-gray-400 hover:text-white cursor-pointer transition-colors"
            >
              {s}
            </h2>
          ))}
        </div>


      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center items-center text-xs text-gray-400">
        <span>Built by Ansh Sahu</span>
      </div>
    </>
  );
}

export default Hero;
