import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

// Entity Inharitance
export class BaseTable {
  @CreateDateColumn()
  @Exclude()
  @ApiHideProperty()
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  @Exclude()
  @ApiHideProperty()
  updatedAt: Date;

  @VersionColumn({ select: false })
  @Exclude()
  @ApiHideProperty()
  version: number;
}