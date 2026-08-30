'use client';

import { useCallback, useState } from 'react';
import type { CategoryOption } from './TransactionAdder';

/**
 * Список категорий, к которому можно тут же добавить только что созданную.
 *
 * Серверный список приходит пропсами и обновится после revalidate, но окно
 * при этом остаётся открытым — ждать перерисовки, глядя на пустое место
 * вместо своей категории, незачем. Добавленную держим отдельно и склеиваем,
 * а дубли по id отсекаем: после обновления она придёт и с сервера.
 */
export function useCategoryList(categories: CategoryOption[]) {
  const [created, setCreated] = useState<CategoryOption[]>([]);

  const add = useCallback((category: CategoryOption) => {
    setCreated((current) => [...current, category]);
  }, []);

  const known = new Set(categories.map((category) => category.id));
  const all = [...categories, ...created.filter((category) => !known.has(category.id))];

  return { all, add };
}
