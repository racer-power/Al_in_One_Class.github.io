/**
 * 환경 변수 관리 (Script Properties)
 *
 * Google Apps Script는 .env 파일을 직접 읽을 수 없습니다.
 * 민감 정보는 Script Properties에 저장하고, 로컬에서는 .env 파일로 관리합니다.
 *
 * Script Properties 키:
 *   SPREADSHEET_ID        - (선택) 스프레드시트 ID. 스프레드시트에 바인딩된 경우 생략 가능
 *   DRIVE_FOLDER_NAME     - (선택) 서명 PNG 저장 Drive 폴더 이름
 *   SIGNATURE_FOLDER_ID   - (자동) Drive 폴더 ID — ensureDriveFolder_()가 설정
 *   IMAGE_LOAD_DELAY_MS   - (선택) 서명 이미지 공유 반영 대기 시간(ms)
 */

var ENV_KEYS = {
  SPREADSHEET_ID: 'SPREADSHEET_ID',
  DRIVE_FOLDER_NAME: 'DRIVE_FOLDER_NAME',
  SIGNATURE_FOLDER_ID: 'SIGNATURE_FOLDER_ID',
  IMAGE_LOAD_DELAY_MS: 'IMAGE_LOAD_DELAY_MS'
};

function getScriptEnv_(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function getConfig_() {
  var delayMs = parseInt(getScriptEnv_(ENV_KEYS.IMAGE_LOAD_DELAY_MS) || '1500', 10);
  return {
    SHEET_STUDENTS: '학생명단',
    SHEET_ATTENDANCE: '출결로그',
    SHEET_NOTICE: '공지사항',
    DRIVE_FOLDER_NAME: getScriptEnv_(ENV_KEYS.DRIVE_FOLDER_NAME) || '학급운영_서명보관',
    DRIVE_FOLDER_PROP: ENV_KEYS.SIGNATURE_FOLDER_ID,
    IMAGE_LOAD_DELAY_MS: isNaN(delayMs) ? 1500 : delayMs
  };
}

/**
 * 최초 1회 실행: Script Properties에 환경 변수 등록
 * 아래 env 객체 값을 본인 환경에 맞게 수정한 뒤 ▶ 실행하세요.
 */
function setupEnvironment() {
  var env = {
    SPREADSHEET_ID: '',
    DRIVE_FOLDER_NAME: '학급운영_서명보관',
    IMAGE_LOAD_DELAY_MS: '1500'
  };

  var props = PropertiesService.getScriptProperties();
  Object.keys(env).forEach(function (key) {
    var value = String(env[key]).trim();
    if (value) {
      props.setProperty(key, value);
    }
  });

  SpreadsheetApp.getUi().alert(
    '환경 변수가 등록되었습니다.\n\n' +
    '등록된 항목은 Apps Script → 프로젝트 설정 → Script properties 에서 확인할 수 있습니다.'
  );
}
