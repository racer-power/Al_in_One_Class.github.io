# 올인원 학급 운영 웹앱

Google Apps Script + Google Sheets + Google Drive 기반 학급 출결·공지·배움일지 웹앱입니다.

## 기능

- 학번 로그인 및 환영 메시지
- 공지사항 표시 (가장 최신)
- 월별 달력 + 출석일 표시
- 출석 / 퇴실 (배움일지 + 서명)
- 서명 PNG → Google Drive 저장, 시트에 `=IMAGE()` 수식으로 표시

## 프로젝트 구조

| 파일 | 설명 |
|------|------|
| `Code.gs` | 백엔드 API |
| `Env.gs` | 환경 변수 (Script Properties) |
| `Index.html` | 프론트엔드 HTML |
| `Styles.html` | CSS |
| `Client.html` | JavaScript |
| `appsscript.json` | 웹앱 매니페스트 |

## 설치

1. Google 스프레드시트 생성 → **확장 프로그램 → Apps Script**
2. 위 파일들을 Apps Script 프로젝트에 추가
3. `setupSheets` 실행 → 시트·Drive 폴더 초기화
4. `setupEnvironment` 실행 → Script Properties 등록 (선택)
5. **배포 → 새 배포 → 웹 앱** → URL 공유

자세한 내용은 [`설치가이드.txt`](./설치가이드.txt) 참고.

## 환경 변수

Google Apps Script는 서버에서 `.env` 파일을 읽을 수 없습니다.  
민감 정보는 **Script Properties**에 저장합니다.

### Script Properties 키

| 키 | 필수 | 설명 |
|----|------|------|
| `SPREADSHEET_ID` | 선택 | 스프레드시트 ID (바인딩 시 생략) |
| `DRIVE_FOLDER_NAME` | 선택 | 서명 폴더 이름 (기본: `학급운영_서명보관`) |
| `SIGNATURE_FOLDER_ID` | 자동 | Drive 폴더 ID |
| `IMAGE_LOAD_DELAY_MS` | 선택 | 이미지 로딩 대기 ms (기본: `1500`) |

### 등록 방법

**방법 1 — 함수 실행 (권장)**

1. `Env.gs`의 `setupEnvironment()` 안 `env` 객체 값 수정
2. Apps Script 편집기에서 `setupEnvironment` 선택 → ▶ 실행

**방법 2 — UI에서 직접**

Apps Script → **프로젝트 설정** → **Script properties** → 속성 추가

### 로컬 `.env` (Git 제외)

로컬에서 clasp 등을 쓸 때 참고용:

```bash
copy .env.example .env
```

`.env` 파일은 `.gitignore`에 포함되어 GitHub에 올라가지 않습니다.

## GitHub 업로드

```bash
git init
git add .
git commit -m "Initial commit: classroom management web app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/All_In_One_Class_Manegment.git
git push -u origin main
```

> `학급운영.txt`, `.env`, `.clasp.json` 등 민감 파일은 `.gitignore`로 제외됩니다.

## GitHub Pages 배포

### 404가 나오는 이유

1. **주소가 틀렸을 수 있습니다**  
   저장소가 `racer-power/Al_in_One_Class.github.io` 이므로 올바른 주소는:

   **https://racer-power.github.io/Al_in_One_Class.github.io/**

   `al_in_one_class.github.io` 는 **다른 GitHub 계정** 전용 주소라 404가 납니다.

2. **GitHub Pages가 아직 켜지지 않았을 수 있습니다** (아래 설정 필요)

### 설정 방법

1. GitHub 저장소 → **Settings → Pages**
2. **Build and deployment → Source** 를 **GitHub Actions** 로 선택
2. **Settings → Secrets and variables → Actions** → New repository secret
   - Name: `WEBAPP_DEPLOYMENT_URL`
   - Value: Google Apps Script 웹앱 URL
3. `main` 브랜치에 push 하면 Actions가 자동 배포합니다.
4. **Actions** 탭에서 `Deploy GitHub Pages` 워크플로가 성공했는지 확인

> 실제 앱(출석·공지·배움일지)은 **Google Apps Script URL**에서만 동작합니다.  
> GitHub Pages는 GAS 웹앱으로 보내는 **리다이렉트 페이지**입니다.

## Vercel 배포 (리다이렉트용)

이 앱의 **백엔드는 Google Apps Script**에서만 동작합니다.  
`Client.html`의 `google.script.run` API는 Vercel에서 실행되지 않으므로, Vercel에는 **GAS 웹앱으로 보내는 안내 페이지**만 배포합니다.

### Vercel에서 404 / 빈 화면이 나올 때

1. Vercel → **Settings → Environment Variables**
2. `WEBAPP_DEPLOYMENT_URL` = Google Apps Script 웹앱 URL (예: `https://script.google.com/macros/s/.../exec`)
3. **Deployments → Redeploy**

학생들에게는 **Google Apps Script 배포 URL**을 직접 공유하는 것이 가장 확실합니다.

## 라이선스

MIT
