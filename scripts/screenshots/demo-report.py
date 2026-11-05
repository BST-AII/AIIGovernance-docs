"""用合成图生成一份演示报告，给 capture-report.mjs 出图。名字、备注、图片都是假的。

调用真实的报告代码，所以样式和发出去的报告一致：
    PYTHONPATH=<records>/src;<records>/packages/aiigovernance-protocol/src python demo-report.py <输出目录>
"""
import hashlib
import math
import sys
import tempfile
import uuid
from pathlib import Path

from aiig_viewer.bundle import parse_bundle
from aiig_viewer.cache import target_dir
from aiig_viewer.imaging import encode_png_rgb8
from aiig_viewer.report import ReportProgress, write_report

WIDTH, HEIGHT = 640, 480
# 测试输入是一半大小（超分的输入），报告里会按比例放大到和结果对齐，标题写「放大 ×2 显示」。
COLUMNS = [("input", "测试输入", 0.45, 22, 2), ("a", "测试 A", 0.8, 4, 1), ("b", "测试 B", 1.0, 12, 1)]
KEYS = [("night_0001", "夜景"), ("night_0002", "夜景"), ("day_0001", "白天")]


def picture(seed: int, detail: float, noise: int, shrink: int = 1) -> bytes:
    width, height = WIDTH // shrink, HEIGHT // shrink
    pixels = bytearray()
    for y in range(height):
        for x in range(width):
            # 按缩小前的坐标算，缩小后的图和大图是同一个画面。
            fx, fy = x * shrink, y * shrink
            wave = math.sin((fx + seed * 40) / 9) * math.cos((fy - seed * 25) / 11) * 70 * detail
            grain = ((fx * 7919 + fy * 104729 + seed * 31) % 97 / 97 - 0.5) * noise * 2
            base = 70 + 90 * fx / WIDTH + wave + grain
            pixels += bytes((min(255, max(0, int(base + 20))),
                             min(255, max(0, int(base + 60 * fy / HEIGHT))),
                             min(255, max(0, int(base + 45)))))
    return encode_png_rgb8(width, height, bytes(pixels))


def main(out: Path) -> None:
    comparison = str(uuid.uuid4())
    with tempfile.TemporaryDirectory() as state:
        state_dir = Path(state)
        cache = target_dir(state_dir, "comparison", comparison)
        cache.mkdir(parents=True)
        samples = []
        for index, (key, category) in enumerate(KEYS):
            files = []
            for panel, _caption, detail, noise, shrink in COLUMNS:
                body = picture(index + 1, detail, noise, shrink)
                asset = str(uuid.uuid4())
                (cache / f"{asset}.png").write_bytes(body)
                files.append({"panel": panel, "asset_id": asset, "nas_host": "demo", "nas_share": "demo",
                              "share_path": f"{panel}/{key}.png", "size": len(body),
                              "sha256": hashlib.sha256(body).hexdigest(), "width": WIDTH // shrink,
                              "height": HEIGHT // shrink, "ext": "png"})
            samples.append({"sample_key": key, "category": category, "files": files})
        raw = {"title": "示例：两次测试的结果对比",
               "panels": [{"key": key, "caption": caption} for key, caption, _d, _n, _s in COLUMNS],
               "samples": samples, "estimate": {}, "not_viewable": [], "truncated": False}
        summary = {
            "lineage": {
                "nodes": [
                    {"id": "raw", "type": "raw", "label": "夜景原始数据", "status": "frozen"},
                    {"id": "v1", "type": "variant", "label": "训练集 v1", "status": "frozen"},
                    {"id": "run", "type": "training", "label": "训练 0301", "status": "finished"},
                    {"id": "model", "type": "model", "label": "模型 0301", "status": "hashed"},
                    {"id": "set", "type": "test_set", "label": "测试集", "status": "frozen"},
                    {"id": "a", "type": "test", "label": "测试 A", "status": "finished"},
                    {"id": "b", "type": "test", "label": "测试 B", "status": "finished"}],
                "edges": [{"from": "raw", "to": "v1", "label": "derived"},
                          {"from": "v1", "to": "run", "label": "train"},
                          {"from": "run", "to": "model", "label": "produced"},
                          {"from": "model", "to": "a", "label": "tested_by"},
                          {"from": "model", "to": "b", "label": "tested_by"},
                          {"from": "set", "to": "a", "label": "tested_by"},
                          {"from": "set", "to": "b", "label": "tested_by"},
                          {"from": "raw", "to": "set", "label": "derived"}]},
            "members": [
                {"position": position, "name": name, "status": "finished", "result_file_count": 3,
                 "metrics": {"psnr": psnr}, "script_commit": commit,
                 "model": {"name": "模型 0301", "framework": "pytorch", "size_bytes": 182000000},
                 "training": {"name": "训练 0301", "code_commit": "9f3c2a1"},
                 "inputs": [{"version_alias": "训练集 v1"}], "test_set": {"version_alias": "测试集"}}
                for position, name, psnr, commit in ((0, "测试 A", "31.2", "4e1d07b"),
                                                     (1, "测试 B", "30.6", "b82ac55"))],
            "alignment": {"matched": 3, "total": 3, "identical": 0, "flags": [],
                          "category_counts": {"夜景": 2, "白天": 1},
                          "members": [{"position": position, "missing": 0, "extra": 0, "multi": 0,
                                       "size_mismatch": 0} for position in (0, 1)]}}
        notes = [
            {"author_login": "demo-user", "body": "A 的暗部噪声少一些，B 的细节多一点。", "tag": "improved",
             "sample_key": "night_0001", "created_at": "2026-11-02T03:20:00Z",
             # 带查看区域（ROI）的备注：报告里点「跳到这个区域」会框出这块。
             "view": {"rx": "0.6", "ry": "0.5", "zoom": "1.5", "roi_x": "0.5", "roi_y": "0.4",
                      "roi_w": "0.2", "roi_h": "0.2"}},
            {"author_login": "demo-user", "body": "夜景这批 A 更好，白天两边差不多。", "tag": "marked",
             "sample_key": None, "created_at": "2026-11-02T03:40:00Z"}]
        progress = ReportProgress(9, 0)
        write_report(parse_bundle("comparison", comparison, raw), state_dir, out, summary=summary,
                     notes=notes, notes_truncated=False, sampling={"mode": "all"}, version="0.4.22",
                     progress=progress)
        if progress.state != "ready":
            raise SystemExit(progress.error)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
