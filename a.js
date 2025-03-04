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

  // 查找并点击"免费试"按钮
  let freeTrialBtn = text("免费试").findOne(5000);
  if (freeTrialBtn) {
    toast("找到免费试按钮");
    freeTrialBtn.click();
    toast("已点击免费试按钮");
    // 等待新页面加载
    sleep(3000);
  } else {
    toast("未找到免费试按钮");
    exit();
  }
}

// 运行主函数
main();
