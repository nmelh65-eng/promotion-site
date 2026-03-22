"use client";

import { useEffect, useState } from "react";

interface WorkStatsProps {
  id: string;
  readingTime: number;
  initialViews: number;
  initialLikes: number;
}

export default function WorkStats({
  id,
  readingTime,
  initialViews,
  initialLikes,
}: WorkStatsProps) {
  const [views, setViews] = useState(initialViews || 0);
  const [likes, setLikes] = useState(initialLikes || 0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const viewedKey = `viewed:${id}`;
    const likedKey = `liked:${id}`;

    if (typeof window !== "undefined" && localStorage.getItem(likedKey)) {
      setLiked(true);
    }

    if (typeof window !== "undefined" && sessionStorage.getItem(viewedKey)) {
      return;
    }

    let cancelled = false;

    async function sendView() {
      try {
        const res = await fetch("/api/works", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action: "view" }),
        });

        if (!res.ok) {
          return;
        }

        const result = await res.json();

        if (!cancelled && result?.ok && result?.data?.views != null) {
          setViews(result.data.views);
        }

        if (!cancelled && typeof window !== "undefined") {
          sessionStorage.setItem(viewedKey, "1");
        }
      } catch (error) {
        console.error("View update error:", error);
      }
    }

    sendView();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleLike() {
    if (liked || likeLoading) return;

    try {
      setLikeLoading(true);

      const likedKey = `liked:${id}`;
      if (typeof window !== "undefined" && localStorage.getItem(likedKey)) {
        setLiked(true);
        return;
      }

      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        return;
      }

      const result = await res.json();

      if (result?.ok && result?.data?.likes != null) {
        setLikes(result.data.likes);
        setLiked(true);

        if (typeof window !== "undefined") {
          localStorage.setItem(likedKey, "1");
        }
      }
    } catch (error) {
      console.error("Like update error:", error);
    } finally {
      setLikeLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
      <span>{readingTime} мин чтения</span>
      <span>👁 {views}</span>
      <button
        type="button"
        onClick={handleLike}
        disabled={liked || likeLoading}
        className={
          "transition-colors " +
          (liked
            ? "text-pink-400 cursor-default"
            : "text-gray-400 hover:text-pink-300")
        }
      >
        ❤ {likes}
      </button>
    </div>
  );
}
