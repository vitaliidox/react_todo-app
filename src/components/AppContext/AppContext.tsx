import React, { useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getTodos } from '../../api/todos';
import { Error } from '../../types/Error';
import { Status } from '../../types/Status';
import { Todo } from '../../types/Todo';
import { AuthContext } from '../Auth/AuthContext';

export type TodosData = {
  todos: Todo[],
  filteredTodos: Todo[] | null,
  setIsError: (arg: Error | null) => void,
  isError: Error | null,
  setFilter: (arg: Status) => void,
  setTodos: (arg: Todo[]) => void,
  setTodosList: () => void,
  filter: Status,
  getFilteredTodos: () => Todo[] | null,
};

export const AppContext = React.createContext<TodosData | null>(null);

type Props = {
  children: React.ReactNode;
};

export const AppProvider: React.FC <Props> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isError, setIsError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<Status>(Status.All);
  const locate = useLocation();
  const user = useContext(AuthContext);

  const setFiltersParam = () => {
    const location = locate.pathname;

    switch (true) {
      case location.includes(Status.Completed.toLowerCase()):
        setFilter(Status.Completed);
        break;
      case location.includes(Status.Active.toLowerCase()):
        setFilter(Status.Active);
        break;
      default:
        setFilter(Status.All);
    }
  };

  const getFilteredTodos = () => {
    if (!todos || todos.length === 0) {
      return null;
    }

    setFiltersParam();
    const todosList = [...todos];

    if (filter === Status.All) {
      return todosList;
    }

    return todosList.filter((todo) => {
      switch (filter) {
        case Status.Active: return !todo.completed;
        case Status.Completed: return todo.completed;
        default:
          return true;
      }
    });
  };

  const setTodosList = () => {
    if (!user) {
      return;
    }

    getTodos(user.id)
      .then(data => setTodos(data))
      .catch(() => {
        setIsError(Error.Update);
        setTodos([]);
      });
  };

  const filteredTodos = useMemo(() => getFilteredTodos(), [todos, filter]);

  const todosData = {
    todos,
    filteredTodos,
    setIsError,
    isError,
    setFilter,
    filter,
    setTodos,
    setTodosList,
    getFilteredTodos,
  };

  return (
    <AppContext.Provider value={todosData}>
      {children}
    </AppContext.Provider>
  );
};
