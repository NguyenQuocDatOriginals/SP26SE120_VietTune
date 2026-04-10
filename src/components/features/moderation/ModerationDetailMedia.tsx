/**
 * Tài liệu hoá tiếng Việt cho file TSX.
 * Ghi chú: TSX/JSX không thể chú thích "từng dòng" bằng `//` trong phần JSX mà không phá cú pháp,
 * nên file này được chú thích theo khối/chức năng chính (component/handler/luồng dữ liệu).
 */
import AudioPlayer from '@/components/features/AudioPlayer';
import VideoPlayer from '@/components/features/VideoPlayer';
import type { Recording } from '@/types';

export function ModerationDetailMedia({
  mediaSrc,
  isVideo,
  title,
  artist,
  recording,
}: {
  mediaSrc: string | undefined;
  isVideo: boolean;
  title?: string;
  artist?: string;
  recording: Recording | null;
}) {
  if (!mediaSrc || !recording) {
    return <p className="text-sm text-white/70 py-2">Không có bản thu để phát.</p>;
  }

  return (
    <div
      className="rounded-xl overflow-hidden bg-black/20"
      role="region"
      aria-label={
        isVideo
          ? `Trình phát video: ${title || 'Bản thu'}`
          : `Trình phát âm thanh: ${title || 'Bản thu'}`
      }
    >
      {isVideo ? (
        <VideoPlayer
          src={mediaSrc}
          title={title}
          artist={artist}
          recording={recording}
          showContainer={true}
          showMetadataTags={false}
        />
      ) : (
        <AudioPlayer
          src={mediaSrc}
          title={title}
          artist={artist}
          recording={recording}
          showContainer={true}
          showMetadataTags={false}
        />
      )}
    </div>
  );
}
