class CustomEvents {
    listeners = {};
    listenersOnce = {};
    unconsumedEvents = [];

    dispatch(eventName, eventData = null) {
        let dispatched = false;

        const listenersOnce = this.listenersOnce[eventName];
        while (listenersOnce && listenersOnce.length > 0) {
            const next = listenersOnce.shift();
            next(eventData);
            dispatched = true;
        }

        const listeners = this.listeners[eventName];
        if(listeners && listeners.length > 0) {
            listeners.forEach(listener => {
                listener(eventData);
                dispatched = true;
            });
        }

        if (!dispatched)
            this.unconsumedEvents.push([eventName, eventData]);
    }

    listen(eventName, listener) {
        if(!(eventName in this.listeners))
            this.listeners[eventName] = [];

        this.listeners[eventName].push(listener);
        this.checkLazyDispatch(eventName);
    }

    listenOnce(eventName, listener) {
        if(!(eventName in this.listenersOnce))
            this.listenersOnce[eventName] = [];

        this.listenersOnce[eventName].push(listener);
        this.checkLazyDispatch(eventName);
    }

    checkLazyDispatch(eventName) {
        this.unconsumedEvents.forEach(([unconsumedEventName, unconsumedEventData], i) => {
            if(unconsumedEventName !== eventName)
                return;

            this.dispatch(...this.unconsumedEvents[i]);
            this.unconsumedEvents.splice(i, 1);
        });
    }
}

const customEvents = new CustomEvents();
