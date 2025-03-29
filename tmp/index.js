// 大众点评App自动化脚本

// 确保无障碍服务已启用
auto();

// 设置运行超时
// setTimeout(120000);

// 主函数
function main() {
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

  // 记录处理的免费抽按钮数量
  let processedCount = 0;

  // 循环查找并处理免费抽按钮
  let swipeCount = 0; // 新增滑动计数器
  while (true) {
     if (processedCount % 4 === 0) {
        // 滑动屏幕
      swipe(
       device.width / 2,
       (device.height * 3) / 4,
       device.width / 2,
       device.height / 4,
       500
      );
    }
    // 一个等待滑动结束的逻辑
    sleep(3000);
    // 查找"免费抽"按钮
    let freeLotteryBtn = text("免费抽").findOne(5000);
    if (!freeLotteryBtn) {
      // 新增滑动次数判断
      if (swipeCount >= 3) {
        // 连续滑动3次未找到则视为到底
        toast("已经滑动到底部，退出循环。" + "已处理" + processedCount + "个");
        break;
      }

      // 滑动屏幕
      swipe(
        device.width / 2,
        (device.height * 3) / 4,
        device.width / 2,
        device.height / 4,
        500
      );
      swipeCount++; // 增加滑动次数
      sleep(2000);
      continue;
    }
    // 重置滑动计数器（找到有效按钮时）
    swipeCount = 0;

    
    processedCount++;
    toast("找到第" + processedCount + "个免费抽按钮");
    let bounds = freeLotteryBtn.bounds();
    click(bounds.centerX(), bounds.centerY());

    // toast("已点击免费抽按钮");

    // 等待新页面加载
    sleep(3000);

    // 查找并点击"我要报名"按钮
    let signUpBtn = text("我要报名").findOne(5000);
    if (signUpBtn) {
      // toast("找到我要报名按钮");
      // signUpBtn.click();
      let bounds = signUpBtn.bounds();
      click(bounds.centerX(), bounds.centerY());
      // toast("已点击我要报名按钮");

      // 等待弹窗出现
      sleep(2000);

      // 查找并点击"确认报名"按钮
      let confirmBtn = text("确认报名").findOne(5000);
      if (confirmBtn) {
        // toast("找到确认报名按钮");
        let bounds = confirmBtn.bounds();
        click(bounds.centerX(), bounds.centerY());
        // confirmBtn.click();
        // toast("已点击确认报名按钮");

        // 等待确认报名操作完成
        sleep(2000);

        // 第一次返回上级页面
        back();
        // toast("返回上一级页面");
        // sleep(2000);

        // 第二次返回上级页面
        // back();
        // toast("已返回上一级页面");
        // sleep(2000);
      } else {
        // toast("未找到确认报名按钮，跳过当前免费抽");
        //back();
        // sleep(2000);
        continue;
      }
    } else {
      // toast("未找到我要报名按钮，跳过当前免费抽");
      //back();
      // sleep(2000);
      continue;
    }

    // 在继续查找下一个按钮前稍作延迟
    sleep(2000);
  }
}

// 运行主函数
main();