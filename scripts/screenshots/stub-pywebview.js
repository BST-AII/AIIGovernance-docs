/* 安装器界面截图用的假桥。
 *
 * 安装器界面本身是一个纯静态 HTML，全部业务数据来自 pywebview 注入的
 * window.pywebview.api。这里提供一个同形状的假实现，好处是：
 *   - 不需要真跑安装器就能逐页出图；
 *   - 页面上的动态数据位有内容，不会截出一堆"未知/加载中"。
 *
 * 边界：这些数字是排版用的示意数据，不是任何一次真实安装的记录。
 * 因此本脚本产出的图只能作为界面示意，不能标称"真跑证据"。
 * 真实进度、真实日志与 done_success 的真实验证清单必须真装一次才有。
 */

(function () {
  var shot = {
    // 当前想展示的向导状态；截图脚本改这个值再调 refreshState()。
    state: "welcome",
    version: "0.3.53",
  };
  window.__aiigShot = shot;

  var ok = function (value) { return Promise.resolve(value); };

  // 每个状态页要用到的 st.data 分支，集中放在这里。
  var dataByState = {
    upgrade_check: {
      upgrade_check: {
        installed_version: "0.3.49", bundled_version: "0.3.53", status: "upgradable",
      },
    },
    legacy_bridge_confirm: {
      legacy_bridge: {
        module_dir: "…\\site-packages\\aiigovernance_bridge",
        source: "importlib.util.find_spec",
      },
    },
    bot_binding_conflict: {
      bot_binding_conflict: {
        app_id_masked: "cli_a1b2****",
        projects: [{ name: "demo-service", work_dir: "…/workspace/demo-service" }],
      },
    },
    daemon_registering: {
      daemon_existing: {
        command: "…\\.cc-connect\\cc-connect\\bin\\cc-connect.exe",
        arguments: "daemon run",
      },
    },
    daemon_fallback_offer: {
      daemon_register_error: "schtasks /Create 返回：拒绝访问。",
    },
    credentials_input: { credential_error: "" },
    codex_offer: { codex_error: "" },
  };

  window.pywebview = {
    api: {
      get_state: function () {
        return ok({
          state: shot.state,
          version: shot.version,
          data: dataByState[shot.state] || {},
          last_error: shot.state === "done_failure"
            ? "verification failed: hooks 未在真实会话中产生锚点" : null,
          last_diagnostic: shot.state === "done_failure"
            ? {
                cause: "Claude Code 未加载项目级 settings.local.json",
                next_step: "确认 Claude Code 版本与启动目录后重跑验证",
                raw_excerpt: "",
              }
            : null,
        });
      },

      probe_environment: function () {
        return ok({
          result: {
            platform: { gui_backend: "WebView2" },
            webview2: { installed: true },
            python: { ok: true },
            git: { ok: true, version: "2.45.2" },
            claude: { installed: true },
          },
        });
      },

      detect_resume_options: function () {
        return ok({
          classified: "已安装且接线完整",
          state: { submodules: { present: ["AIIGovernance", "Wildskills"] }, hooks_wired: true },
        });
      },

      get_permission_groups: function () {
        return ok({
          groups: [
            { key: "read_project", label: "读取项目文件（必需）", default: true },
            { key: "write_project", label: "写入项目文件（必需）", default: true },
            { key: "run_tests", label: "运行测试与检查命令", default: true },
            { key: "git_local", label: "本地 Git 操作（不含推送）", default: true },
            { key: "network_fetch", label: "访问网络获取资料", default: false },
            { key: "git_push", label: "推送到远端仓库", default: false },
          ],
        });
      },

      get_trust_ask_text: function () {
        return ok({
          text: "接下来会把本项目标记为受信任项目，使治理 Hooks 能在会话中真正执行。"
            + "\n只影响当前项目，可随时在 Claude Code 中撤销。",
        });
      },

      get_profile_review: function () {
        return ok({
          ephemeral_roots: ["tmp/", "outputs/"],
          allowed_roots: ["src/", "tests/", "docs/"],
          harness_roots: [".claude/"],
          tmp_root: "tmp/",
          skills_root: ".claude/skills",
          test_cmd: "pytest",
        });
      },

      get_codex_offer: function () {
        return ok({
          binaries: [
            { version: "codex-cli 0.147.0", path: "", ok: true,
              hooks_feature: "hooks", hooks_enabled: "true" },
            { version: "codex-cli 0.117.0", path: "", ok: true,
              hooks_feature: "codex_hooks", hooks_enabled: "false" },
          ],
          degraded: false,
          reason: "",
          service_tier: null,
        });
      },

      register_daemon: function () { return ok({ ok: true }); },

      get_completion_report: function () {
        return ok({
          operation: "install",
          version: shot.version,
          previous_version: "0.3.49",
          mounted: { lite: "0.3.53", wildskills: "0.4.2" },
          skills: { wired: ["security-review", "code-review", "bst-code-review"] },
          ready: true,
          upgrade_notes: [
            "重装一律全量重铺，升级只装版本号提升的组件",
            "升级会重新接线本机全部已挂载项目",
          ],
          unverified_items: [
            "飞书机器人未安装，未验证消息收发",
            "cc-connect 自启注册在本平台尚未经真机验证",
          ],
          next_steps: [
            "重新打开 Claude 会话并进入项目，确认首条回复出现「治理已加载」",
            "在会话中提一个需要检索的问题，确认知识检索工具可用",
          ],
          uninstall: {
            submodules: ["AIIGovernance", "Wildskills"],
            skills: ["security-review", "code-review"],
            preserved: ["records/", "project_profile.yaml", "用户权限配置"],
          },
          failure_reason: "",
        });
      },

      get_install_log: function (cursor) {
        var lines = [
          { stream: "stdout", text: "[mount] 校验内置 Git bundle SHA256 … ok" },
          { stream: "stdout", text: "[mount] 挂载 .governance/AIIGovernance … ok" },
          { stream: "stdout", text: "[mount] 挂载 .governance/Wildskills … ok" },
          { stream: "stdout", text: "[wire] 渲染 CLAUDE.md 治理块 … ok" },
          { stream: "stdout", text: "[wire] 写入 .claude/settings.local.json … ok" },
          { stream: "stdout", text: "[wire] 注册 .mcp.json: aiigovernance-records … ok" },
          { stream: "stdout", text: "[verify] bootstrap --check … ok" },
          { stream: "stdout", text: "[verify] check.py --lint … ok" },
        ];
        if (cursor >= lines.length) return ok({ lines: [], next: cursor, dropped: 0 });
        return ok({ lines: lines.slice(cursor), next: lines.length, dropped: 0 });
      },

      get_payload_status: function () { return ok({ state: "ready", percent: 100 }); },

      prepare_bug_report: function () {
        return ok({
          automatic: true,
          preview: [
            "installer_version: 0.3.53",
            "platform: Windows 11 (x64)",
            "state: done_failure",
            "hook_doctor: settings 存在 / 隔离执行成功 / 真实会话无锚点",
            "log_tail: 200 行（已脱敏）",
          ].join("\n"),
        });
      },

      report_page_marker: function () { return ok(true); },
      start_payload_preparation: function () { return ok(true); },
      open_usage_guide: function () { return ok(true); },
    },
  };

  // 这些是"点了就往前走"的动作，截图时不需要真的推进状态机。
  [
    "begin_flow", "start_mounting", "start_wiring", "start_verification",
    "start_uninstall", "start_legacy_bridge_removal", "start_cc_assembly",
    "start_codex_wiring", "prepare_e2e", "submit_credentials", "apply_permissions",
    "choose_target_dir_via_dialog", "submit_bug_report",
  ].forEach(function (name) {
    window.pywebview.api[name] = function () { return ok({ ok: true }); };
  });
})();
