import { TRPCError } from "@trpc/server";

const MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024;
const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function isExpectedImageSignature(contentType: string, buffer: Buffer) {
  if (contentType === "image/jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (contentType === "image/png") return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (contentType === "image/webp") return buffer.length > 12 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  return false;
}

export function parseProductImage(dataUrl: string, contentType: string) {
  if (!supportedImageTypes.has(contentType)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Formato de imagem não permitido." });
  }

  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || match[1] !== contentType) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Imagem inválida." });
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || buffer.length > MAX_PRODUCT_IMAGE_BYTES) {
    throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Cada imagem deve ter no máximo 8 MB." });
  }

  if (!isExpectedImageSignature(contentType, buffer)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "O conteúdo do arquivo não corresponde ao tipo de imagem informado." });
  }

  return buffer;
}

export function extensionForContentType(contentType: string) {
  const extensions: Record<string, string> = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/mp4": "m4a",
    "audio/webm": "webm",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  const extension = extensions[contentType];
  if (!extension) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Tipo de arquivo não permitido." });
  }
  return extension;
}
