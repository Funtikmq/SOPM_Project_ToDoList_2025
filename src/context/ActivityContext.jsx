import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { listenActivity } from "../services/activityService";

const ActivityContext = createContext({
  activityByTask: {},
  subscribeTaskActivity: () => {},
  getActivity: () => [],
});

export const ActivityProvider = ({ children }) => {
  const [activityByTask, setActivityByTask] = useState({});
  const unsubRef = useRef({});

  const subscribeTaskActivity = useCallback((taskId, limit = 50) => {
    if (!taskId) return () => {};
    // Reuse existing listener if present
    if (unsubRef.current[taskId]) {
      return unsubRef.current[taskId];
    }
    const unsub = listenActivity(taskId, (list) => {
      setActivityByTask((prev) => ({ ...prev, [taskId]: list }));
    }, limit);
    unsubRef.current[taskId] = () => {
      unsub?.();
      delete unsubRef.current[taskId];
    };
    return unsubRef.current[taskId];
  }, []);

  const getActivity = useCallback(
    (taskId) => {
      return activityByTask[taskId] || [];
    },
    [activityByTask]
  );

  useEffect(() => {
    return () => {
      Object.values(unsubRef.current).forEach((fn) => fn?.());
      unsubRef.current = {};
    };
  }, []);

  const value = useMemo(
    () => ({
      activityByTask,
      subscribeTaskActivity,
      getActivity,
    }),
    [activityByTask, subscribeTaskActivity, getActivity]
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};

export const useActivity = () => useContext(ActivityContext);
