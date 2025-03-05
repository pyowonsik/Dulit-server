import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

// Entity Inharitance
export class BaseTable {
  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  @Exclude()
  updatedAt: Date;

  @VersionColumn({ select: false })
  @Exclude()
  version: number;
}