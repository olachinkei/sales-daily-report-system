import { describe, it, expect } from 'vitest';

describe('Example Test Suite', () => {
  it('should pass a simple assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const text = 'Hello, Vitest!';
    expect(text).toContain('Vitest');
  });

  it('should work with objects', () => {
    const user = {
      name: '山田太郎',
      email: 'yamada@example.com',
      role: 'sales',
    };

    expect(user).toHaveProperty('name');
    expect(user.email).toMatch(/@example\.com$/);
  });
});
