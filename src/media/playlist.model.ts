import { Entity, Property, PrimaryKey, OneToMany } from '@mikro-orm/core';
import { MediaItem } from './media-item.model';

@Entity()
export class Playlist {
    @PrimaryKey()
    name: string;

    @Property()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();

    @OneToMany(() => MediaItem, (item) => item.playlist)
    list?: Array<MediaItem>;
}
