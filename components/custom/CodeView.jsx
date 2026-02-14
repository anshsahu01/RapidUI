"use client";
import React, { useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import Lookup from "@/data/Lookup";
import axios from "axios";
import { MessagesContext } from "@/context/MessagesContext";
// import { UserDetailContext } from "@/context/UserDetailContext";
import Prompt from "@/data/Prompt";
import { useContext } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { useConvex } from "convex/react";
import { Loader } from "react-feather";
import SandPackPreviewClient from "./SandPackPreviewClient";
import { toast } from "sonner";

function CodeView() {
  const { id } = useParams();
  const convex = useConvex();
  const [activeTab, setActiveTab] = useState("code");
  const [files, setFiles] = React.useState(Lookup?.DEFAULT_FILE);
  const { messages } = useContext(MessagesContext);
  // const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const UpdateFiles = useMutation(api.workspace.UpdateFiles);
  const [loading, setLoading] = React.useState(false);
  const lastGeneratedUserMsgRef = React.useRef("");

  React.useEffect(() => {
    if (messages?.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const messageKey = `${id}:${messages.length}:${lastMessage?.role}:${lastMessage?.content ?? ""}`;
      if (
        lastMessage?.role === "user" &&
        messageKey !== lastGeneratedUserMsgRef.current
      ) {
        lastGeneratedUserMsgRef.current = messageKey;
        GenerateAiCode(messages);
      }
    }
  }, [messages]);

  React.useEffect(() => {
    id && GetFiles();
  }, [id]);

  const normalizeFiles = (incomingFiles) => {
    if (!incomingFiles || typeof incomingFiles !== "object") {
      return {};
    }

    const normalized = {};
    for (const [filePath, fileValue] of Object.entries(incomingFiles)) {
      const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
      if (typeof fileValue === "string") {
        normalized[normalizedPath] = { code: fileValue };
      } else if (fileValue?.code && typeof fileValue.code === "string") {
        normalized[normalizedPath] = { code: fileValue.code };
      }
    }

    if (!normalized["/App.js"] && normalized["/src/App.js"]) {
      normalized["/App.js"] = normalized["/src/App.js"];
    }

    if (!normalized["/App.js"]) {
      normalized["/App.js"] = Lookup.DEFAULT_FILE["/App.js"];
    }

    return normalized;
  };

  const GetFiles = async () => {
    setLoading(true);
    const result = await convex.query(api.workspace.GetWorkspaceData, {
      workspaceId: id,
    });
    const normalizedFiles = normalizeFiles(result?.fileData);
    const mergedFiles = { ...Lookup.DEFAULT_FILE, ...normalizedFiles };
    setFiles(mergedFiles);
    setLoading(false);
  };


  const GenerateAiCode = async (messageList) => {
    setLoading(true);
    const PROMPT = JSON.stringify(messageList) + " " + Prompt.CODE_GEN_PROMPT;
    try {
      const result = await axios.post("/api/gen-ai-code", {
        prompt: PROMPT,
      });
      console.log(result.data);
      const aiResp = result.data;
      const normalizedFiles = normalizeFiles(aiResp?.files);
      const mergedFiles = { ...Lookup.DEFAULT_FILE, ...normalizedFiles };
      setFiles(mergedFiles);
      await UpdateFiles({
        workspaceId: id,
        files: normalizedFiles,
      });

    } catch (error) {
      console.error("Error in GenerateAiCode:", error);
      toast.error("Failed to generate AI code. Please try again later.");
    } finally {
      setActiveTab("preview");
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="bg-[#181818] w-full p-2 border border-neutral-800">
        <div className="flex items-center flex-wrap shrink-0 bg-black p-1 w-[160px] gap-2 justify-center rounded-full">
          <h2
            className={`text-sm font-medium transition-all duration-200 cursor-pointer px-3 py-1 rounded-full ${
              activeTab === "code"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                : "text-gray-300 hover:text-amber-300 hover:bg-amber-500/10"
            }`}
            onClick={() => setActiveTab("code")}
          >
            Code
          </h2>
          <h2
            className={`text-sm font-medium transition-all duration-200 cursor-pointer px-3 py-1 rounded-full ${
              activeTab === "preview"
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md"
                : "text-gray-300 hover:text-teal-300 hover:bg-teal-500/10"
            }`}
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </h2>
        </div>
      </div>
      <SandpackProvider
        files={files}
        template="react"
        theme="dark"
        customSetup={{
          dependencies: {
            ...Lookup.DEPENDANCY,
          },
        }}
        options={{ externalResources: ["https://cdn.tailwindcss.com"] }}
      >
        {activeTab === "code" ? (
          <SandpackLayout>
            <>
              <SandpackFileExplorer style={{ height: "80vh" }} />
              <SandpackCodeEditor style={{ height: "80vh" }} />
            </>
          </SandpackLayout>
        ) : (
          <div className="w-full border border-neutral-800 bg-[#111]">
            <SandPackPreviewClient />
          </div>
        )}
      </SandpackProvider>
      {loading && (
        <div className="p-10 bg-gray-900 opacity-80 absolute top-0 rounded-lg w-full h-full flex items-center justify-center">
          <Loader className="animate-spin h-10 w-10 text-white" />
          <h2 className="text-white ml-3">Generating Your Files...</h2>
        </div>
      )}
    </div>
  );
}

export default CodeView;
