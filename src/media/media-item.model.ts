import { Entity, Property, PrimaryKey, ManyToOne } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Playlist } from './playlist.model';

@Entity({ tableName: 'playlist_item' })
export class MediaItem {
    @PrimaryKey({ type: 'string' })
    uuid: string = uuidv4();

    @Property()
    createdAt: Date = new Date();

    @ManyToOne(() => Playlist)
    playlist: Playlist;

    @Property()
    type: string;

    @Property()
    url: string;

    @Property()
    requestor?: string;

    @Property()
    name?: string;

    @Property()
    duration?: string;
}
