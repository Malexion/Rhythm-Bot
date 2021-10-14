import { Migration } from '@mikro-orm/migrations';

export class Migration20211014085318 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `playlist` (`name` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, primary key (`name`));');

    this.addSql('create table `playlist_item` (`uuid` varchar not null, `created_at` datetime not null, `type` varchar not null, `url` varchar not null, `requestor` varchar not null, `name` varchar not null, `duration` varchar not null, primary key (`uuid`));');

    this.addSql('alter table `playlist_item` add column `playlist_name` varchar null;');
    this.addSql('create index `playlist_item_playlist_name_index` on `playlist_item` (`playlist_name`);');
  }

}
