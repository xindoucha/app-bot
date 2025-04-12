// 大众点评App自动化脚本

// 确保无障碍服务已启用
auto();

// 屏蔽词列表
const blockWords = ['古筝', '宠物', '篮球', '足球', '少儿', '自习', '课程', '刺青', '纹身', '月子', '产后'];
// 免费试下面的文案
const freeTrialText = "荔枝冰酿" // "吃喝玩乐";

// 检测屏蔽词
function containsBlockWord() {
    let found = false;
    const regex = new RegExp(blockWords.join('|'));
    textMatch(regex).find().forEach(word => {
        console.log('发现屏蔽词：' + word.text());
        found = true;
    });
    return found;
}

/**
 * 加载app和页面
 * @param {*} appName 
 */
function loadAppAndPage() {
    // 启动大众点评App
    launchApp("大众点评");

    // 等待App启动
    waitForPackage("com.dianping.v1", 10000);

    // 等待主界面加载
    sleep(3000);

    // 检查是否成功启动
    if (!currentPackage().includes("com.dianping")) {
        toast("启动大众点评失败");
        exit();
    }

    toast("大众点评已成功启动");

    // 等待页面完全加载
    sleep(2000);

    // 点击”免费试-吃喝玩乐“
    const res = findELeAndClick(freeTrialText);
    if (!res) {
        toast("进入页面失败");
        exit();
    }
    sleep(3000);
}

/***
 * 找到某个元素并点击它
 * return element
 */
function findELeAndClick(content) {
    let element = text(content).findOne(5000);
    if (element) {
        let bounds = element.bounds();
        click(bounds.centerX(), bounds.centerY());
    } else {
        console.log(`未找到元素${content}`);
    }
    return element
}

/**
 * 查找并返回”回到顶部”按钮
 * @returns {boolean} 是否成功点击
 */
function findAndClickBackToTop() {
    // 尝试通过描述查找
    let backToTopBtn = desc("回到顶部").findOne(2000);
    
    // 如果通过描述找不到，尝试通过ID查找
    if (!backToTopBtn) {
        backToTopBtn = id("back_to_top").findOne(2000);
    }
    
    // 如果通过ID找不到，尝试通过类名和位置特征查找
    if (!backToTopBtn) {
        // 通常回到顶部按钮在屏幕右下角
        let possibleBtns = className("android.widget.ImageView").find();
        for (let i = 0; i < possibleBtns.length; i++) {
            let btn = possibleBtns[i];
            let bounds = btn.bounds();
            // 检查按钮是否在屏幕右下角区域
            if (bounds.right > device.width * 0.7 && 
                bounds.bottom > device.height * 0.7 &&
                bounds.width() < 100 && bounds.height() < 100) {
                backToTopBtn = btn;
                break;
            }
        }
    }
    
    if (backToTopBtn) {
        return backToTopBtn;
    }
    
    return false;
}

// 主函数
function main() {
    // 加载app和页面
    loadAppAndPage();

    // 记录处理的免费抽按钮数量
    let processedCount = 0;

    let lastFreeLotteryBtnPosition = null; // 新增记录最后一个免费抽按钮位置的变量， 防止重复点击
    while (true) {
        // 滑动屏幕 如果滑动失败，继续滑动
        const res = swipe(
            device.width / 2,
            (device.height * 3) / 4,
            device.width / 2,
            device.height / 4,
            1000
        );
        if (!res) {
            console.log("滑动失败，继续滑动");
            continue;
        }

        // 一个等待滑动结束的逻辑
        sleep(3000);
        // 查找"免费抽"按钮
        let freeLotteryBtn = text("免费抽").find(5000);
        if (freeLotteryBtn.length === 0) {
            // 如果没有找到按钮，跳过循环
            continue;
        }

        // 处理每个免费抽按钮
        for (let i = 0; i < freeLotteryBtn.length; i++) {
            let btn = freeLotteryBtn[i];
            let bounds = btn.bounds();
            // 如果当前按钮位置与上一个按钮位置相同，跳过当前按钮
            if (lastFreeLotteryBtnPosition && lastFreeLotteryBtnPosition[0] === bounds.centerX() && lastFreeLotteryBtnPosition[1] === bounds.centerY()) {
                continue;
            }
            // 如果 y 坐标小于 200，跳过当前按钮
            if (bounds.centerY() < 200) {
                continue;
            }
            // 如果当前按钮的中心点落在顶部按钮的bounds中，跳过当前按钮
            let backToTopBtn = findAndClickBackToTop();
            if (backToTopBtn) {
                let backToTopBtnBounds = backToTopBtn.bounds();
                if (backToTopBtnBounds.contains(bounds.centerX(), bounds.centerY())) {
                    continue;
                }
            }
            lastFreeLotteryBtnPosition = [bounds.centerX(), bounds.centerY()];
            click(bounds.centerX(), bounds.centerY());
            // 等待新页面加载
            sleep(3000);

            // 先执行屏蔽词检测
            if (containsBlockWord()) {
                console.log('发现屏蔽词，跳过当前活动');
                back();
                continue;
            }

            // 查找并点击"我要报名"按钮
            if (findELeAndClick("我要报名")) {
                // 等待弹窗出现
                sleep(2000);
                // 查找并点击"确认报名"按钮
                let confirmBtn = findELeAndClick("确认报名");
                if (confirmBtn) {
                    console.log(`已报名免费抽活动数量：${processedCount++}` + "个");
                    sleep(2000);
                    // 返回上级页面
                    back();
                } else {
                    back();
                    continue;
                }
            } else {
                continue;
            }

            // 在继续查找下一个按钮前稍作延迟
            sleep(2000);
        }
    }
}

// 运行主函数
main();