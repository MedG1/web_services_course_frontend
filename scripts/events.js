class Events {
    constructor(host) {
        this.host = host;
        new Emitter(host); // add simple event system
        host.on = (eventName, func) => {
            host.addEventListener(eventName, func);
            return host;
        }
    }

    trigger(event, detail, ev) {
        if (typeof (event) === "object" && event instanceof Event)
            return this.host.dispatchEvent(event);

        if (!ev)
            ev = new Event(event, { bubbles: false, cancelable: true });

        ev.detail = { ...(detail || {}), host: this.host };

        return this.host.dispatchEvent(ev);
    }
}

export default Events;
