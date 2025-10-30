/**
 * Zustand store for UI state management.
 * Manages modals, alerts, and other ephemeral UI state.
 */

import { create } from 'zustand';

interface Modal {
  id: string;
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
}

interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoClose?: boolean;
}

interface UIStore {
  // State
  modals: Modal[];
  alerts: Alert[];
  
  // Actions
  openModal: (id: string, title?: string, content?: React.ReactNode) => void;
  closeModal: (id: string) => void;
  showAlert: (type: Alert['type'], message: string, autoClose?: boolean) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
}

let alertIdCounter = 0;

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  modals: [],
  alerts: [],
  
  // Actions
  openModal: (id, title, content) =>
    set((state) => ({
      modals: [
        ...state.modals.filter((m) => m.id !== id),
        { id, isOpen: true, title, content },
      ],
    })),
  
  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.map((m) =>
        m.id === id ? { ...m, isOpen: false } : m
      ),
    })),
  
  showAlert: (type, message, autoClose = true) =>
    set((state) => {
      const id = `alert-${++alertIdCounter}`;
      const alert: Alert = { id, type, message, autoClose };
      
      // Auto-dismiss after 5 seconds if autoClose is true
      if (autoClose) {
        setTimeout(() => {
          set((state) => ({
            alerts: state.alerts.filter((a) => a.id !== id),
          }));
        }, 5000);
      }
      
      return {
        alerts: [...state.alerts, alert],
      };
    }),
  
  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),
  
  clearAlerts: () =>
    set({
      alerts: [],
    }),
}));
