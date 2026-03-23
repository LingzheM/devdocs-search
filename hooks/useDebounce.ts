import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 每次 value 变化时清除上一个定时器，只有停止输入 delay ms 后才更新
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
