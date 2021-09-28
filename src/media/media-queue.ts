import { MediaItem } from './media-item.model';

export class MediaQueue extends Array<MediaItem> {
    get first(): MediaItem {
        return this[0];
    }

    get last(): MediaItem {
        return this[this.length - 1];
    }

    enqueue(item: MediaItem): void {
        this.push(item);
    }

    dequeue(item?: MediaItem): MediaItem {
        if (item) {
            let idx = this.indexOf(item);
            if (idx > -1) this.splice(idx, 1);
            return item;
        } else return this.shift();
    }

    clear() {
        this.length = 0;
    }

    shuffle() {
        let currentIndex = this.length,
            temporaryValue,
            randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = this[currentIndex];
            this[currentIndex] = this[randomIndex];
            this[randomIndex] = temporaryValue;
        }
    }

    move(key1, key2) {
        if (key1 != key2) {
            this.splice(key2, 0, this.splice(key1, 1)[0]);
        }
    }
}
