import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { TaskContext } from './TaskContext';

export const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const { tasks, updateTask } = useContext(TaskContext);

  const [workDuration, setWorkDuration] = useState(25); // Customizable work duration
  const [breakDuration, setBreakDuration] = useState(5);   // Customizable break duration

  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  // Track notification completion summary popup
  const [sessionSummary, setSessionSummary] = useState(null); // { taskTitle, durationMins, cycleCount }
  const [breakSummary, setBreakSummary] = useState(false); // Track break completion popup
  
  const [notifyPermission, setNotifyPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const intervalRef = useRef(null);

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

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer Finished!
            setIsActive(false);
            clearInterval(intervalRef.current);
            
            if (!isBreak) {
              // Work finished
              playAlertSound('success');
              sendNotification('สมาธิสำเร็จ! 🍅', `ครบรอบเวลาโฟกัส ${workDuration} นาทีแล้ว ได้เวลาพักผ่อน ${breakDuration} นาที`);
              setIsBreak(true);
              setMinutes(breakDuration); // Use customizable break
              
              let taskTitle = 'รอบโฟกัสทั่วไป';
              if (selectedTaskId) {
                const targetTask = tasks.find(t => t._id === selectedTaskId);
                if (targetTask) {
                  taskTitle = targetTask.title;
                  const updatedCycles = (targetTask.pomodoroCycles || 0) + 1;
                  const updatedTime = (targetTask.timeSpent || 0) + workDuration * 60; // Use customizable workDuration
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
              setMinutes(workDuration);
              setBreakSummary(true);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, minutes, seconds, isBreak, selectedTaskId, tasks, workDuration, breakDuration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (notifyPermission === 'default') {
      requestNotificationPermission();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(workDuration);
    setSeconds(0);
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
