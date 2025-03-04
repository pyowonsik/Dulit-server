import { Post } from "src/post/entity/post.entity";
import { User } from "src/user/entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class PostUserLike {
    @PrimaryColumn({
        name : "postId",
        type : "int8"
    })
    @ManyToOne(() => Post, (post) => post.likedUsers , {onDelete : 'CASCADE'})
    post : Post;

    @PrimaryColumn({
        name : "userId",
        type : "int8"
    })
    @ManyToOne(() => User,(user) => user.likedPosts , {onDelete : "CASCADE"})
    user : User;

    @Column()
    isLike : Boolean;
}