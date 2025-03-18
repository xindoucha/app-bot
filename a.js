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

  // 尝试通过多种方式查找免费试按钮
  let freeTrialBtn = null;
  
  // 尝试通过描述查找
  freeTrialBtn = desc("免费试").findOne(2000);
  
  if (!freeTrialBtn) {
    // 尝试通过id查找
    freeTrialBtn = id("free_trial_btn").findOne(2000);
  }
  
  if (!freeTrialBtn) {
    // 尝试通过图片查找
    if (images.requestScreenCapture()) {
      sleep(1000);
      let screen = images.captureScreen();
      let point = images.findImage(screen, images.read("/sdcard/autojs/free_trial.png"));
      if (point) {
        click(point.x + 10, point.y + 10);
        toast("已点击免费试按钮");
        sleep(3000);
        return;
      }
    }
  }

  if (freeTrialBtn) {
    toast("找到免费试按钮");
    freeTrialBtn.click();
    toast("已点击免费试按钮");
    sleep(3000);
  } else {
    toast("未找到免费试按钮");
    exit();
  }
}

// 运行主函数
main();
