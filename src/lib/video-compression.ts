import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const SUPABASE_FREE_LIMIT = 50 * 1024 * 1024; // 50 MB
const TARGET_SIZE = 44 * 1024 * 1024; // 44 MB (marge de sécurité)
const TARGET_HEIGHT = 720;

let ffmpegInstance: FFmpeg | null = null;

async function loadFFmpeg(
  onLoadProgress?: (message: string) => void
): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  ffmpegInstance = ffmpeg;

  onLoadProgress?.("Chargement du moteur de compression...");

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      "application/wasm"
    ),
  });

  return ffmpeg;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Impossible de lire la vidéo"));
    };
    video.src = URL.createObjectURL(file);
  });
}

export function needsCompression(file: File): boolean {
  return file.type.startsWith("video/") && file.size > SUPABASE_FREE_LIMIT;
}

export async function compressVideo(
  file: File,
  onProgress?: (progress: number) => void,
  onLoadProgress?: (message: string) => void
): Promise<File> {
  if (!needsCompression(file)) return file;

  const duration = await getVideoDuration(file);

  const ffmpeg = await loadFFmpeg(onLoadProgress);

  ffmpeg.on("progress", ({ progress }) => {
    onProgress?.(Math.min(Math.round(progress * 100), 100));
  });

  const inputExt = file.name.split(".").pop() || "mp4";
  const inputName = `input.${inputExt}`;
  const outputName = "output.mp4";

  // Calcul du bitrate vidéo pour tenir dans 44 MB
  const targetBits = TARGET_SIZE * 8;
  const audioBitrate = 128; // kbps
  const videoBitrate = Math.max(
    500,
    Math.floor((targetBits / duration - audioBitrate * 1000) / 1000)
  );

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  await ffmpeg.exec([
    "-i",
    inputName,
    "-vf",
    `scale=-2:${TARGET_HEIGHT}`,
    "-c:v",
    "libx264",
    "-b:v",
    `${videoBitrate}k`,
    "-c:a",
    "aac",
    "-b:a",
    `${audioBitrate}k`,
    "-r",
    "30",
    outputName,
  ]);

  const data = await ffmpeg.readFile(outputName);

  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: "video/mp4" });
  const compressedName = file.name.replace(/\.[^.]+$/, ".mp4");

  return new File([blob], compressedName, { type: "video/mp4" });
}
