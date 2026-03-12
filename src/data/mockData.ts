import type { Chat, User, Settings, Message } from '../types';

const createMessage = (
  id: string,
  role: 'user' | 'assistant',
  content: string,
  timestamp: Date
): Message => ({
  id,
  role,
  content,
  timestamp,
});

export const mockUser: User = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Иван Петров',
};

export const mockSettings: Settings = {
  theme: 'light',
  scope: 'GIGACHAT_API_PERS',
  model: 'GigaChat',
  temperature: 0.7,
  maxTokens: 1024,
};

export const mockChats: Chat[] = [
  {
    id: 'chat-1',
    title: 'Помощь с кодом на Python',
    createdAt: new Date('2024-03-10T10:00:00'),
    updatedAt: new Date('2024-03-10T10:30:00'),
    messages: [
      createMessage(
        'msg-1',
        'user',
        'Привет! Помоги мне написать функцию сортировки на Python.',
        new Date('2024-03-10T10:00:00')
      ),
      createMessage(
        'msg-2',
        'assistant',
        `Конечно! Вот пример функции быстрой сортировки (Quick Sort) на Python:

\`\`\`python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr

    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]

    return quick_sort(left) + middle + quick_sort(right)

# Пример использования
numbers = [3, 6, 8, 10, 1, 2, 1]
sorted_numbers = quick_sort(numbers)
print(sorted_numbers)  # [1, 1, 2, 3, 6, 8, 10]
\`\`\`

Эта реализация использует рекурсивный подход и выбирает средний элемент в качестве опорного (pivot).`,
        new Date('2024-03-10T10:01:00')
      ),
      createMessage(
        'msg-3',
        'user',
        'А можешь объяснить как работает эта сортировка?',
        new Date('2024-03-10T10:05:00')
      ),
      createMessage(
        'msg-4',
        'assistant',
        `Быстрая сортировка работает по принципу **"разделяй и властвуй"**:

1. **Выбор опорного элемента (pivot)**: Выбираем элемент из массива — в нашем случае средний элемент.

2. **Разделение**: Делим массив на три части:
   - \`left\` — элементы меньше pivot
   - \`middle\` — элементы равные pivot
   - \`right\` — элементы больше pivot

3. **Рекурсия**: Применяем ту же операцию к \`left\` и \`right\` частям.

4. **Объединение**: Собираем отсортированные части вместе.

**Временная сложность:**
- Средний случай: O(n log n)
- Худший случай: O(n²)

**Пространственная сложность:** O(n) для этой реализации.`,
        new Date('2024-03-10T10:06:00')
      ),
    ],
  },
  {
    id: 'chat-2',
    title: 'Рецепт борща',
    createdAt: new Date('2024-03-09T15:00:00'),
    updatedAt: new Date('2024-03-09T15:20:00'),
    messages: [
      createMessage(
        'msg-5',
        'user',
        'Подскажи рецепт классического борща',
        new Date('2024-03-09T15:00:00')
      ),
      createMessage(
        'msg-6',
        'assistant',
        `# Классический борщ

**Ингредиенты:**
- Говядина на кости — 500г
- Свёкла — 2 шт
- Капуста — 300г
- Картофель — 3 шт
- Морковь — 1 шт
- Лук — 1 шт
- Томатная паста — 2 ст.л.
- Чеснок — 3 зубчика
- Соль, перец по вкусу

**Приготовление:**
1. Сварите мясной бульон (1.5-2 часа)
2. Нарежьте овощи
3. Обжарьте лук и морковь, добавьте томатную пасту
4. Свёклу потушите отдельно с уксусом
5. В бульон добавьте картофель, через 10 минут — капусту
6. Добавьте зажарку и свёклу
7. Варите ещё 10-15 минут
8. Подавайте со сметаной и зеленью!`,
        new Date('2024-03-09T15:01:00')
      ),
    ],
  },
  {
    id: 'chat-3',
    title: 'Изучение TypeScript',
    createdAt: new Date('2024-03-08T09:00:00'),
    updatedAt: new Date('2024-03-08T09:45:00'),
    messages: [],
  },
  {
    id: 'chat-4',
    title: 'Планирование отпуска',
    createdAt: new Date('2024-03-07T18:00:00'),
    updatedAt: new Date('2024-03-07T18:30:00'),
    messages: [],
  },
  {
    id: 'chat-5',
    title: 'Обзор новых технологий',
    createdAt: new Date('2024-03-05T12:00:00'),
    updatedAt: new Date('2024-03-05T12:15:00'),
    messages: [],
  },
];
