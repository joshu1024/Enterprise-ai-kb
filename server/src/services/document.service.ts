import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import * as cheerio from "cheerio";

import { createRequire } from "module";
import { fileURLToPath } from "url";
const require = createRequire(fileURLToPath(import.meta.url));

export const parsePDF = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const PDFParser = require("pdf2json");
    const parser = new PDFParser();

    parser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        const text = pdfData.Pages
          .flatMap((page: any) => page.Texts)
          .map((t: any) =>
            t.R.map((r: any) => {
              try {
                return decodeURIComponent(r.T);
              } catch {
                return r.T; 
              }
            }).join("")
          )
          .join(" ");
        resolve(text);
      } catch (err) {
        reject(err);
      }
    });

    parser.on("pdfParser_dataError", (err: any) => {
      reject(new Error(err.parserError));
    });

    parser.loadPDF(filePath);
  });
};

export const parseDOCX=async(filePath:string):Promise<string>=>{
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({buffer});
    return result.value;
    
}
export const parseHTML=(html:string):string=>{
    const $ = cheerio.load(html);
    $("script,style,nav,header,footer").remove();
    return $("body").text().replace(/\s+/g, " ").trim();
}
export const parseDocument=async(filePath:string,mimeType:string):Promise<string>=>{
    const ext = path.extname(filePath).toLowerCase();
    if(ext === ".pdf" || mimeType === "application/pdf"){
        return parsePDF(filePath)
    }
     if (ext === ".docx" || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return parseDOCX(filePath);
  }
  if (ext === ".html" || mimeType === "text/html") {
    const html = fs.readFileSync(filePath, "utf-8");
    return parseHTML(html);
  }
  if (ext === ".txt" || mimeType === "text/plain") {
    return fs.readFileSync(filePath, "utf-8");
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

interface Chunk {
    text:string;
    chunkIndex:number;
    strategy:string;
}
export const recursiveChunk=(text:string,maxSize:number = 500,overlap:number=50):Chunk[]=>{
    const separators = ["\n\n","\n",". "," "];
    const splitText = (str: string, separatorIndex: number = 0): string[] => {
    if (str.length <= maxSize) return [str];
    if (separatorIndex >= separators.length) {
      const chunks: string[] = [];
      let start = 0;
      while (start < str.length) {
        chunks.push(str.slice(start, start + maxSize));
        start += maxSize - overlap;
      }
      return chunks;
    }

    const sep = separators[separatorIndex];
    const parts = str.split(sep).filter((p) => p.trim());
    const result: string[] = [];
    let current = "";

    for (const part of parts) {
      const candidate = current ? current + sep + part : part;
      if (candidate.length <= maxSize) {
        current = candidate;
      } else {
        if (current) result.push(current.trim());
        if (part.length > maxSize) {
          result.push(...splitText(part, separatorIndex + 1));
          current = "";
        } else {
          current = part;
        }
      }
    }

    if (current) result.push(current.trim());
    return result;
  };

  return splitText(text)
    .filter((t) => t.length > 20)
    .map((text, i) => ({
      text,
      chunkIndex: i,
      strategy: "recursive",
    }));
}