/**
 * 올인원 학급 운영 웹앱 - 백엔드 (Google Apps Script)
 * Google Sheets + Google Drive 연동
 */

// 설정값은 Env.gs → getConfig_() / Script Properties 참고

// ─── 웹앱 진입점 ───────────────────────────────────────────

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('올인원 학급 운영')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ─── 스프레드시트 / 드라이브 ───────────────────────────────

function getSpreadsheet_() {
  var bound = SpreadsheetApp.getActiveSpreadsheet();
  if (bound) return bound;

  var spreadsheetId = getScriptEnv_(ENV_KEYS.SPREADSHEET_ID);
  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  throw new Error(
    '스프레드시트를 찾을 수 없습니다. 스프레드시트에 Apps Script를 연결하거나, ' +
    'setupEnvironment()로 SPREADSHEET_ID를 Script Properties에 등록하세요.'
  );
}

function getSheet_(name) {
  var sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet) {
    throw new Error('시트 "' + name + '" 을(를) 찾을 수 없습니다. 스프레드시트에 해당 탭을 만들어 주세요.');
  }
  return sheet;
}

/**
 * 앱 실행 시 드라이브 폴더 자동 생성·연동
 */
function ensureDriveFolder_() {
  var config = getConfig_();
  var props = PropertiesService.getScriptProperties();
  var savedId = props.getProperty(config.DRIVE_FOLDER_PROP);

  if (savedId) {
    try {
      var existing = DriveApp.getFolderById(savedId);
      if (existing.getName() === config.DRIVE_FOLDER_NAME) {
        return existing;
      }
    } catch (e) {
      // 저장된 ID가 유효하지 않으면 재생성
    }
  }

  var folders = DriveApp.getFoldersByName(config.DRIVE_FOLDER_NAME);
  var folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(config.DRIVE_FOLDER_NAME);
  }

  props.setProperty(config.DRIVE_FOLDER_PROP, folder.getId());
  return folder;
}

function getTodayDateString_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function formatDateCell_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  var text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.substring(0, 10);
  }
  return text;
}

function getTimestamp_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

// ─── 학생 조회 ─────────────────────────────────────────────

function findStudentById_(studentId) {
  var sheet = getSheet_(getConfig_().SHEET_STUDENTS);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var rowId = String(data[i][0]).trim();
    if (rowId === String(studentId).trim()) {
      return {
        id: rowId,
        name: String(data[i][1]).trim()
      };
    }
  }
  return null;
}

// ─── 공지사항 ─────────────────────────────────────────────

function getLatestNotice_() {
  var sheet = getSheet_(getConfig_().SHEET_NOTICE);
  var lastRow = sheet.getLastRow();
  if (lastRow < 1) return '등록된 공지사항이 없습니다.';

  var notices = sheet.getRange(1, 1, lastRow, 1).getValues();
  for (var i = notices.length - 1; i >= 0; i--) {
    var text = String(notices[i][0]).trim();
    if (text) return text;
  }
  return '등록된 공지사항이 없습니다.';
}

// ─── 출결 조회 ─────────────────────────────────────────────

function getAttendanceLogsForStudent_(studentId) {
  var sheet = getSheet_(getConfig_().SHEET_ATTENDANCE);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var data = sheet.getRange(2, 1, lastRow, 7).getValues();
  var logs = [];

  for (var i = 0; i < data.length; i++) {
    if (String(data[i][2]).trim() === String(studentId).trim()) {
      logs.push({
        timestamp: data[i][0],
        date: formatDateCell_(data[i][1]),
        studentId: String(data[i][2]).trim(),
        name: String(data[i][3]).trim(),
        status: String(data[i][4]).trim(),
        learningLog: String(data[i][5]).trim(),
        signature: String(data[i][6]).trim()
      });
    }
  }
  return logs;
}

function getTodayStatus_(studentId) {
  var today = getTodayDateString_();
  var logs = getAttendanceLogsForStudent_(studentId);
  var hasCheckIn = false;
  var hasCheckOut = false;

  for (var i = 0; i < logs.length; i++) {
    if (logs[i].date === today) {
      if (logs[i].status === '출석') hasCheckIn = true;
      if (logs[i].status === '퇴실') hasCheckOut = true;
    }
  }

  if (!hasCheckIn) return 'before_checkin';
  if (!hasCheckOut) return 'before_checkout';
  return 'completed';
}

function getMonthlyAttendanceDates_(studentId, year, month) {
  var logs = getAttendanceLogsForStudent_(studentId);
  var dates = [];
  var monthStr = year + '-' + ('0' + month).slice(-2);

  for (var i = 0; i < logs.length; i++) {
    if (logs[i].status === '출석' && logs[i].date.indexOf(monthStr) === 0) {
      if (dates.indexOf(logs[i].date) === -1) {
        dates.push(logs[i].date);
      }
    }
  }
  return dates;
}

// ─── 서명 저장 ─────────────────────────────────────────────

function saveSignatureToDrive_(base64Data, studentName, studentId) {
  var folder = ensureDriveFolder_();
  var dateStr = getTodayDateString_();
  var fileName = dateStr + '_' + studentName + '(' + studentId + ').png';

  var base64 = base64Data.replace(/^data:image\/png;base64,/, '');
  var blob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/png', fileName);
  var file = folder.createFile(blob);

  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  Utilities.sleep(getConfig_().IMAGE_LOAD_DELAY_MS);

  return file.getId();
}

function buildImageFormula_(fileId) {
  var directUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
  return '=IMAGE("' + directUrl + '", 1)';
}

function appendAttendanceLog_(student, status, learningLog, signatureFormula) {
  var sheet = getSheet_(getConfig_().SHEET_ATTENDANCE);
  sheet.appendRow([
    getTimestamp_(),
    getTodayDateString_(),
    student.id,
    student.name,
    status,
    learningLog || '',
    ''
  ]);

  if (signatureFormula) {
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 7).setFormula(signatureFormula);
  }
}

/**
 * 최초 1회 실행: 스프레드시트 시트·헤더 자동 생성
 * Apps Script 편집기에서 setupSheets 함수를 선택 후 ▶ 실행
 */
function setupSheets() {
  var config = getConfig_();
  var ss = getSpreadsheet_();

  var studentSheet = ss.getSheetByName(config.SHEET_STUDENTS);
  if (!studentSheet) {
    studentSheet = ss.insertSheet(config.SHEET_STUDENTS);
    studentSheet.getRange(1, 1, 1, 2).setValues([['학번', '이름']]);
    studentSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }

  var logSheet = ss.getSheetByName(config.SHEET_ATTENDANCE);
  if (!logSheet) {
    logSheet = ss.insertSheet(config.SHEET_ATTENDANCE);
    logSheet.getRange(1, 1, 1, 7).setValues([[
      '타임스탬프', '날짜', '학번', '이름', '상태', '배움기록', '서명'
    ]]);
    logSheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    logSheet.setColumnWidth(7, 120);
  }

  var noticeSheet = ss.getSheetByName(config.SHEET_NOTICE);
  if (!noticeSheet) {
    noticeSheet = ss.insertSheet(config.SHEET_NOTICE);
    noticeSheet.getRange(1, 1).setValue('여기에 공지사항을 입력하세요. (가장 아래 줄이 학생에게 표시됩니다)');
  }

  ensureDriveFolder_();
  SpreadsheetApp.getUi().alert('시트 초기 설정이 완료되었습니다!');
}

// ─── 클라이언트 API ────────────────────────────────────────

/**
 * 학생 로그인 및 메인 화면 데이터 조회
 */
function loginStudent(studentId) {
  try {
    ensureDriveFolder_();

    var student = findStudentById_(studentId);
    if (!student) {
      return { success: false, message: '학번을 다시 확인해주세요!' };
    }

    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;

    return {
      success: true,
      student: student,
      notice: getLatestNotice_(),
      todayStatus: getTodayStatus_(student.id),
      attendanceDates: getMonthlyAttendanceDates_(student.id, year, month),
      year: year,
      month: month
    };
  } catch (e) {
    return { success: false, message: '오류가 발생했습니다: ' + e.message };
  }
}

/**
 * 출석 처리
 */
function markCheckIn(studentId) {
  try {
    var student = findStudentById_(studentId);
    if (!student) {
      return { success: false, message: '학번을 다시 확인해주세요!' };
    }

    var status = getTodayStatus_(student.id);
    if (status !== 'before_checkin') {
      return { success: false, message: '이미 출석 처리되었습니다.' };
    }

    appendAttendanceLog_(student, '출석', '', '');

    var now = new Date();
    return {
      success: true,
      todayStatus: getTodayStatus_(student.id),
      attendanceDates: getMonthlyAttendanceDates_(student.id, now.getFullYear(), now.getMonth() + 1),
      message: '출석이 완료되었어요!'
    };
  } catch (e) {
    return { success: false, message: '출석 처리 중 오류: ' + e.message };
  }
}

/**
 * 퇴실 처리 (배움일지 + 서명)
 */
function submitCheckOut(studentId, learningLog, signatureBase64) {
  try {
    var student = findStudentById_(studentId);
    if (!student) {
      return { success: false, message: '학번을 다시 확인해주세요!' };
    }

    var status = getTodayStatus_(student.id);
    if (status === 'before_checkin') {
      return { success: false, message: '먼저 출석을 완료해 주세요.' };
    }
    if (status === 'completed') {
      return { success: false, message: '오늘 퇴실은 이미 완료되었습니다.' };
    }

    if (!learningLog || !String(learningLog).trim()) {
      return { success: false, message: '오늘의 배움 기록을 입력해 주세요.' };
    }
    if (!signatureBase64) {
      return { success: false, message: '서명을 작성해 주세요.' };
    }

    var fileId = saveSignatureToDrive_(signatureBase64, student.name, student.id);
    var imageFormula = buildImageFormula_(fileId);
    appendAttendanceLog_(student, '퇴실', String(learningLog).trim(), imageFormula);

    var now = new Date();
    return {
      success: true,
      todayStatus: getTodayStatus_(student.id),
      attendanceDates: getMonthlyAttendanceDates_(student.id, now.getFullYear(), now.getMonth() + 1),
      message: '퇴실 기록이 저장되었어요!'
    };
  } catch (e) {
    return { success: false, message: '저장 중 오류: ' + e.message };
  }
}

/**
 * 달력 월 변경 시 출석 날짜 조회
 */
function getCalendarData(studentId, year, month) {
  try {
    var student = findStudentById_(studentId);
    if (!student) {
      return { success: false, message: '학번을 다시 확인해주세요!' };
    }

    return {
      success: true,
      attendanceDates: getMonthlyAttendanceDates_(student.id, year, month),
      year: year,
      month: month
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
