import { Migration } from '@mikro-orm/migrations';

export class Migration20211014120158 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `playlist` (`name` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `list` json not null, primary key (`name`));');
  }

}
