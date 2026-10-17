import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const port = Number(process.env.PORT || 5174);
const types = {
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".webmanifest":"application/manifest+json",
  ".png":"image/png",
  ".md":"text/markdown; charset=utf-8"
};

http.createServer((req,res)=>{
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const target = path.resolve(root, "." + urlPath);
  if (!target.startsWith(root)) { res.writeHead(403); res.end("Forbidden"); return; }
  fs.readFile(target, (err,buf)=>{
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, {
      "Content-Type": types[path.extname(target)] || "application/octet-stream",
      "Cache-Control":"no-cache"
    });
    res.end(buf);
  });
}).listen(port,"127.0.0.1",()=>{
  console.log(`PA LINE CREW + COMMAND running at http://localhost:${port}`);
});
