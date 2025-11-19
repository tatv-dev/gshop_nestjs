import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'menu_items');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export async function saveBase64Images(base64List: string[]): Promise<string[]> {
  const savedPaths: string[] = [];

  for (const base64String of base64List) {
    try {
      const matches = base64String.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!matches) throw new Error('Invalid base64 image format');

      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `${uuidv4()}.jpg`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      // Sharp gọi đúng cho cả ESM và CJS
      const sharpInstance = (sharp as any).default ? (sharp as any).default(buffer) : (sharp as any)(buffer);
      const metadata = await sharpInstance.metadata();

      let image = sharpInstance.jpeg({ quality: 80 });
      if (buffer.length > 2 * 1024 * 1024) {
        image = (sharp as any)(buffer).jpeg({ quality: 60 });
      }

      await image.toFile(filePath);
      savedPaths.push(`/uploads/menu_items/${fileName}`);
      console.log(`[image-utils] Saved: ${fileName} (${metadata.format})`);
    } catch (err) {
      console.error('❌ [image-utils] Error:', err.message);
      throw new Error('Cannot process image');
    }
  }

  return savedPaths;
}
