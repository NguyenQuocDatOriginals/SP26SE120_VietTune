import fs from 'node:fs';
import path from 'node:path';

/**
 * Mục tiêu:
 * - Không sửa nội dung các dòng code hiện hữu.
 * - File `.ts/.js`: thêm comment tiếng Việt theo từng dòng (chèn dòng `// [VI] ...` phía trên).
 * - File `.tsx/.jsx`: thêm JSDoc/comment theo khối ở các điểm chính (top-level exports/handlers).
 *
 * Lưu ý:
 * - Comment "từng dòng" trong JSX (TSX/JSX) không khả thi bằng `//` mà không phá cú pháp,
 *   nên `.tsx/.jsx` chỉ được chú thích theo khối/điểm chính để đảm bảo code vẫn chạy.
 */

const REPO_ROOT = process.cwd();
const SRC_DIR = path.join(REPO_ROOT, 'src');

const TEXT_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const SKIP_BASENAMES = new Set(['vite-env.d.ts']);

const VI_PREFIX = '// [VI] ';

function isBinaryLike(buf) {
  // Heuristic: if it contains NUL, treat as binary.
  return buf.includes(0);
}

function walk(dir) {
  /** @type {string[]} */
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === 'build') continue;
      out.push(...walk(full));
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name);
      if (!TEXT_EXTS.has(ext)) continue;
      if (SKIP_BASENAMES.has(ent.name)) continue;
      out.push(full);
    }
  }
  return out;
}

function describeTsLine(line) {
  const t = line.trim();
  if (!t) return '';
  if (t.startsWith('import ')) return 'Nhập (import) các phụ thuộc cho file.';
  if (t.startsWith('export default ')) return 'Xuất mặc định (export default) nội dung chính của module.';
  if (t.startsWith('export ')) return 'Xuất (export) thành phần/giá trị để module khác sử dụng.';
  if (t.startsWith('type ') || t.startsWith('export type ')) return 'Khai báo kiểu (type) để mô tả dữ liệu.';
  if (t.startsWith('interface ') || t.startsWith('export interface ')) return 'Khai báo interface để ràng buộc cấu trúc dữ liệu.';
  if (t.startsWith('enum ') || t.startsWith('export enum ')) return 'Khai báo enum cho tập giá trị hữu hạn.';
  if (t.startsWith('const ') || t.startsWith('let ') || t.startsWith('var ')) return 'Khai báo biến/hằng số.';
  if (t.startsWith('function ') || t.includes('=>')) return 'Khai báo hàm/biểu thức hàm.';
  if (t.startsWith('return ')) return 'Trả về kết quả từ hàm.';
  if (t.startsWith('if ') || t.startsWith('if(')) return 'Rẽ nhánh điều kiện (if).';
  if (t.startsWith('else if') || t.startsWith('else')) return 'Nhánh điều kiện bổ sung (else).';
  if (t.startsWith('for ') || t.startsWith('for(')) return 'Vòng lặp (for).';
  if (t.startsWith('while ') || t.startsWith('while(')) return 'Vòng lặp (while).';
  if (t.startsWith('try')) return 'Bắt đầu khối xử lý lỗi (try/catch).';
  if (t.startsWith('catch')) return 'Xử lý lỗi phát sinh (catch).';
  if (t.startsWith('switch')) return 'Rẽ nhánh theo nhiều trường hợp (switch).';
  if (t.startsWith('case ') || t.startsWith('default')) return 'Một nhánh trong switch (case/default).';
  if (t.startsWith('throw ')) return 'Ném lỗi (throw) để báo hiệu thất bại.';
  // Fallback: mô tả theo cách không phá "tiếng Việt" nhưng vẫn gợi ý.
  return 'Thực thi một bước trong luồng xử lý.';
}

function annotatePerLineTs(content) {
  const lines = content.split(/\r?\n/);
  /** @type {string[]} */
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Giữ nguyên nguyên văn line code; chỉ chèn comment trước nó.
    const desc = describeTsLine(line);
    if (desc) {
      // Tránh double-run: nếu ngay trước đã có comment [VI] thì bỏ qua.
      const prev = out.length ? out[out.length - 1] : '';
      if (!prev.startsWith(VI_PREFIX)) {
        out.push(`${VI_PREFIX}${desc}`);
      }
    }
    out.push(line);
  }
  return out.join('\n');
}

function addJsdocIfMissing(beforeLine, jsdoc) {
  // beforeLine là một đoạn string trước declaration; nếu đã có /** ... */ ngay trước thì không thêm.
  const trimmed = beforeLine.trimEnd();
  if (trimmed.endsWith('*/')) return beforeLine;
  return `${beforeLine}${jsdoc}\n`;
}

function annotateTsxBlockLevel(content) {
  let out = content;

  // 1) File header JSDoc nếu file chưa có ở đầu.
  if (!out.trimStart().startsWith('/**')) {
    out =
      '/**\n' +
      ' * Tài liệu hoá tiếng Việt cho file TSX.\n' +
      ' * Ghi chú: TSX/JSX không thể chú thích "từng dòng" bằng `//` trong phần JSX mà không phá cú pháp,\n' +
      ' * nên file này được chú thích theo khối/chức năng chính (component/handler/luồng dữ liệu).\n' +
      ' */\n' +
      out;
  }

  // 2) JSDoc cho `export default function Name(...)` nếu thiếu.
  out = out.replace(
    /(^\s*)(export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\()/gm,
    (m, indent, head, name) => {
      const jsdoc =
        `${indent}/**\n` +
        `${indent} * Component trang (page).\n` +
        `${indent} * - Trách nhiệm: hiển thị UI và điều phối các thao tác chính của trang.\n` +
        `${indent} */\n`;
      // Chỉ thêm nếu ngay trước chưa có JSDoc.
      const beforeIdx = out.indexOf(m);
      const before = out.slice(0, beforeIdx);
      const after = out.slice(beforeIdx);
      const before2 = addJsdocIfMissing(before, jsdoc);
      return before2.slice(before.length) + after.slice(0, m.length);
    },
  );

  // 3) JSDoc cho các handler dạng `const handleX = async () => { ... }`
  out = out.replace(
    /(^\s*)(const\s+(handle[A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(.*?\)\s*=>\s*\{)/gm,
    (m, indent, _constKw, name, head) => {
      const jsdoc =
        `${indent}/**\n` +
        `${indent} * Handler UI.\n` +
        `${indent} * - Mục tiêu: xử lý tương tác người dùng và cập nhật trạng thái liên quan.\n` +
        `${indent} */\n`;

      const idx = out.indexOf(m);
      const before = out.slice(0, idx);
      const after = out.slice(idx);
      const before2 = addJsdocIfMissing(before, jsdoc);
      return before2.slice(before.length) + after.slice(0, m.length);
    },
  );

  return out;
}

function processFile(filePath) {
  const buf = fs.readFileSync(filePath);
  if (isBinaryLike(buf)) return { changed: false };
  const original = buf.toString('utf8');

  const ext = path.extname(filePath);
  let updated = original;

  if (ext === '.ts' || ext === '.js') {
    updated = annotatePerLineTs(original);
  } else if (ext === '.tsx' || ext === '.jsx') {
    updated = annotateTsxBlockLevel(original);
  }

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    return { changed: true };
  }
  return { changed: false };
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Không tìm thấy thư mục src tại: ${SRC_DIR}`);
    process.exit(1);
  }

  const files = walk(SRC_DIR);
  let changedCount = 0;
  for (const f of files) {
    const { changed } = processFile(f);
    if (changed) changedCount++;
  }

  // eslint-disable-next-line no-console
  console.log(`Hoàn tất. Đã cập nhật ${changedCount}/${files.length} file trong src.`);
}

main();

