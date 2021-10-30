import { Entity, Property, PrimaryKey, OneToMany, Collection } from '@mikro-orm/core';
import { MediaItem } from './media-item.model';

@Entity()
export class Playlist {
    @PrimaryKey()
    name: string;

    @Property()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();

    @Property({ type: 'json' })
    list: MediaItem[] = [];
}
