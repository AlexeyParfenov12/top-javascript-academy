
import materialCatalog from './materials.json';
import labFixtures from './lab-fixtures.json';

export type Test = { name: string; expression?: string; expected: unknown; output?: boolean };
export type Mode = 'console' | 'function' | 'dom';
export type Task = { id: string; title: string; goal: string; mode: Mode; starter: string; hints: string[]; tests: Test[]; html: string };
export type Material = { id: string; title: string; section: string; number: number; project?: boolean };
export type Lesson = { day: number; number: number; title: string; concepts: string[]; materials: Material[]; core: string[]; tasks: Task[] };

const X = (name: string, expression: string, expected: unknown): Test => ({ name, expression, expected });
const output = (...expected: unknown[]): Test => ({ name: 'Вывод в консоль', expected, output: true });
const exercises = (id: string, goal: string, starter: string, hints: string[], tests: Test[]): Task => ({
  id, goal, starter, hints, tests, title: '', mode: 'console', html: '',
});
function lab(id: keyof typeof labFixtures, goal: string, hints: string[], tests: Test[]): Task {
  return { id, title: '', goal, hints, tests, mode: 'dom', ...labFixtures[id] };
}
function schedule(number: keyof typeof materialCatalog.lessons, title: string, concepts: string[], core: string[], tasks: Task[]): Lesson {
  const materials: Material[] = materialCatalog.lessons[number];
  return {
    day: Math.ceil(Number(number) / 3), number: Number(number), title, concepts, materials, core,
    tasks: tasks.map(task => ({ ...task, title: materials.find(material => material.id === task.id)!.title })),
  };
}
const projectMessage = 'Проект можно выполнить';
const pages = "let mode = 'pageCopy';\nlet pageNumber = 5;\nlet copyCount = 7;\nlet totalPages = 6;\nif (mode === 'pageCopy') {\n  for (let copies = 1; copies <= copyCount; copies++) console.log(pageNumber);\n}\n";
const visitData = 'let usersByDay = [812, 1360, 657, 1247];';
const productCards = 'Array.from(document.querySelectorAll(".products > .product"))';
const clickOpen = 'document.querySelector(".button-open").click();';
const isOpen = 'document.querySelector(".modal").classList.contains("modal--show")';

export const lessons = [
  schedule('1', 'Консоль, типы и переменные', ['console.log()', 'комментарии', 'типы данных', 'let'], ['1-1', '1-2', '1-3'], [
    exercises('1-1', 'Подпиши вывод программы и выведи по порядку время в часах и минутах.', '// Считаем время\n3 + 2.5;\n(3 + 2.5) * 60;\n', [
      'Перед каждым результатом выведи подпись из условия.', 'Для минут умножь сумму часов на 60.',
    ], [output('Время в часах:', 5.5, 'Время в минутах:', 330)]),
    exercises('1-2', "Выведи массив [50, 320, 480] и объект {media: 'Twitter', time: 5} отдельными вызовами console.log.", '', [
      'Массив записывается в квадратных скобках.', 'Передай в консоль сам объект в фигурных скобках.',
    ], [output([50, 320, 480], {media: 'Twitter', time: 5})]),
    exercises('1-3', 'Объяви переменную timeInHours без начального значения и выведи её в консоль.', '', [
      'Используй let, чтобы объявить переменную без значения.', 'В console.log передай имя переменной.',
    ], [output(undefined), X('Переменная объявлена', 'timeInHours === undefined', true)]),
  ]),
  schedule('2', 'Операции, строки и преобразование типов', ['арифметика', 'конкатенация', 'String()', 'Number()'], ['1-5', '1-6', '1-11'], [
    exercises('1-5', 'Выведи сумму времени за два дня, разницу firstDay − secondDay и долю firstDay от суток в процентах.', 'let firstDay = 3;\nlet secondDay = 2.5;\n', [
      'Первые два результата получаются сложением и вычитанием.', 'Доля суток в процентах: firstDay / 24 * 100.',
    ], [output(5.5, 0.5, 12.5)]),
    exercises('1-6', 'Улучши вывод расчёта времени в соцсетях. Добавь к двум числам пояснения из условия.', "let mediaInTwoDays = 3 + 2.5;\nlet timeInMinutes = mediaInTwoDays * 60;\nconsole.log(timeInMinutes);\nlet minutesLeftPerDay = (420 - timeInMinutes) / 5;\nconsole.log(minutesLeftPerDay);\n", [
      'Соедини текст и значения переменных оператором +.', 'Сохрани пробелы и точки из условия.',
    ], [output('За два дня вы провели в соцсетях 330 минут.', 'В оставшиеся дни вы можете сидеть в соцсетях по 18 минут в день.')]),
    exercises('1-11', 'Сделай первое задание из документа. Используй строгое сравнение и преобразуй number в строку.', "let string = '123';\nlet number = 123;\nif (string === number) {\n  console.log('Сравнение заработало');\n} else {\n  console.log('Не могу сравнить');\n}\n", [
      'Строгое равенство записывается как ===.', 'Вызови String(number) перед сравнением.',
    ], [output('Сравнение заработало'), X('Типы исходных значений', '[typeof string, typeof number]', ['string','number'])]),
  ]),
  schedule('3', 'Условия, сравнения и логика', ['if и else', 'операторы сравнения', 'вложенные условия', '&& и ||'], ['1-7', '1-8', '1-9', '1-12', '1-13', '1-16'], [
    exercises('1-7', 'Сравни walkTime и optimalTime через if. Установи walkTime равным 90 для финальной проверки.', 'let optimalTime = 80;\nlet walkTime = 60;\n', [
      'Условие проверяет, что walkTime > optimalTime.', 'Внутри if выведи «Прогулка достаточно длинная».',
    ], [output('Прогулка достаточно длинная'), X('Время прогулки', 'walkTime', 90)]),
    exercises('1-9', "Выведи результаты трёх сравнений по порядку: true <= 0, '2' > '1', 'кекс' < 'КЕКС'.", '', [
      'Каждое сравнение передай отдельному вызову console.log.', 'Проверь, что в консоли выводятся логические значения.',
    ], [output(false, true, false)]),
    exercises('1-12', 'Добавь два вложенных if. Измени message, только если хватает разработчиков и доступна технология. Установи techAvailable в true.', "let enoughDevelopers = true;\nlet techAvailable = false;\nlet message = 'Проект нельзя выполнить';\nconsole.log(message);\n", [
      'Во внешнем if проверь enoughDevelopers.', 'Внутри второго if присвой message строку «Проект можно выполнить».',
    ], [output(projectMessage), X('Сообщение', 'message', projectMessage)]),
  ]),
  schedule('4', 'Циклы и режимы печати', ['цикл for', 'счётчик', 'шаг цикла', 'режимы печати'], ['1-17', '1-18', '1-19', '1-20', '1-21', '1-22'], [
    exercises('1-17', 'Замени повторяющиеся команды печати одним циклом и увеличь количество копий до пяти.', 'let page = 7;\nlet count = 3;\nconsole.log(page);\nconsole.log(page);\nconsole.log(page);\n', [
      'В теле цикла оставь один console.log(page).', 'Начни счётчик с нуля и проверяй i < count.',
    ], [output(7, 7, 7, 7, 7), X('Количество копий', 'count', 5)]),
    exercises('1-19', 'Измени шаг счётчика и выведи чётные номера страниц при totalPages = 9.', 'let totalPages = 7;\nfor (let page = 1; page <= totalPages; page++) {\n  console.log(page);\n}\n', [
      'Чётные номера начинаются с двух.', 'Увеличивай page на два после каждой итерации.',
    ], [output(2, 4, 6, 8), X('Всего страниц', 'totalPages', 9)]),
    exercises('1-22', 'Добавь режим reverse, который печатает все страницы от последней до первой. Запусти этот режим.', pages + "if (mode === 'document') {\n  for (let page = 1; page <= totalPages; page++) console.log(page);\n}\n", [
      'Добавь проверку mode === "reverse" после двух имеющихся.', 'Начни reversePage с totalPages и уменьшай до единицы включительно.',
    ], [output(6, 5, 4, 3, 2, 1), X('Режим печати', 'mode', 'reverse')]),
  ]),
  schedule('5', 'Массивы и обработка данных', ['индексы', 'length', 'перебор', 'суммирование'], ['2-1-5', '2-1-6', '2-1-7', '2-1-9', '2-1-10', '2-1-11'], [
    exercises('2-1-7', 'Получи из массива посещаемость первого и четвёртого дня. Сохрани значения в firstDayUsers и fourthDayUsers и выведи их по порядку.', visitData, [
      'Первый индекс массива — 0.', 'Четвёртому элементу соответствует индекс 3.',
    ], [output(812, 1247), X('Значения переменных', '[firstDayUsers, fourthDayUsers]', [812,1247])]),
    exercises('2-1-9', 'Добавь в конец массива 1000. Выведи длину массива, последний элемент и третий с конца. Индексы рассчитай через length.', visitData, [
      'Индекс последнего элемента на единицу меньше длины.', 'Индекс третьего элемента с конца равен usersByDay.length − 3.',
    ], [output(5, 1000, 657), X('Обновлённый массив', 'usersByDay', [812,1360,657,1247,1000])]),
    exercises('2-1-11', 'Добавь totalUsers и накопи в ней посещаемость за все дни. Выведи сумму после цикла.', 'let expectedUsers = 1000;\n' + visitData + "\nconsole.log(usersByDay, expectedUsers);\nfor (let i = 0; i < usersByDay.length; i++) {\n  console.log(usersByDay[i]);\n}\nlet averageUsers = 0;\nconsole.log('Средняя посещаемость: ' + averageUsers);\n", [
      'Задай totalUsers ноль перед циклом.', 'Вместо вывода элемента прибавляй usersByDay[i] к totalUsers.',
    ], [output([[812,1360,657,1247],1000], 4076, 'Средняя посещаемость: 0'), X('Накопленная сумма', 'totalUsers', 4076)]),
  ]),
  schedule('6', 'Функции и объекты', ['параметры', 'аргументы', 'return', 'свойства объектов'], ['2-2-4', '2-2-5', '2-2-6', '2-2-7', '2-2-8', '2-3-4', '2-3-5'], [
    exercises('2-2-7', "Вызови showGreeting четыре раза: без аргументов, с 5, с 5 и 'Кекс', затем с 'Кекс' и 5.", "let showGreeting = function (name, age) {\n  console.log('Привет! Меня зовут ' + name + '. Мне ' + age + ' лет.');\n};\n", [
      'Вызов без аргументов записывается как showGreeting().', 'Сравни вывод третьего и четвёртого вызова.',
    ], [output('Привет! Меня зовут undefined. Мне undefined лет.', 'Привет! Меня зовут 5. Мне undefined лет.', 'Привет! Меня зовут 5. Мне Кекс лет.', 'Привет! Меня зовут Кекс. Мне 5 лет.')]),
    exercises('2-2-8', 'Округли количество миль вниз, верни его из calculateMiles и выведи два сообщения из условия.', "let calculateMiles = function (distance) {\n  let percent = 0.25;\n  if (distance > 10500) percent = 0.35;\n  let miles = distance * percent;\n  console.log('За полёт получим ' + miles + ' миль');\n};\ncalculateMiles(4125);\ncalculateMiles(11000);\n", [
      'Округли результат с Math.floor и верни miles через return.', 'Добавь к сообщениям результаты calculateMiles(4125) и calculateMiles(11000).',
    ], [output('За перелёт в Иркутск получим 1031 миль', 'За перелёт на Камчатку получим 3849 миль'), X('Возвращённое число', 'calculateMiles(12000)', 4200)]),
    exercises('2-3-4', "Создай объекты firstCat и secondCat. Имена игроков — «Кекс» и «Рудольф», начальные очки обоих — 0.", '', [
      'Объект записывается в фигурных скобках.', 'Для каждого игрока укажи свойства name и points.',
    ], [X('Первый игрок', 'firstCat', {name:'Кекс', points:0}), X('Второй игрок', 'secondCat', {name:'Рудольф', points:0})]),
  ]),
  schedule('7', 'Поиск элементов и обновление DOM', ['querySelector', 'querySelectorAll', 'classList', 'перебор коллекции'], ['3-1-2', '3-1-3', '3-1-4', '3-1-5', '3-1-6', '3-1-7'], [
    lab('3-1-3', 'Вместо вывода элементов назначь второму товару product--special, а последнему — product--unavailable.', [
      'DOM-элементы найдены в стартовом коде.', 'Замени console.log на вызовы classList.add с нужными классами.',
    ], [X('Спецпредложение', productCards + '.map(el => el.classList.contains("product--special"))', [false,true,false,false,false]), X('Нет в наличии', productCards + '.map(el => el.classList.contains("product--unavailable"))', [false,false,false,false,true])]),
    lab('3-1-5', 'Перебери коллекцию elements. Каждый элемент выведи в консоль и добавь ему класс product--available.', [
      'Счётчик идёт от 0 до elements.length − 1.', 'Получи elements[i] и вызови у него classList.add.',
    ], [X('Все пять товаров отмечены', 'document.querySelectorAll(".products > .product.product--available").length', 5)]),
    lab('3-1-6', 'Получи products[i] внутри цикла. Назначь класс наличия в зависимости от isAvailable.', [
      'Начни с availabilityClass = "product--available".', 'Для товара не в наличии используй product--unavailable.',
    ], [X('Товары в наличии', productCards + '.map(el => el.classList.contains("product--available"))', [true,false,true,true,false]), X('Товары отсутствуют', productCards + '.map(el => el.classList.contains("product--unavailable"))', [false,true,false,false,true])]),
  ]),
  schedule('8', 'Создание карточек товаров', ['children', 'createElement', 'textContent', 'appendChild'], ['3-1-10', '3-1-11', '3-1-12', '3-1-13', '3-1-15', '3-1-16'], [
    lab('3-1-11', 'Создай li с классом product, добавь его в cardList через appendChild и выведи обновлённую коллекцию дочерних элементов.', [
      'Создай listItem через document.createElement("li").', 'После добавления выведи cardList.children.',
    ], [X('Карточка добавлена в конец', '(()=>{const items=document.querySelector(".products"); return [items.children.length,items.lastElementChild?.matches("li.product")]})()', [4,true])]),
    lab('3-1-12', 'Добавь в listItem заголовок «Профессиональная селфи-палка» и цену «1000». Используй теги и классы из условия.', [
      'Для заголовка создай h2.product__title.', 'Для цены создай p.product__price. Заполни оба через textContent.',
    ], [X('Заголовок', 'document.querySelector(".products > li.product:last-child > h2.product__title")?.textContent', 'Профессиональная селфи-палка'), X('Цена', 'document.querySelector(".products > li.product:last-child > p.product__price")?.textContent', '1000')]),
    lab('3-1-13', 'Объяви makeElement(tagName, className, text). Функция создаёт и возвращает элемент с указанным классом и необязательным текстом.', [
      'Создай элемент через document.createElement(tagName).', 'Проверь наличие текста и верни элемент через return.',
    ], [X('Элемент с текстом', '(()=>{const el=makeElement("p","product__price","1000"); return [el.tagName,el.className,el.textContent]})()', ['P','product__price','1000']), X('Элемент без текста', 'makeElement("li","product").textContent', '')]),
  ]),
  schedule('9', 'События и управление интерфейсом', ['обработчик click', 'preventDefault()', 'classList', 'keydown'], ['3-2-1', '3-2-2', '3-2-3', '3-2-4', '3-2-5', '3-2-6', '3-2-9'], [
    lab('3-2-5', 'Замени вывод в консоль добавлением класса modal--show. Проверь, что «Показать контакты» открывает окно.', [
      'Сохрани отмену стандартного действия ссылки.', 'Внутри обработчика добавь popup класс modal--show.',
    ], [X('Сначала окно скрыто', isOpen, false), X('После клика окно открыто', '(()=>{' + clickOpen + 'return ' + isOpen + '})()', true)]),
    lab('3-2-6', 'Найди кнопку button-close внутри popup. По клику на неё удали modal--show.', [
      'Используй popup.querySelector(".button-close").', 'Для удаления класса используй classList.remove.',
    ], [X('Открытие и закрытие мышью', '(()=>{' + clickOpen + 'const opened=' + isOpen + '; document.querySelector(".button-close").click(); return [opened,' + isOpen + ']})()', [true,false])]),
    lab('3-2-9', 'Замени вывод сообщения в обработчике Escape на закрытие окна. Для ручной проверки поставь фокус в предпросмотр.', [
      'Заменить нужно код внутри условия обработчика keydown.', 'Удали у popup класс modal--show. Можно проверять evt.key === "Escape".',
    ], [X('Escape закрывает окно', '(()=>{' + clickOpen + 'const opened=' + isOpen + '; document.dispatchEvent(new KeyboardEvent("keydown", {key:"Escape", keyCode:27, bubbles:true})); return [opened,' + isOpen + ']})()', [true,false])]),
  ]),
];
export const tasksCount = lessons.reduce((sum, lesson) => sum + lesson.tasks.length, 0);
export const overview = materialCatalog.overview;
export const lessonMinutes = 90;
export const dayMinutes = 3 * lessonMinutes;
