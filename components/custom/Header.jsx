"use client";
import Image from "next/image";
import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import { ActionContext } from "@/context/ActionContext";
import Link from "next/link";
import { Download, Rocket, Github, ChevronLeft, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function Header() {
  const { action, setAction, isLoading, error, handleAction } =
    useContext(ActionContext);
  const [githubDialog, setGithubDialog] = React.useState(false);
  const [repoName, setRepoName] = React.useState("rapidui-project");
  const [isPrivate, setIsPrivate] = React.useState(false);
  const path = usePathname();
  const router = useRouter();
  const isWorkspace = path?.includes("workspace");

  const handleBackToHome = () => {
    router.push("/");
  };

  const onActionBtn = (actionType) => {
    setAction({
      actionType: actionType,
      timeStamp: Date.now(),
    });
  };

  const handleGithubClick = async () => {
    // Check for token in cookie
    const cookies = document.cookie.split(";").find((c) => c.includes("github_token"));

    if (!cookies) {
      // Redirect to GitHub OAuth
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/auth/github/callback`;
      const scope = "repo,user";
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    } else {
      // Show repo name dialog
      setGithubDialog(true);
    }
  };

  const handlePushToGithub = async () => {
    try {
      // Get workspace code (you need to provide this from your workspace state)
      const workspaceCode = {
        // This should come from your workspace component
        // Example: "package.json": JSON.stringify(packageJson),
        // "src/App.jsx": appCode,
      };

      await handleAction("pushToGithub", {
        repoName,
        isPrivate,
        commitMessage: "Initial commit from RapidUI",
        workspaceCode,
      });

      setGithubDialog(false);
      // Show success message
      alert("✅ Successfully pushed to GitHub!");
    } catch (err) {
      alert("❌ Error pushing to GitHub: " + err.message);
    }
  };

  return (
    <>
      <div className="p-4 flex justify-between items-center">
        {/* Logo + Text - Hide on workspace */}
        {!isWorkspace && (
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <Image src="/rapidui-logo.svg" alt="RapidUI Logo" width={32} height={32} />
            <div className="flex flex-col">
              <span className="font-semibold">RapidUI</span>
            </div>
          </Link>
        )}

        {/* Back to Home Button - Show only on workspace */}
        {isWorkspace && (
          <Button
            variant="outline"
            onClick={handleBackToHome}
            className="flex items-center gap-2 border border-white text-white hover:bg-transparent hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            back to home
          </Button>
        )}

        {/* Export, Deploy & GitHub buttons - only show on workspace pages */}
        {isWorkspace && (
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => onActionBtn("export")}
              className="flex items-center gap-2 cursor-pointer"
              disabled={isLoading}
            >
              Export <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onActionBtn("deploy")}
              className="text-white flex items-center gap-2"
              style={{
                background:
                  "linear-gradient(90deg, #f59e0b 0%, #f97316 100%)",
              }}
              disabled={isLoading}
            >
              Deploy <Rocket className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleGithubClick}
              className="text-white flex items-center gap-2"
              style={{
                background:
                  "linear-gradient(90deg, #14b8a6 0%, #0ea5e9 100%)",
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Pushing...
                </>
              ) : (
                <>
                  Push to GitHub <Github className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* GitHub Push Dialog */}
      <Dialog open={githubDialog} onOpenChange={setGithubDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Push to GitHub</DialogTitle>
            <DialogDescription>
              Configure your repository details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Repository Name</label>
              <Input
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="rapidui-project"
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="private" className="text-sm font-medium">
                Make repository private
              </label>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setGithubDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePushToGithub}
                disabled={isLoading}
                className="text-white"
                style={{
                  background:
                    "linear-gradient(90deg, #14b8a6 0%, #0ea5e9 100%)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Pushing...
                  </>
                ) : (
                  "Push to GitHub"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Header;

