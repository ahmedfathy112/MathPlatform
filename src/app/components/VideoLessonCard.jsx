import { Play } from "lucide-react";

/**
 * Renders a single lesson's video + metadata. Accepts real data from
 * Supabase instead of hardcoded content.
 *
 * `videoUrl` may be either a direct playable file (mp4/HLS) or an embed
 * URL from an external host (e.g. Bunny.net's iframe player, YouTube
 * embed links). We use a simple heuristic to decide how to render it.
 */
export default function VideoLessonCard({
  title,
  description,
  videoUrl,
  durationLabel,
}) {
  const isEmbedUrl =
    typeof videoUrl === "string" &&
    (videoUrl.includes("iframe") ||
      videoUrl.includes("embed") ||
      videoUrl.includes("youtube.com"));

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="overflow-hidden rounded-[28px] bg-slate-950">
        <div className="aspect-video bg-black">
          {!videoUrl ? (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <Play size={28} />
            </div>
          ) : isEmbedUrl ? (
            <iframe
              className="h-full w-full"
              src={videoUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video className="h-full w-full" src={videoUrl} controls />
          )}
        </div>
      </div>
      <div className="space-y-2 p-6">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        {description ? (
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
        {durationLabel ? (
          <p className="text-sm text-slate-500">المدة: {durationLabel}</p>
        ) : null}
      </div>
    </div>
  );
}
