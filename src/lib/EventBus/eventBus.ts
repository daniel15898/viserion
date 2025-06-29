// Constraint to ensure EventMap only contains function types
// Using any[] here is intentional - it allows any function signature
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventMap = Record<string | symbol, (...args: any[]) => void>;
type Listeners<T extends EventMap> = T[keyof T][];

export class EventBus<T extends EventMap> {
  private listeners: Map<keyof T, Listeners<T>> = new Map();

  /**
   * Add an event listener
   */
  on<K extends keyof T>(event: K, listener: T[K]): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const eventListeners = this.listeners.get(event)!;
    eventListeners.push(listener);

    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  /**
   * Remove an event listener
   */
  off<K extends keyof T>(event: K, listener: T[K]): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    const index = eventListeners.indexOf(listener);
    if (index > -1) {
      eventListeners.splice(index, 1);
    }

    // Clean up empty arrays
    if (eventListeners.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Emit an event to all listeners
   */
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    // Create a copy to avoid issues with listeners being removed during emission
    const listenersCopy = [...eventListeners];
    listenersCopy.forEach((listener) => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for "${String(event)}":`, error);
      }
    });
  }

  /**
   * Remove all listeners for a specific event, or all listeners if no event specified
   */
  removeAllListeners(event?: keyof T): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount(event: keyof T): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.length : 0;
  }

  /**
   * Get all event names that have listeners
   */

  eventNames() {
    return Array.from(this.listeners.keys());
  }
}

export const eventBus = new EventBus();
