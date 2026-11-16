import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { TaskContext } from './TaskContext';
import { API_URL } from '../apiConfig';

export const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const { tasks, updateTask } = useContext(TaskContext);

  const [workDuration, setWorkDurationState] = useState(() => {
    const saved = localStorage.getItem('focus_workDuration');
    return saved ? parseInt(saved, 10) : 25;
  });
  
  const [breakDuration, setBreakDurationState] = useState(() => {
    const saved = localStorage.getItem('focus_breakDuration');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [selectedTaskId, setSelectedTaskIdState] = useState(() => {
    return localStorage.getItem('focus_selectedTaskId') || '';
  });

  const [isActive, setIsActive] = useState(() => {
    const savedActive = localStorage.getItem('focus_isActive') === 'true';
    const savedTarget = localStorage.getItem('focus_targetEndTime');
    if (savedActive && savedTarget) {
      const remainingMs = parseInt(savedTarget, 10) - Date.now();
      return remainingMs > 0;
    }
    return false;
  });

  const [isBreak, setIsBreak] = useState(() => {
    return localStorage.getItem('focus_isBreak') === 'true';
  });

  const [targetEndTime, setTargetEndTime] = useState(() => {
    const savedTarget = localStorage.getItem('focus_targetEndTime');
    return savedTarget ? parseInt(savedTarget, 10) : null;
  });

  const [minutes, setMinutes] = useState(() => {
    const savedTarget = localStorage.getItem('focus_targetEndTime');
    const savedActive = localStorage.getItem('focus_isActive') === 'true';
    if (savedActive && savedTarget) {
      const remainingSecs = Math.max(0, Math.ceil((parseInt(savedTarget, 10) - Date.now()) / 1000));
      return Math.floor(remainingSecs / 60);
    }
    const savedBreak = localStorage.getItem('focus_isBreak') === 'true';
    const savedWork = localStorage.getItem('focus_workDuration') ? parseInt(localStorage.getItem('focus_workDuration'), 10) : 25;
    const savedBreakDur = localStorage.getItem('focus_breakDuration') ? parseInt(localStorage.getItem('focus_breakDuration'), 10) : 5;
    return savedBreak ? savedBreakDur : savedWork;
  });

  const [seconds, setSeconds] = useState(() => {
    const savedTarget = localStorage.getItem('focus_targetEndTime');
    const savedActive = localStorage.getItem('focus_isActive') === 'true';
    if (savedActive && savedTarget) {
      const remainingSecs = Math.max(0, Math.ceil((parseInt(savedTarget, 10) - Date.now()) / 1000));
      return remainingSecs % 60;
    }
    return 0;
  });

  // Track notification completion summary popup
  const [sessionSummary, setSessionSummary] = useState(null); // { taskTitle, durationMins, cycleCount }
  const [breakSummary, setBreakSummary] = useState(false); // Track break completion popup
  
  const [notifyPermission, setNotifyPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const intervalRef = useRef(null);

  const setWorkDuration = (val) => {
    setWorkDurationState(val);
    localStorage.setItem('focus_workDuration', val.toString());
    if (!isActive && !isBreak) {
      setMinutes(val);
      setSeconds(0);
    }
  };

  const setBreakDuration = (val) => {
    setBreakDurationState(val);
    localStorage.setItem('focus_breakDuration', val.toString());
    if (!isActive && isBreak) {
      setMinutes(val);
      setSeconds(0);
    }
  };

  const setSelectedTaskId = (val) => {
    setSelectedTaskIdState(val);
    if (val) {
      localStorage.setItem('focus_selectedTaskId', val);
    } else {
      localStorage.removeItem('focus_selectedTaskId');
    }
  };

  // AudioContext synthesizer sound
  const playAlertSound = (type = 'success') => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      const playSpaceTone = (freq, startTime, duration, waveType = 'sine') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = waveType;
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      if (type === 'success') {
        // Sparkling space success chime (ascending major notes repeated twice)
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          playSpaceTone(freq, now + i * 0.1, 0.5, 'triangle');
        });
        notes.forEach((freq, i) => {
          playSpaceTone(freq, now + 0.45 + i * 0.1, 0.5, 'triangle');
        });
      } else {
        // Warm pulsing alarm drop chime
        const baseFreq = 880.00; // A5
        for (let pulse = 0; pulse < 3; pulse++) {
          playSpaceTone(baseFreq, now + pulse * 0.35, 0.28, 'sine');
          playSpaceTone(baseFreq * 0.75, now + pulse * 0.35 + 0.15, 0.28, 'sine');
        }
      }
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  };

  const requestNotificationPermission = () => {
    if (typeof Notification === 'undefined') return;
    Notification.requestPermission().then(permission => {
      setNotifyPermission(permission);
    });
  };

  const sendNotification = (title, body) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3239/3239347.png'
      });
    }
  };

  // Cloud Synchronization Helpers (One User, One Focus)
  const syncSessionToCloud = async (target, wDur, bDur, isBrk, taskId, flower) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API_URL}/pomodoro/active-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetEndTime: target,
          workDuration: wDur || 25,
          breakDuration: bDur || 5,
          isBreak: !!isBrk,
          selectedTaskId: taskId || '',
          selectedFlower: flower || localStorage.getItem('focus_selectedFlower') || 'sunflower'
        })
      });
    } catch (e) {
      console.warn('Cloud sync error:', e);
    }
  };

  const clearCloudSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API_URL}/pomodoro/active-session`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (e) {
      console.warn('Clear cloud session error:', e);
    }
  };

  const fetchCloudSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/pomodoro/active-session`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.activeFocusSession && data.activeFocusSession.targetEndTime) {
          const cloudSession = data.activeFocusSession;
          const remainingMs = cloudSession.targetEndTime - Date.now();
          if (remainingMs > 0) {
            setTargetEndTime(cloudSession.targetEndTime);
            setIsActive(true);
            setIsBreak(!!cloudSession.isBreak);
            if (cloudSession.workDuration) setWorkDurationState(cloudSession.workDuration);
            if (cloudSession.breakDuration) setBreakDurationState(cloudSession.breakDuration);
            if (cloudSession.selectedTaskId) setSelectedTaskIdState(cloudSession.selectedTaskId);
            if (cloudSession.selectedFlower) localStorage.setItem('focus_selectedFlower', cloudSession.selectedFlower);

            const totalSecs = Math.ceil(remainingMs / 1000);
            setMinutes(Math.floor(totalSecs / 60));
            setSeconds(totalSecs % 60);

            localStorage.setItem('focus_targetEndTime', cloudSession.targetEndTime.toString());
            localStorage.setItem('focus_isActive', 'true');
            localStorage.setItem('focus_isBreak', cloudSession.isBreak ? 'true' : 'false');
            if (cloudSession.selectedTaskId) {
              localStorage.setItem('focus_selectedTaskId', cloudSession.selectedTaskId);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Fetch cloud session error:', e);
    }
  };

  // Cross-device sync check on mount
  useEffect(() => {
    fetchCloudSession();
  }, []);

  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // Main countdown effect using timestamp calculation
  useEffect(() => {
    if (isActive && targetEndTime) {
      const tick = () => {
        const remainingMs = targetEndTime - Date.now();

        if (remainingMs <= 0) {
          // Clean 00:00 display before triggering completion
          setMinutes(0);
          setSeconds(0);
          setIsActive(false);
          setTargetEndTime(null);
          localStorage.removeItem('focus_targetEndTime');
          localStorage.setItem('focus_isActive', 'false');
          clearInterval(intervalRef.current);
          clearCloudSession();
          
          if (!isBreak) {
            // Work finished
            playAlertSound('success');
            sendNotification('สมาธิสำเร็จ! 🍅', `ครบรอบเวลาโฟกัส ${workDuration} นาทีแล้ว ได้เวลาพักผ่อน ${breakDuration} นาที`);
            setIsBreak(true);
            localStorage.setItem('focus_isBreak', 'true');
            setMinutes(breakDuration);
            setSeconds(0);
            
            let taskTitle = 'รอบโฟกัสทั่วไป';
            if (selectedTaskId && tasksRef.current) {
              const targetTask = tasksRef.current.find(t => t._id === selectedTaskId);
              if (targetTask) {
                taskTitle = targetTask.title;
                const updatedCycles = (targetTask.pomodoroCycles || 0) + 1;
                const updatedTime = (targetTask.timeSpent || 0) + workDuration * 60;
                updateTask(selectedTaskId, {
                  pomodoroCycles: updatedCycles,
                  timeSpent: updatedTime
                });
              }
            }

            // Record companion focus history (Plants & Guardians)
            try {
              const activeCompanion = localStorage.getItem('focus_selectedFlower') || 'sunflower';
              const historyStr = localStorage.getItem('focus_companion_history');
              const history = historyStr ? JSON.parse(historyStr) : {};
              history[activeCompanion] = (history[activeCompanion] || 0) + 1;
              localStorage.setItem('focus_companion_history', JSON.stringify(history));

              // Asynchronously record session & persist companion history to MongoDB Cloud
              const token = localStorage.getItem('token');
              if (token) {
                fetch(`${API_URL}/pomodoro/session`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    taskId: selectedTaskId || null,
                    duration: workDuration || 25,
                    companionType: activeCompanion
                  })
                })
                .then(res => res.json())
                .then(data => {
                  if (data?.companionHistory) {
                    localStorage.setItem('focus_companion_history', JSON.stringify(data.companionHistory));
                  }
                })
                .catch(e => console.warn('Record session cloud error:', e));
              }
            } catch (e) {
              console.error('Companion history error:', e);
            }

            // Display time spent summary popup ALWAYS on screen
            setSessionSummary({
              taskTitle: taskTitle,
              durationMins: workDuration,
              cycleCount: 1
            });
          } else {
            // Break finished
            playAlertSound('break');
            sendNotification('หมดเวลาพัก! 🌸', 'ได้เวลากลับมาฟูมฟักสวนสมาธิของคุณแล้วค่ะ');
            setIsBreak(false);
            localStorage.setItem('focus_isBreak', 'false');
            setMinutes(workDuration);
            setSeconds(0);
            setBreakSummary(true);
          }
        } else {
          const totalRemainingSecs = Math.ceil(remainingMs / 1000);
          setMinutes(Math.floor(totalRemainingSecs / 60));
          setSeconds(totalRemainingSecs % 60);
        }
      };

      // Immediate tick to eliminate 1-second start delay
      tick();
      intervalRef.current = setInterval(tick, 500);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, targetEndTime, isBreak, selectedTaskId, workDuration, breakDuration]);

  const toggleTimer = () => {
    if (!isActive) {
      // Starting or resuming timer
      const currentSecondsTotal = minutes * 60 + seconds;
      const newTarget = Date.now() + (currentSecondsTotal > 0 ? currentSecondsTotal : (isBreak ? breakDuration : workDuration) * 60) * 1000;
      
      setTargetEndTime(newTarget);
      setIsActive(true);
      
      localStorage.setItem('focus_targetEndTime', newTarget.toString());
      localStorage.setItem('focus_isActive', 'true');
      localStorage.setItem('focus_isBreak', isBreak ? 'true' : 'false');
      if (selectedTaskId) {
        localStorage.setItem('focus_selectedTaskId', selectedTaskId);
      }

      // Synchronize session to Cloud
      syncSessionToCloud(
        newTarget, 
        workDuration, 
        breakDuration, 
        isBreak, 
        selectedTaskId, 
        localStorage.getItem('focus_selectedFlower')
      );
    } else {
      // Pausing timer
      setIsActive(false);
      setTargetEndTime(null);
      
      localStorage.setItem('focus_isActive', 'false');
      localStorage.removeItem('focus_targetEndTime');
      clearCloudSession();
    }

    if (notifyPermission === 'default') {
      requestNotificationPermission();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTargetEndTime(null);
    setMinutes(workDuration);
    setSeconds(0);

    localStorage.setItem('focus_isActive', 'false');
    localStorage.setItem('focus_isBreak', 'false');
    localStorage.removeItem('focus_targetEndTime');
    clearCloudSession();
  };

  const clearLocalTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTargetEndTime(null);
    setMinutes(workDuration);
    setSeconds(0);

    localStorage.setItem('focus_isActive', 'false');
    localStorage.setItem('focus_isBreak', 'false');
    localStorage.removeItem('focus_targetEndTime');
    clearCloudSession();
  };

  const hasActiveSession = () => {
    if (isActive) return true;
    const savedActive = localStorage.getItem('focus_isActive') === 'true';
    const savedTarget = localStorage.getItem('focus_targetEndTime');
    if (savedTarget && parseInt(savedTarget, 10) > Date.now()) return true;
    if (savedActive) return true;
    const totalSecs = (isBreak ? breakDuration : workDuration) * 60;
    const currentSecs = (typeof minutes === 'number' ? minutes : 25) * 60 + (typeof seconds === 'number' ? seconds : 0);
    if (currentSecs > 0 && currentSecs < totalSecs) return true;
    return false;
  };

  return (
    <PomodoroContext.Provider value={{
      minutes,
      seconds,
      isActive,
      isBreak,
      targetEndTime,
      hasActiveSession,
      selectedTaskId,
      setSelectedTaskId,
      workDuration,
      setWorkDuration,
      breakDuration,
      setBreakDuration,
      toggleTimer,
      resetTimer,
      clearLocalTimer,
      fetchCloudSession,
      notifyPermission,
      requestNotificationPermission,
      sessionSummary,
      setSessionSummary,
      breakSummary,
      setBreakSummary
    }}>
      {children}
    </PomodoroContext.Provider>
  );
};
