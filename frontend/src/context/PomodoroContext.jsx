import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { TaskContext } from './TaskContext';

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
      const remainingSecs = Math.max(0, Math.floor((parseInt(savedTarget, 10) - Date.now()) / 1000));
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
      const remainingSecs = Math.max(0, Math.floor((parseInt(savedTarget, 10) - Date.now()) / 1000));
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
  };

  const setBreakDuration = (val) => {
    setBreakDurationState(val);
    localStorage.setItem('focus_breakDuration', val.toString());
  };

  const setSelectedTaskId = (val) => {
    setSelectedTaskIdState(val);
    if (val) {
      localStorage.setItem('focus_selectedTaskId', val);
    } else {
      localStorage.removeItem('focus_selectedTaskId');
    }
  };

  // Sync timer display with custom durations when not active
  useEffect(() => {
    if (!isActive && !isBreak) {
      setMinutes(workDuration);
      setSeconds(0);
    }
  }, [workDuration, isActive, isBreak]);

  useEffect(() => {
    if (!isActive && isBreak) {
      setMinutes(breakDuration);
      setSeconds(0);
    }
  }, [breakDuration, isActive, isBreak]);

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

  // Main countdown effect using timestamp calculation
  useEffect(() => {
    if (isActive && targetEndTime) {
      intervalRef.current = setInterval(() => {
        const remainingMs = targetEndTime - Date.now();
        const totalRemainingSecs = Math.max(0, Math.ceil(remainingMs / 1000));

        if (totalRemainingSecs <= 0) {
          // Timer Finished!
          setIsActive(false);
          setTargetEndTime(null);
          localStorage.removeItem('focus_targetEndTime');
          localStorage.setItem('focus_isActive', 'false');
          clearInterval(intervalRef.current);
          
          if (!isBreak) {
            // Work finished
            playAlertSound('success');
            sendNotification('สมาธิสำเร็จ! 🍅', `ครบรอบเวลาโฟกัส ${workDuration} นาทีแล้ว ได้เวลาพักผ่อน ${breakDuration} นาที`);
            setIsBreak(true);
            localStorage.setItem('focus_isBreak', 'true');
            setMinutes(breakDuration);
            setSeconds(0);
            
            let taskTitle = 'รอบโฟกัสทั่วไป';
            if (selectedTaskId) {
              const targetTask = tasks.find(t => t._id === selectedTaskId);
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
          setMinutes(Math.floor(totalRemainingSecs / 60));
          setSeconds(totalRemainingSecs % 60);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, targetEndTime, isBreak, selectedTaskId, tasks, workDuration, breakDuration]);

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
    } else {
      // Pausing timer
      setIsActive(false);
      setTargetEndTime(null);
      
      localStorage.setItem('focus_isActive', 'false');
      localStorage.removeItem('focus_targetEndTime');
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
  };

  return (
    <PomodoroContext.Provider value={{
      minutes,
      seconds,
      isActive,
      isBreak,
      selectedTaskId,
      setSelectedTaskId,
      workDuration,
      setWorkDuration,
      breakDuration,
      setBreakDuration,
      toggleTimer,
      resetTimer,
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
