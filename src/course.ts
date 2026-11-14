export type Test = { name: string; expression?: string; expected: unknown };
export type Mode = 'console' | 'function' | 'dom';
export type Task = { id: string; title: string; goal: string; mode: Mode; starter: string; hints: string[]; tests: Test[]; html: string; minutes: number };
export type Lesson = { id: string; day: number; number: number; title: string; subtitle: string; source: string; concepts: string[]; example: string; tasks: Task[] };

const C = (id: string, title: string, goal: string, starter: string, expected: string, hints: string[]): Task => ({
  id, title, goal, starter, hints, mode: 'console', html: '', minutes: 15, tests: [{ name: 'Вывод в консоль', expected: [expected] }]
});
const F = (id: string, title: string, goal: string, starter: string, tests: Test[], hints: string[]): Task => ({
  id, title, goal, starter, hints, tests, mode: 'function', html: '', minutes: 15
});
const D = (id: string, title: string, goal: string, starter: string, html: string, tests: Test[], hints: string[]): Task => ({
  id, title, goal, starter, html, tests, hints, mode: 'dom', minutes: 15
});
const X = (name: string, expression: string, expected: unknown): Test => ({ name, expression, expected });

const shop = '<main class="shop"><span class="eyebrow">TOP / STORE</span><h2>Товары недели</h2><p class="status">Магазин готов к открытию</p><ul id="products" class="products"><li class="product" data-available="true">Клавиатура</li><li class="product" data-available="false">Наушники</li><li class="product" data-available="true" data-special="true">Монитор</li></ul></main>';
const empty = '<main class="shop"><span class="eyebrow">TOP / STORE</span><h2>Новая коллекция</h2><ul id="products" class="products"></ul></main>';
const toggle = '<main class="shop"><h2>Карточка товара</h2><button id="toggle">Детали</button><p id="panel" class="is-hidden">Сделано с JavaScript ✨</p></main>';
const counter = '<main class="shop"><h2>Корзина</h2><p>В корзине: <strong id="count">0</strong></p><button id="add">Добавить товар</button></main>';
const finale = '<main class="shop"><span class="eyebrow">TOP / STORE</span><h2>Мой магазин</h2><p>В корзине: <strong id="count">0</strong></p><ul id="products" class="products"></ul></main>';

export const lessons: Lesson[] = [
  { id:'l1', day:1, number:1, title:'Первый код', subtitle:'Консоль и переменные', source:'Основы языка: 1. Вывод в консоль и комментарии; 2. Типы данных; 3. Переменные', concepts:['console.log()', 'let и const', 'number, string, boolean'], example:"const name = 'TOP';\nconsole.log('Привет, ' + name + '!');",
    tasks:[
      C('t1-1','Привет, TOP!','Выведи точную строку «Привет, TOP!» в консоль.','// Выведи сообщение в консоль\n','Привет, TOP!',['Вывод в консоль — console.log(...)','Не забудь кавычки вокруг строки.']),
      C('t1-2','Переменная','Создай переменную language со значением JavaScript и выведи её.','// Создай const language\n// Выведи значение\n','JavaScript',['const language = ...','Передай в console.log имя переменной без кавычек.']),
      C('t1-3','Профиль ученика','Создай name = "Студент" и lessons = 9. Выведи «Студент: 9 занятий».','// Объяви две переменные\n// Сформируй строку\n','Студент: 9 занятий',['Для соединения строк используй +','Число автоматически преобразуется в строку при конкатенации.'])
    ]
  },
  { id:'l2', day:1, number:2, title:'Числа и строки', subtitle:'Вычисляем и объединяем', source:'Основы языка: 5. Операции, операторы и операнды; 6. Конкатенация; 11. String и Number', concepts:['+, -, *, /', 'конкатенация', 'преобразования типов'], example:'const price = 850;\nconst quantity = 3;\nconsole.log(price * quantity);',
    tasks:[
      C('t2-1','Стоимость покупки','Товар стоит 850 ₽. Покупаем 3 штуки. Выведи общую стоимость числом.','const price = 850;\nconst amount = 3;\n// Вычисли сумму\n','2550',['Используй оператор умножения *','Выведи price * amount.']),
      C('t2-2','Скидка','Цена 1000 ₽, скидка 15%. Выведи итоговую стоимость.','const price = 1000;\nconst discount = 15;\n// Итоговая цена\n','850',['Найди размер скидки: price * discount / 100','Вычти полученное значение из price.']),
      C('t2-3','Название бренда','Соедини слова TOP и Academy через пробел.','const a = "TOP";\nconst b = "Academy";\n// Выведи одну строку\n','TOP Academy',['Используй оператор +','Между переменными добавь строку с пробелом " ".'])
    ]
  },
  { id:'l3', day:1, number:3, title:'Условия и решения', subtitle:'if, else и логика', source:'Основы языка: 7–15, 16. Время прогулки', concepts:['if / else', 'сравнения', 'логические операторы'], example:'function isAdult(age) {\n  return age >= 18;\n}',
    tasks:[
      F('t3-1','Совершеннолетие','Функция isAdult(age) возвращает true для возраста от 18 лет, иначе false.','function isAdult(age) {\n  // Верни результат сравнения\n}\n',[X('Ровно 18','isAdult(18)',true),X('17 лет','isAdult(17)',false),X('30 лет','isAdult(30)',true)],['Сравни age с 18','return age >= 18;']),
      F('t3-2','Дождь и прогулка','canWalk(isRaining) возвращает false, если идёт дождь, и true, если нет.','function canWalk(isRaining) {\n  // Верни логическое значение\n}\n',[X('Идёт дождь','canWalk(true)',false),X('Сухо','canWalk(false)',true)],['Используй оператор отрицания !','return !isRaining;']),
      F('t3-3','Время прогулки','Адаптация задания «Время прогулки»: дождь → 0; 10–14 °C → 30; 15–24 °C → 40; 25–35 °C → 20 минут; вне диапазонов → 0. Создай walkMinutes(temperature, isRaining).','function walkMinutes(temperature, isRaining) {\n  // Сначала проверь дождь\n  // Потом диапазоны температур\n}\n',[X('Дождь','walkMinutes(20,true)',0),X('10 °C','walkMinutes(10,false)',30),X('14 °C','walkMinutes(14,false)',30),X('15 °C','walkMinutes(15,false)',40),X('24 °C','walkMinutes(24,false)',40),X('25 °C','walkMinutes(25,false)',20),X('35 °C','walkMinutes(35,false)',20),X('Ниже диапазона','walkMinutes(5,false)',0)],['Начни с if (isRaining) return 0;','Используй && для проверки диапазонов. В конце return 0.'])
    ]
  },
  { id:'l4', day:2, number:4, title:'Повторяющиеся действия', subtitle:'Циклы for и while', source:'Основы языка: 17. Циклы; 18. Цикл for; 19. Чётные и нечётные числа', concepts:['for', 'while', 'счётчик'], example:'for (let i = 1; i <= 3; i++) {\n  console.log(i);\n}',
    tasks:[
      F('t4-1','От одного до N','Функция range(n) возвращает массив [1, 2, ..., n].','function range(n) {\n  const numbers = [];\n  // Добавь числа через цикл\n  return numbers;\n}\n',[X('Три числа','range(3)',[1,2,3]),X('Одно число','range(1)',[1]),X('Ноль','range(0)',[])],['Для добавления элемента используй push','Цикл for (let i = 1; i <= n; i++).']),
      F('t4-2','Сумма чисел','Функция sumTo(n) возвращает сумму от 1 до n.','function sumTo(n) {\n  let sum = 0;\n  // Накопи сумму\n  return sum;\n}\n',[X('Сумма до 3','sumTo(3)',6),X('Сумма до 10','sumTo(10)',55),X('Ноль','sumTo(0)',0)],['Начни с let sum = 0','Внутри цикла делай sum += i;']),
      F('t4-3','Чётные числа','Функция evens(n) возвращает все чётные числа от 1 до n.','function evens(n) {\n  const result = [];\n  // Найди чётные числа\n  return result;\n}\n',[X('До восьми','evens(8)',[2,4,6,8]),X('До пяти','evens(5)',[2,4]),X('До одного','evens(1)',[])],['Чётность проверяется через остаток %','if (i % 2 === 0) result.push(i);'])
    ]
  },
  { id:'l5', day:2, number:5, title:'Массивы', subtitle:'Списки и поиск', source:'Базовые структуры данных: Массивы, уроки 1–15', concepts:['индексы', 'length', 'перебор массива'], example:'const prices = [100, 250, 650];\nconsole.log(prices[0]);\nconsole.log(prices.length);',
    tasks:[
      F('t5-1','Первый товар','firstItem(items) возвращает первый элемент массива, а для пустого — null.','function firstItem(items) {\n  // Проверь длину\n}\n',[X('Первый товар','firstItem(["чай","кофе"])','чай'),X('Одно число','firstItem([7])',7),X('Пустой массив','firstItem([])',null)],['У массива есть свойство length','Если items.length === 0, верни null.']),
      F('t5-2','Сумма корзины','cartTotal(prices) возвращает сумму всех чисел массива.','function cartTotal(prices) {\n  let sum = 0;\n  // Перебери prices\n  return sum;\n}\n',[X('Три товара','cartTotal([100,250,650])',1000),X('Пустая корзина','cartTotal([])',0),X('Один товар','cartTotal([75])',75)],['Можно использовать for...of','Для каждого price прибавляй его к sum.']),
      F('t5-3','Самая высокая цена','maxPrice(prices) возвращает максимум, а для пустого массива — null.','function maxPrice(prices) {\n  // Учти пустой список\n}\n',[X('Обычные цены','maxPrice([100,580,250])',580),X('Отрицательные','maxPrice([-7,-2,-10])',-2),X('Пустой массив','maxPrice([])',null)],['Не начинай максимум с 0 — цены могут быть отрицательными','Если массив непустой, начни с prices[0].'])
    ]
  },
  { id:'l6', day:2, number:6, title:'Функции и объекты', subtitle:'Собираем данные о товарах', source:'Базовые структуры данных: Функции 1–8; Объекты 1–8', concepts:['function', 'return', 'свойства объекта'], example:'function title(product) {\n  return product.name + ": " + product.price;\n}',
    tasks:[
      F('t6-1','Цена со скидкой','priceWithDiscount(price, percent) возвращает цену после скидки.','function priceWithDiscount(price, percent) {\n  // Рассчитай итоговую цену\n}\n',[X('10 процентов','priceWithDiscount(500,10)',450),X('Без скидки','priceWithDiscount(100,0)',100),X('50 процентов','priceWithDiscount(80,50)',40)],['Скидка — это доля исходной цены','return price - price * percent / 100;']),
      F('t6-2','Описание товара','productLabel(product) возвращает строку «Название — Цена ₽».','function productLabel(product) {\n  // Используй product.name и product.price\n}\n',[X('Ноутбук','productLabel({name:"Ноутбук",price:30000})','Ноутбук — 30000 ₽'),X('Мышь','productLabel({name:"Мышь",price:900})','Мышь — 900 ₽')],['Читай свойства через точку','Между названием и ценой стоит длинное тире.']),
      F('t6-3','Остатки на складе','totalStock(products) возвращает сумму свойства stock у всех объектов.','function totalStock(products) {\n  let sum = 0;\n  // Пройди по массиву объектов\n  return sum;\n}\n',[X('Два товара','totalStock([{stock:3},{stock:7}])',10),X('Пустой список','totalStock([])',0),X('Один товар','totalStock([{stock:2}])',2)],['Каждый product имеет свойство stock','sum += product.stock;'])
    ]
  },
  { id:'l7', day:3, number:7, title:'Встреча с DOM', subtitle:'Находим и меняем элементы', source:'JavaScript в браузере: уроки 1–5, лабораторные задания 1–5 (адаптация)', concepts:['querySelector', 'textContent', 'classList'], example:"const status = document.querySelector('.status');\nstatus.textContent = 'Магазин открыт';",
    tasks:[
      D('t7-1','Магазин открыт','Найди элемент .status и измени текст на «Магазин открыт».',"const status = document.querySelector('.status');\n// Измени текст\n",shop,[X('Статус изменён','document.querySelector(".status").textContent.trim()','Магазин открыт')],['textContent отвечает за текст','status.textContent = "Магазин открыт";']),
      D('t7-2','Товары в наличии','Добавь класс product--available ко всем li.product с data-available="true".','// Найди все доступные товары\n// Добавь класс каждому из них\n',shop,[X('Два доступных','document.querySelectorAll(".product--available").length',2),X('Недоступный не помечен','!document.querySelectorAll(".product")[1].classList.contains("product--available")',true)],['Используй document.querySelectorAll','Для каждого элемента вызови classList.add("product--available").']),
      D('t7-3','Спецпредложение','Добавь product--special товару с data-special="true".','// Найди товар со специальным предложением\n',shop,[X('Один акционный','document.querySelectorAll(".product--special").length',1),X('Это монитор','document.querySelector(".product--special").textContent.trim()','Монитор')],['Используй селектор [data-special="true"]','classList.add("product--special")'])
    ]
  },
  { id:'l8', day:3, number:8, title:'Создаём карточки', subtitle:'Генерация каталога из данных', source:'JavaScript в браузере: уроки 10–21 и соответствующие лабораторные (адаптация)', concepts:['createElement', 'append', 'массив объектов'], example:"const li = document.createElement('li');\nli.textContent = 'Ноутбук';\ndocument.querySelector('#products').append(li);",
    tasks:[
      D('t8-1','Первая карточка','Создай li с классом product и текстом «Ноутбук», добавь в #products.','// Создай li и добавь его в список\n',empty,[X('Одна карточка','document.querySelectorAll("#products li.product").length',1),X('Название','document.querySelector("#products li").textContent.trim()','Ноутбук')],['Создай li через document.createElement("li")','Добавь класс, текст, затем append.']),
      D('t8-2','Каталог из данных','Используя cardsData, создай три li.product с названиями товаров.','const cardsData = [{name:"Ноутбук"},{name:"Мышь"},{name:"Наушники"}];\n// Перебери массив и создай карточки\n',empty,[X('Три карточки','document.querySelectorAll("#products li.product").length',3),X('Первый','document.querySelector("#products li:first-child").textContent.trim()','Ноутбук'),X('Последний','document.querySelector("#products li:last-child").textContent.trim()','Наушники')],['Сделай for...of по cardsData','Внутри цикла создай li, назначь className и textContent.']),
      D('t8-3','Акции в каталоге','Создай карточки из cardsData. Товару с isSpecial: true добавь класс product--special.','const cardsData = [{name:"Ноутбук",isSpecial:false},{name:"Мышь",isSpecial:true},{name:"Наушники",isSpecial:false}];\n// Генерируй карточки и выдели акцию\n',empty,[X('Всего карточек','document.querySelectorAll("#products li.product").length',3),X('Одна акция','document.querySelectorAll("#products li.product--special").length',1),X('Акция на мышь','document.querySelector("#products .product--special").textContent.trim()','Мышь')],['Проверяй product.isSpecial','Если true, добавляй product--special.'])
    ]
  },
  { id:'l9', day:3, number:9, title:'События и финальный проект', subtitle:'Делаем магазин интерактивным', source:'JavaScript в браузере: Знакомство с событиями 1–9; адаптированная итоговая практика', concepts:['addEventListener', 'click', 'изменение состояния'], example:"document.querySelector('button').addEventListener('click', () => {\n  console.log('Нажали!');\n});",
    tasks:[
      D('t9-1','Показать детали','По клику на #toggle переключай класс is-hidden у #panel.','// Подпиши кнопку на событие click\n',toggle,[X('После одного клика видно','(()=>{document.querySelector("#toggle").click();return !document.querySelector("#panel").classList.contains("is-hidden")})()',true),X('После двух кликов скрыто','(()=>{document.querySelector("#toggle").click();document.querySelector("#toggle").click();return document.querySelector("#panel").classList.contains("is-hidden")})()',true)],['Добавь обработчик через addEventListener("click",...)','classList.toggle("is-hidden") переключает класс.']),
      D('t9-2','Счётчик покупок','Каждый клик на #add увеличивает число в #count на 1.','// Найди кнопку и счётчик\n// Добавь обработчик клика\n',counter,[X('Один клик','(()=>{document.querySelector("#add").click();return document.querySelector("#count").textContent.trim()})()','1'),X('Три клика','(()=>{for(let i=0;i<3;i++)document.querySelector("#add").click();return document.querySelector("#count").textContent.trim()})()','3')],['Заведи переменную count = 0','В обработчике увеличивай count и обновляй textContent.']),
      D('t9-3','Мой магазин','Итог: создай три li.product из cardsData. В каждой карточке должна быть button.buy. По клику увеличивай число в #count.','const cardsData = [{name:"Ноутбук"},{name:"Мышь"},{name:"Наушники"}];\n// 1. Создай карточки\n// 2. Добавь кнопку покупки\n// 3. Реализуй счётчик\n',finale,[X('Три карточки','document.querySelectorAll("#products li.product").length',3),X('Три кнопки','document.querySelectorAll("#products button.buy").length',3),X('Две покупки','(()=>{const bs=document.querySelectorAll("#products button.buy");bs[0].click();bs[1].click();return document.querySelector("#count").textContent.trim()})()','2'),X('Названия','Array.from(document.querySelectorAll("#products li.product")).map(li=>li.textContent.includes("Ноутбук")||li.textContent.includes("Мышь")||li.textContent.includes("Наушники")).every(Boolean)',true)],['Начни с генерации карточек и кнопок','Создай общий счётчик, подключи обработчик к каждой кнопке.'])
    ]
  }
];
export const tasksCount = lessons.reduce((sum, lesson) => sum + lesson.tasks.length, 0);
