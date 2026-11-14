import type { Task, Test } from './course';
import { parse } from 'acorn';
import type { Node } from 'acorn';
import { simple } from 'acorn-walk';

export type ExecutionResult = { actual: unknown; error?: string; logs: string[] };
export type CheckResult = ExecutionResult & { name: string; passed: boolean; expected: unknown };

const previewStyle = [
  'body{margin:0;padding:22px;font-family:system-ui,sans-serif;background:#101723;color:#eff6ff;overflow-wrap:anywhere}',
  '.products{display:grid;gap:10px;list-style:none;padding:0;margin:0}.product{padding:12px 14px;border-radius:10px;background:#202f41;border:1px solid #34465d}',
  '.product__title,.product__price{margin:5px 0}.product__title{font-size:16px}.product--available{border-color:#85d374}.product--unavailable{opacity:.6}.product--special{background:#34402e;border-color:#aff46e}',
  '.modal{display:none;padding:16px;margin-top:16px;background:#202f41;border-radius:10px}.modal--show{display:block}',
  'a{color:#b0f578}.button-open,button{display:inline-block;border:0;border-radius:9px;background:#b0f578;color:#17210c;padding:10px 14px;cursor:pointer;font-weight:700}',
  'pre{white-space:pre-wrap}',
].join('');
const escapeForScript = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
const timeoutMessage = 'Превышено время выполнения. Проверь условие выхода из цикла.';
const consoleFormatting = 'function format(value) { if (value instanceof Element) return value.outerHTML; if (value instanceof NodeList || value instanceof HTMLCollection) return "[" + Array.from(value, format).join(", ") + "]"; try { return typeof value === "string" ? value : JSON.stringify(value) ?? String(value); } catch { return String(value); } }';

function instrumentLoops(code: string): string {
  const edits: { at: number; text: string }[] = [];
  function guardLoop({ body }: { body: Node }) {
    if (body.type === 'BlockStatement') {
      edits.push({ at: body.start + 1, text: 'globalThis.__topCheckLoop();' });
    } else {
      edits.push({ at: body.start, text: '{globalThis.__topCheckLoop();' });
      edits.push({ at: body.end, text: '\n}' });
    }
  }
  try {
    const program = parse(code, { ecmaVersion: 'latest', allowReturnOutsideFunction: true });
    simple(program, {
      ForStatement: guardLoop,
      ForInStatement: guardLoop,
      ForOfStatement: guardLoop,
      WhileStatement: guardLoop,
      DoWhileStatement: guardLoop,
    });
  } catch (error) {
    // Let the browser report syntax errors from the code as written.
    if (error instanceof SyntaxError) return code;
    throw error;
  }
  for (const { at, text } of edits.sort((a, b) => b.at - a.at)) {
    code = code.slice(0, at) + text + code.slice(at);
  }
  return code;
}

// Event callbacks get a fresh budget for each browser task, including preview clicks.
const loopGuard = [
  'const loopNow = performance.now.bind(performance);',
  'let loopStart;',
  'Object.defineProperty(globalThis, "__topCheckLoop", { value: () => {',
  '  if (loopStart === undefined) {',
  '    loopStart = loopNow();',
  '    setTimeout(() => { loopStart = undefined; }, 0);',
  '  }',
  '  if (loopNow() - loopStart > 1000) throw new Error(' + escapeForScript(timeoutMessage) + ');',
  '} });',
].join('\n');

function documentShell(task: Task, script: string): string {
  return '<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>' + previewStyle + '</style></head><body>' +
    (task.html || '<div id="output"></div>') + '<script>' + script + '<' + '/script></body></html>';
}
export function previewHtml(task: Task, code?: string): string {
  if (code === undefined) return documentShell(task, '');
  return documentShell(task, [loopGuard, consoleFormatting,
    'const code = ' + escapeForScript(instrumentLoops(code)) + ';',
    'let logView;',
    'function print(...values) {',
    '  if (!logView) {',
    '    const panel = document.createElement("details");',
    '    const summary = document.createElement("summary"); summary.textContent = "Консоль JavaScript";',
    '    logView = document.createElement("pre");',
    '    panel.append(summary, logView); document.body.append(panel);',
    '  }',
    '  logView.append(values.map(format).join(" ") + "\\n");',
    '}',
    'function showError(error) { const pre = document.createElement("pre"); pre.style.cssText = "white-space:pre-wrap;color:#fb9aa0"; pre.textContent = "Ошибка: " + error; document.body.append(pre); }',
    'addEventListener("error", event => { showError(event.message); event.preventDefault(); });',
    'try { new Function("console", code)({log:print, error:print, warn:print, info:print, debug:print}); }',
    'catch(error) { showError(error?.message ?? String(error)); }'
  ].join('\n'));
}

function executionHtml(task: Task, code: string, token: string, test?: Test): string {
  const data = escapeForScript({ code, expression: test?.expression, token, captureOutput: test?.output });
  return documentShell(task, [loopGuard, consoleFormatting,
    'const data = ' + data + ';',
    'const logs = [];',
    'const output = [];',
    'const print = (...values) => logs.push(values.map(format).join(" "));',
    'const consoleProxy = { log: (...values) => { if (data.captureOutput) output.push(values.length === 1 ? values[0] : values); print(...values); }, error: print, warn: print, info: print, debug: print };',
    'let eventError;',
    'addEventListener("error", event => { eventError = event.message; event.preventDefault(); });',
    'try {',
    '  const statement = data.code + (data.expression ? "\\nreturn (" + data.expression + ");" : "");',
    '  const value = new Function("console", statement)(consoleProxy);',
    '  const actual = data.captureOutput ? output : data.expression ? value : undefined;',
    '  parent.postMessage({__topCheck:true, token:data.token, actual, error:eventError, logs}, "*");',
    '} catch(err) { parent.postMessage({__topCheck:true, token:data.token, error:String(err?.message ?? err) || "Ошибка JavaScript", logs}, "*"); }'
  ].join('\n'));
}
function executeInFrame(task: Task, code: string, test?: Test): Promise<ExecutionResult> {
  const token = crypto.randomUUID();
  const html = executionHtml(task, code, token, test);
  return new Promise(resolve => {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;left:-9999px;top:0;width:700px;height:500px;border:0;pointer-events:none';
    let done = false;
    const finish = (actual: unknown, error?: string, logs: string[] = []) => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
      frame.remove();
      resolve({ actual, error, logs });
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow || event.data?.__topCheck !== true || event.data?.token !== token) return;
      finish(event.data.actual, event.data.error, event.data.logs ?? []);
    };
    const timeout = window.setTimeout(() => finish(undefined, timeoutMessage), 3000);
    window.addEventListener('message', onMessage);
    frame.srcdoc = html;
    document.body.append(frame);
  });
}

export function runCode(task: Task, code: string): Promise<ExecutionResult> {
  return executeInFrame(task, instrumentLoops(code));
}

function matches(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && actual.length === expected.length &&
      expected.every((value, index) => matches(actual[index], value));
  }
  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object' || Array.isArray(actual)) return false;
    const entries = Object.entries(expected);
    return Object.keys(actual).length === entries.length &&
      entries.every(([key, value]) => Object.hasOwn(actual, key) && matches((actual as Record<string, unknown>)[key], value));
  }
  return actual === expected;
}

export function formatValue(value: unknown): string {
  try { return JSON.stringify(value) ?? String(value); }
  catch { return String(value); }
}

export async function checkTask(task: Task, code: string): Promise<CheckResult[]> {
  const instrumented = instrumentLoops(code);
  const results: CheckResult[] = [];
  for (const test of task.tests) {
    const { name, expected } = test;
    const result = await executeInFrame(task, instrumented, test);
    results.push({ ...result, name, expected, passed: !result.error && matches(result.actual, expected) });
    if (result.error === timeoutMessage) break;
  }
  return results;
}
