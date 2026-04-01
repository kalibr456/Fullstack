import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sections from './Sections';
import { BrowserRouter } from 'react-router-dom';

// Мокаем API
vi.mock('../api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { sections: [] } })),
  },
}));

describe('Sections Component Roles', () => {
  it('не должен показывать админ-панель для обычного пользователя', async () => {
    // 1. Имитируем роль пользователя
    localStorage.setItem('role', 'user');
    
    render(
      <BrowserRouter>
        <Sections />
      </BrowserRouter>
    );

    // 2. Ждем, пока компонент прогрузится (убирает предупреждение act)
    await waitFor(() => {
      expect(screen.getByText(/Доступные секции/i)).toBeInTheDocument();
    });

    // 3. Проверяем, что админ-панели НЕТ
    const adminHeader = screen.queryByText(/Админ-панель/i);
    expect(adminHeader).not.toBeInTheDocument();
  });

  // ДОБАВИМ ВТОРОЙ ТЕСТ ДЛЯ АДМИНА (для красоты отчета)
  it('должен показывать админ-панель для администратора', async () => {
    localStorage.setItem('role', 'admin');
    
    render(
      <BrowserRouter>
        <Sections />
      </BrowserRouter>
    );

    // Ждем появления заголовка админ-панели
    await waitFor(() => {
      const adminHeader = screen.getByText(/Админ-панель/i);
      expect(adminHeader).toBeInTheDocument();
    });
  });
});