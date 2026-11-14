import type { Task, Test } from './course';

export type CheckResult = { name: string; passed: boolean; actual: unknown; expected: unknown; error?: string; logs: string[] };

const previewStyle = 'body{margin:0;padding:22px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#101723;color:#eff6ff} .shop{max-width:570px;margin:auto;background:#182231;padding:26px;border:1px solid #344257;border-radius:16px;box-shadow:0 16px 35px #0003}h2{margin:10px 0 22px;font-size:27px}.eyebrow{letter-spacing:3px;font-size:11px;color:#9bd77c}.products{display:grid;gap:10px;list-style:none;padding:0}.product{padding:12px 14px;border-radius:10px;background:#202f41;border:1px solid #34465d}.product--available{border-color:#85d374}.product--special{background:#34402e;border-color:#aff46e}.is-hidden{display:none}button{border:0;border-radius:9px;background:#b0f578;color:#17210c;padding:10px 14px;cursor:pointer;font-weight:700}button:hover{filter:brightness(1.1)}strong{color:#bbff91}';
const escapeForScript = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

function documentShell(task: Task, script: string): string {
  return '<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>' + previewStyle + '</style></head><body>' +
    (task.html || '<div id="output"></div>') + '<script>' + script + '<' + '/script></body></html>';
}
export function previewHtml(task: Task, code: string): string {
  const data = escapeForScript(code);
  return documentShell(task, [
    'const code = ' + data + ';',
    'try { new Function("console", code)(console); }',
    'catch(error) { const pre = document.createElement("pre"); pre.style.cssText = "white-space:pre-wrap;color:#fb9aa0"; pre.textContent = "Ошибка: " + error.message; document.body.append(pre); }'
  ].join('\n'));
}

function testHtml(task: Task, code: string, test: Test, token: string): string {
  const data = escapeForScript({ code, test, token, mode: task.mode });
  return documentShell(task, [
    'const data = ' + data + ';',
    'const logs = [];',
    'const consoleProxy = {log: (...values) => logs.push(values.map(v => typeof v === "string" ? v : JSON.stringify(v)).join(" ")), error: (...values) => logs.push(values.join(" ")), warn: (...values) => logs.push(values.join(" "))};',
    'try {',
    '  const statement = data.code + (data.test.expression ? "\\nreturn (" + data.test.expression + ");" : "");',
    '  const actual = new Function("console", statement)(consoleProxy);',
    '  parent.postMessage({__topCheck:true,token:data.token,actual:data.mode === "console" ? logs : actual, logs}, "*");',
    '} catch(err) { parent.postMessage({__topCheck:true,token:data.token, error:String(err && err.message || err), logs}, "*"); }'
  ].join('\n'));
}
export function runOne(task: Task, code: string, test: Test): Promise<CheckResult> {
  return new Promise(resolve => {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;left:-9999px;top:0;width:700px;height:500px;border:0;pointer-events:none';
    const token = crypto.randomUUID();
    let done = false;
    const finish = (actual: unknown, error?: string, logs: string[] = []) => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
      frame.remove();
      resolve({ name:test.name, passed: !error && JSON.stringify(actual) === JSON.stringify(test.expected), actual, expected:test.expected, error, logs });
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow || event.data?.__topCheck !== true || event.data?.token !== token) return;
      finish(event.data.actual, event.data.error, event.data.logs ?? []);
    };
    const timeout = window.setTimeout(() => finish(undefined, 'Превышено время ожидания (3 с). Проверь цикл и код.'), 3000);
    window.addEventListener('message', onMessage);
    frame.srcdoc = testHtml(task, code, test, token);
    document.body.append(frame);
  });
}
export async function checkTask(task: Task, code: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  for (const test of task.tests) results.push(await runOne(task, code, test));
  return results;
}
