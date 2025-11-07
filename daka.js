// 钉钉定时打卡脚本 v1.0.0

auto(); // 确保无障碍服务启用

const DINGTALK_APP_NAME = "钉钉";
const DINGTALK_PACKAGE = "com.alibaba.android.rimet";
const CHECK_IN_TIME = { hour: 9, minute: 0 };   // 上班打卡
const CHECK_OUT_TIME = { hour: 18, minute: 0 }; // 下班打卡
const CHECK_INTERVAL = 30 * 1000; // 每 30 秒检查一次时间，需脚本持续运行

let lastCheckInDate = null;  // 记录当天是否已经打过上班卡
let lastCheckOutDate = null; // 记录当天是否已经打过下班卡

function waitForAndClickByText(texts) {
    for (const t of texts) {
        const element = text(t).findOne(3000);
        if (element) {
            const b = element.bounds();
            click(b.centerX(), b.centerY());
            sleep(1500);
            return true;
        }
    }
    return false;
}

function waitForAndClickByDesc(descs) {
    for (const d of descs) {
        const element = desc(d).findOne(3000);
        if (element) {
            const b = element.bounds();
            click(b.centerX(), b.centerY());
            sleep(1500);
            return true;
        }
    }
    return false;
}

function launchDingTalk() {
    toastLog("正在启动钉钉…");
    launchApp(DINGTALK_APP_NAME);
    if (!waitForPackage(DINGTALK_PACKAGE, 10000)) {
        toastLog("启动钉钉失败"); 
        return false;
    }
    sleep(3000);
    return currentPackage() === DINGTALK_PACKAGE;
}

function enterAttendancePage() {
    // 进入“工作”或相关入口
    waitForAndClickByText(["工作", "消息"]);
    sleep(2000);

    // 打开考勤应用
    if (
        waitForAndClickByText(["考勤打卡", "打卡", "考勤签到"]) ||
        waitForAndClickByDesc(["考勤打卡", "打卡", "考勤签到"])
    ) {
        sleep(4000);
        return true;
    }
    toastLog("未找到打卡入口");
    return false;
}

function tapPunchButton(keywordList) {
    const success =
        waitForAndClickByText(keywordList) ||
        waitForAndClickByDesc(keywordList);
    if (success) {
        toastLog("已点击打卡按钮");
        sleep(5000); // 等待打卡完成
    } else {
        toastLog("未找到打卡按钮，可能已打卡");
    }
    return success;
}

function doPunch(isCheckIn) {
    if (!launchDingTalk()) return false;
    if (!enterAttendancePage()) return false;

    const keywords = isCheckIn
        ? ["上班打卡", "签到上班", "立即打卡", "打卡"]
        : ["下班打卡", "签到下班", "立即打卡", "打卡"];

    tapPunchButton(keywords);
    home(); // 返回桌面，避免停留在钉钉界面
    return true;
}

function alreadyPunched(dateToday, isCheckIn) {
    return isCheckIn
        ? lastCheckInDate === dateToday
        : lastCheckOutDate === dateToday;
}

function markPunched(dateToday, isCheckIn) {
    if (isCheckIn) {
        lastCheckInDate = dateToday;
    } else {
        lastCheckOutDate = dateToday;
    }
}

function shouldPunch(now, targetTime) {
    return now.getHours() === targetTime.hour && now.getMinutes() === targetTime.minute;
}

function mainLoop() {
    toastLog("钉钉定时打卡脚本已启动");
    while (true) {
        const now = new Date();
        const today = now.toDateString();

        if (shouldPunch(now, CHECK_IN_TIME) && !alreadyPunched(today, true)) {
            toastLog("开始上班打卡流程");
            if (doPunch(true)) markPunched(today, true);
        }

        if (shouldPunch(now, CHECK_OUT_TIME) && !alreadyPunched(today, false)) {
            toastLog("开始下班打卡流程");
            if (doPunch(false)) markPunched(today, false);
        }

        sleep(CHECK_INTERVAL);
    }
}

mainLoop();
