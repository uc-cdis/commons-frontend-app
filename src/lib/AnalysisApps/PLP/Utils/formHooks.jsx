import { useState, useEffect } from 'react';

export const useFilter = (array, search, field) => {
  const [filtered, setFiltered] = useState([]);
  useEffect(() => {
    if (array?.length) {
      setFiltered(
        array.filter((item) =>
          item[`${field}`]?.toLowerCase().includes(`${search}`.toLowerCase()),
        ),
      );
    }
  }, [array, search]);

  return filtered;
};
