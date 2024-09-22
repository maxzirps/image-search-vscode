import * as https from "https";
import * as fs from "fs";
import * as path from "path";

export const downloadFile = (url: string, filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const getAvailableFilePath = (filePath: string): string => {
      let counter = 1;
      let ext = path.extname(filePath);
      let baseName = path.basename(filePath, ext);
      let dir = path.dirname(filePath);
      let newFilePath = filePath;

      while (fs.existsSync(newFilePath)) {
        newFilePath = path.join(dir, `${baseName}-${counter}${ext}`);
        counter++;
      }
      return newFilePath;
    };

    const finalFilePath = getAvailableFilePath(filePath);
    const file = fs.createWriteStream(finalFilePath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get file: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
        file.on("error", (err) => {
          fs.unlink(finalFilePath, () => reject(err));
        });
      })
      .on("error", (err) => {
        fs.unlink(finalFilePath, () => reject(err));
      });
  });
};
