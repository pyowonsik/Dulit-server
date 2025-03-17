import * as dotenv from 'dotenv';
import path from 'path';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Chat } from 'src/chat/entity/chat.entity';
import { Anniversary } from 'src/couple/anniversary/entity/anniversary.entity';
import { Calendar } from 'src/couple/calendar/entities/calendar.entity';
import { Couple } from 'src/couple/entity/couple.entity';
import { Plan } from 'src/couple/plan/entities/plan.entity';
import { CommentModel } from 'src/post/comment/entity/comment.entity';
import { PostUserLike } from 'src/post/comment/entity/post-user-like.entity';
import { Post } from 'src/post/entity/post.entity';
import { User } from 'src/user/entity/user.entity';
import { DataSource } from 'typeorm';

dotenv.config();

export default new DataSource({
  type: process.env.DB_TYPE as 'postgres',
  url : process.env.DB_URL,
  synchronize: false,
  logging: false,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
});
