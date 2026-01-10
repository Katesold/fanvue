import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePersistentState } from './usePersistentState';

describe('usePersistentState', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => 
      usePersistentState('testKey', 'defaultValue')
    );

    expect(result.current[0]).toBe('defaultValue');
  });

  it('returns value from localStorage when available', () => {
    localStorage.setItem('testKey', JSON.stringify('storedValue'));

    const { result } = renderHook(() => 
      usePersistentState('testKey', 'defaultValue')
    );

    expect(result.current[0]).toBe('storedValue');
  });

  it('updates state and localStorage when setValue is called', () => {
    const { result } = renderHook(() => 
      usePersistentState('testKey', 'defaultValue')
    );

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(JSON.parse(localStorage.getItem('testKey')!)).toBe('newValue');
  });

  it('handles object values', () => {
    const initialValue = { filter: 'all', page: 1 };
    const { result } = renderHook(() => 
      usePersistentState('testKey', initialValue)
    );

    expect(result.current[0]).toEqual(initialValue);

    const newValue = { filter: 'pending', page: 2 };
    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
    expect(JSON.parse(localStorage.getItem('testKey')!)).toEqual(newValue);
  });

  it('handles functional updates', () => {
    const { result } = renderHook(() => 
      usePersistentState('counter', 0)
    );

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(6);
  });

  it('handles corrupted localStorage data gracefully', () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('testKey', 'not-valid-json');

    const { result } = renderHook(() => 
      usePersistentState('testKey', 'defaultValue')
    );

    // Should fall back to default value
    expect(result.current[0]).toBe('defaultValue');
  });

  it('persists value across hook instances', () => {
    const { result: hook1 } = renderHook(() => 
      usePersistentState('sharedKey', 'default')
    );

    act(() => {
      hook1.current[1]('updatedValue');
    });

    // New hook instance should read persisted value
    const { result: hook2 } = renderHook(() => 
      usePersistentState('sharedKey', 'default')
    );

    expect(hook2.current[0]).toBe('updatedValue');
  });
});
