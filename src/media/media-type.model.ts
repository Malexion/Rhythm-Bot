import { Readable } from 'stream';
import { MediaItem } from './media-item.model';

export interface IMediaType {
    getDetails(item: MediaItem): Promise<MediaItem>;
    getStream(item: MediaItem): Promise<Readable>;
}
