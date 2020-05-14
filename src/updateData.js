class Subscribers {
    constructor(){
        this.subscribers = [];
    }

    once(callback) {
        this.subscribers.push(callback);
    }

    onUpdateData(layout) {
        if(this.subscribers.length > 0) {
            const toCall = [...this.subscribers];
            this.subscribers = []; 
            toCall.forEach(callback => callback(layout));
        }
    }
}

export default Subscribers;