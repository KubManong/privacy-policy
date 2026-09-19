# assets/fonts — 得意黑（Smiley Sans）自托管子集

- `smiley-sans.css` 是入口，页面通过它按 `unicode-range` 按需加载下方 woff2 分片。
- `L1_/L2_/L3_*.woff2` 共 80 个文件是字体子集化工具自动生成的分片，
  **文件名与 unicode-range 一一对应，不要手工编辑、重命名或单个删除**。
- 如需更换或扩充分字（例如新增文案用到未覆盖的汉字），重新跑子集化流程，
  整目录替换，并保持 `smiley-sans.css` 中的 font-family 名称为
  `Smiley Sans Oblique`（style.css 的 `--font-display` 依赖它）。
- 字体来源：Atelier Anchor 的得意黑（Smiley Sans），OFL 开源协议。
