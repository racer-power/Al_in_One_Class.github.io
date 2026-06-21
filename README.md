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

## 라이선스

MIT
