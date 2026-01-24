"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function NotionStatus() {
  const { data: session, update } = useSession();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const isConnected = !!session?.user?.notionAccessToken;

  const handleConnect = () => {
    window.location.href = "/api/auth/notion";
  };

  const handleDisconnect = async () => {
    if (!confirm("Notion 연결을 해제하시겠습니까?")) return;

    setIsDisconnecting(true);
    try {
      const response = await fetch("/api/auth/notion/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        // 세션 업데이트
        await update();
        window.location.reload();
      } else {
        alert("연결 해제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      alert("연결 해제에 실패했습니다.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Notion {isConnected ? "연결됨" : "연결 안됨"}
            </p>
            {isConnected && session.user?.notionWorkspaceName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {session.user.notionWorkspaceIcon && (
                  <span className="mr-1">{session.user.notionWorkspaceIcon}</span>
                )}
                {session.user.notionWorkspaceName}
              </p>
            )}
          </div>
        </div>

        {isConnected ? (
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
          >
            {isDisconnecting ? "해제 중..." : "연결 해제"}
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Notion 연결하기
          </button>
        )}
      </div>
    </div>
  );
}
