import { useState, useEffect, useCallback } from 'react';
import { initDB } from '../database/setup/init';

export interface CrudService<T, NewT = any> {
  getAll: () => Promise<T[]>;
  getById: (id: number) => Promise<T | null>;
  add: (data: NewT) => Promise<number | null>;
  update: (item: T) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
}

export const useCrud = <T extends { id: number }, NewT = any>(service: CrudService<T, NewT>) => {
  const [data, setdata] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      await initDB();
      const result = await service.getAll();
      setdata(result);
    } catch (err) {
      setError(`Failed to fetch data: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addItem = async (data: NewT) => {
    try {
      const newId = await service.add(data);
      if (newId) {
        const newItem = await service.getById(newId);
        if (newItem) {
          setdata((prevdata) => [newItem, ...prevdata]);
        }
        return newId;
      }
    } catch (err) {
      setError(`Failed to add item: ${err}`);
    }
    return null;
  };

  const updateItem = async (item: T) => {
    try {
      const success = await service.update(item);
      if (success) {
        setdata((prevdata) => prevdata.map((i) => (i.id === item.id ? item : i)));
      }
      return success;
    } catch (err) {
      setError(`Failed to update item: ${err}`);
    }
    return false;
  };

  const deleteItem = async (id: number) => {
    try {
      const success = await service.delete(id);
      if (success) {
        setdata((prevdata) => prevdata.filter((item) => item.id !== id));
      }
      return success;
    } catch (err) {
      setError(`Failed to delete item: ${err}`);
    }
    return false;
  };

  return { data, isLoading, error, addItem, updateItem, deleteItem, refetch: fetchData };
};
