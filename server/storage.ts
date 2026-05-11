import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function storagePut(
  key: string,
  buffer: Buffer,
  mimeType: string = "image/jpeg"
): Promise<{ url: string; key: string }> {

  const publicId = key.replace(/\.[^.]+$/, "");

  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: "max-green-eats",
          resource_type: "image",
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Upload failed"));
          else resolve(result as { secure_url: string; public_id: string });
        }
      );
      uploadStream.end(buffer);
    }
  );

  return {
    url: result.secure_url,
    key: result.public_id,
  };
}
