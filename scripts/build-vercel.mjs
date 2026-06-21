import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public');

const webappUrl = (
  process.env.WEBAPP_DEPLOYMENT_URL ||
  process.env.WEBAPP_URL ||
  ''
).trim();

fs.mkdirSync(outDir, { recursive: true });

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>올인원 학급 운영</title>
  <link href="https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Gaegu', cursive, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #ffe4ec 0%, #d4f1f9 50%, #e8dff5 100%);
      color: #4a4a6a;
    }
    .card {
      background: #fff;
      border-radius: 20px;
      padding: 36px 28px;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 8px 32px rgba(180, 160, 200, 0.25);
      animation: fadeIn 0.5s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .icon { font-size: 48px; margin-bottom: 12px; }
    h1 { color: #ff8fab; font-size: 1.8rem; margin-bottom: 8px; }
    p { line-height: 1.7; margin-bottom: 16px; font-size: 1.05rem; }
    .note {
      background: #fff9f0;
      border-left: 4px solid #a8dff5;
      padding: 12px 14px;
      text-align: left;
      border-radius: 10px;
      font-size: 0.95rem;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      border-radius: 50px;
      background: linear-gradient(135deg, #ffb3c6, #ff8fab);
      color: #fff;
      text-decoration: none;
      font-weight: 700;
      font-size: 1.15rem;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 16px rgba(255, 143, 171, 0.4);
    }
    .btn:hover { transform: translateY(-2px); }
    .warn { color: #e05a7a; font-weight: 700; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
  </style>
  ${webappUrl ? `<meta http-equiv="refresh" content="0;url=${webappUrl}">` : ''}
</head>
<body>
  <div class="card">
    <div class="icon">📚</div>
    <h1>올인원 학급 운영</h1>
    ${
      webappUrl
        ? `<p>잠시 후 앱으로 이동합니다...</p>
           <p><a class="btn" href="${webappUrl}">앱 열기 ✨</a></p>`
        : `<p class="warn">Vercel 환경 변수가 설정되지 않았습니다.</p>
           <div class="note">
             이 프로젝트는 <strong>Google Apps Script</strong>에서 실행되는 웹앱입니다.
             Vercel에서는 앱 본체가 아니라 <strong>접속 안내·리다이렉트 페이지</strong>만 제공합니다.
             <br><br>
             Vercel 대시보드 → Settings → Environment Variables 에
             <code>WEBAPP_DEPLOYMENT_URL</code> 을 Google Apps Script 웹앱 URL로 등록한 뒤
             <strong>Redeploy</strong> 하세요.
           </div>
           <p>Google Apps Script에서 배포한 URL로 직접 접속해 주세요.</p>`
    }
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
console.log(webappUrl ? 'Redirect page built → ' + webappUrl : 'Setup page built (WEBAPP_DEPLOYMENT_URL missing)');
